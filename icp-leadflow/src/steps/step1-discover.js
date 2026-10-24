import { leads, loadLeads } from '../data/lead.js';
import { panelNoPad, panel } from '../components/panel.js';
import { table } from '../components/table.js';
import { tag, statusTag } from '../components/tag.js';
import { integrationClient, listIntegrations, loadIntegrations } from '../services/integrations.js';
import { supabase } from '../services/supabase.js';
import { showToast } from '../components/toast.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderStep1() {
  const rows = leads.map((lead, index) => [
    index + 1, `<span class="mono">${esc(lead.domain)}</span>`, esc(lead.title),
    tag(lead.source || '—', 'gray'), esc(lead.region || '—'), statusTag(lead.status || 'new'),
  ]);
  const empty = leads.length ? '' : '<div class="empty-state"><h3>还没有候选企业</h3><p>先在「ICP 定义」保存目标市场，然后在「API 与 AI 集成」启用 Serper 或 Tavily，点击运行搜索获取真实候选结果。</p></div>';
  return `
    <div class="notification"><span class="notif-icon">i</span><div>此阶段只写入当前账号的真实搜索结果。不会再显示预置演示企业；搜索前请先配置并启用 Serper 或 Tavily。</div></div>
    <section class="panel discover-panel"><div class="panel-header"><div><h2>候选企业发现</h2><p class="panel-meta">搜索服务 · ICP 条件驱动</p></div><button type="button" id="discoverLeads" class="btn btn-primary btn-sm">运行企业搜索</button></div><div class="panel-body"><p id="discoverMessage" class="field-help">点击运行后，结果将保存至 Supabase 并显示在下方表格。</p></div></section>
    ${panelNoPad('候选企业列表', rows.length ? table(['#','企业域名','企业名称','来源','市场','状态'], rows, '候选企业') : empty, `${leads.length} 条数据库记录`)}
    ${panel('数据来源', '<p class="helper-copy">Serper 用于 Google 搜索结果发现；Tavily 用于网页搜索与研究。搜索结果只代表公开页面线索，企业匹配与联系人补全需要后续步骤及对应 API 服务。</p>')}
  `;
}
export function bindStep1(root) {
  const button = root.querySelector('#discoverLeads');
  const message = root.querySelector('#discoverMessage');
  button?.addEventListener('click', async () => {
    button.disabled = true;
    let runId = null;
    button.textContent = '正在搜索…';
    message.textContent = '正在读取 ICP 条件并检查可用搜索服务…';
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('登录状态已失效，请重新登录');
      const { data: profile, error: profileError } = await supabase.from('icp_profiles').select('criteria').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1).maybeSingle();
      if (profileError) throw profileError;
      const criteria = profile?.criteria || {};
      const parts = [criteria['layer-0-field-0'], criteria['layer-0-field-4'], criteria['layer-0-field-5'], criteria['layer-0-field-8']].filter(Boolean);
      const query = parts.length ? parts.join(' ') + ' companies' : 'B2B companies distributors manufacturers';
      await loadIntegrations();
      const configs = listIntegrations();
      const provider = configs.find(c => c.id === 'serper' && c.enabled) || configs.find(c => c.id === 'tavily' && c.enabled);
      if (!provider) throw new Error('请先在「API 与 AI 集成」保存并启用 Serper 或 Tavily');
      const { data: runRow, error: runError } = await supabase.from('workflow_runs').insert({ user_id: user.id, workflow_key: 'discover', current_step: 1, status: 'running', input: { query, provider: provider.id } }).select('id').single();
      if (runError) throw runError;
      runId = runRow.id;
      const response = await integrationClient.call(provider.id, { query, num: 10, max_results: 10 });
      const results = provider.id === 'serper' ? (response.organic || []) : (response.results || []);
      if (!results.length) throw new Error('API 请求成功，但没有返回可用的搜索结果');
      const records = results.map(item => {
        const url = item.link || item.url || '';
        let host = url;
        try { host = new URL(url).hostname.replace(/^www\./, ''); } catch {}
        return {
          user_id: user.id,
          company_name: String(item.title || host || '未命名企业').slice(0, 240),
          website: url,
          country_region: criteria['layer-0-field-5'] || null,
          industry: criteria['layer-0-field-0'] || null,
          employee_range: criteria['layer-0-field-1'] || null,
          company_type: criteria['layer-0-field-4'] || null,
          supply_chain_role: criteria['layer-0-field-8'] || null,
          source: provider.id,
          status: 'new',
          data: { snippet: item.snippet || item.content || '', search_query: query, search_position: item.position || null },
          updated_at: new Date().toISOString(),
        };
      }).filter(record => record.website);
      if (!records.length) throw new Error('搜索返回结果中没有可保存的 URL');
      const { error: saveError } = await supabase.from('leads').upsert(records, { onConflict: 'user_id,website' });
      if (saveError) throw saveError;
      await loadLeads();
      message.textContent = `搜索完成：获取 ${records.length} 条结果，已写入 Supabase。`;
      await supabase.from('workflow_runs').update({ status: 'completed', output: { count: records.length, provider: provider.id }, updated_at: new Date().toISOString() }).eq('id', runId).eq('user_id', user.id);
      showToast(`已保存 ${records.length} 条候选企业`);
      document.dispatchEvent(new CustomEvent('euresis:leads-updated'));
    } catch (error) {
      if (runId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from('workflow_runs').update({ status: 'failed', error_message: error.message || '搜索失败', updated_at: new Date().toISOString() }).eq('id', runId).eq('user_id', user.id);
      }
      message.textContent = error.message || '搜索失败';
      showToast('企业搜索失败：' + (error.message || '未知错误'));
    } finally {
      button.disabled = false;
      button.textContent = '运行企业搜索';
    }
  });
}
