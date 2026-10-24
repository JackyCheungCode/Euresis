import { leads, loadLeads } from '../data/lead.js';
import { panelNoPad } from './panel.js';
import { table } from './table.js';
import { tag } from './tag.js';
import { integrationClient, loadIntegrations, listIntegrations } from '../services/integrations.js';
import { supabase } from '../services/supabase.js';
import { showToast } from './toast.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const STAGES = {
  scrape: { title:'公开信号抓取', desc:'通过 Tavily 查询公开网页内容，并将摘要保存到当前账号的线索记录。', provider:'tavily', action:'抓取公开信号', columns:['企业','网站','公开信号摘要','处理状态'] },
  enrich: { title:'联系方式补齐', desc:'调用已配置的 Apollo 企业接口，保存返回的企业补全数据；API 返回哪些字段，就只更新哪些字段。', provider:'apollo', action:'补齐企业信息', columns:['企业','网站','联系人','邮箱','电话','处理状态'] },
  verify: { title:'联系方式验证', desc:'调用 Hunter 检查已有邮箱；没有邮箱时尝试按域名发现公开邮箱。', provider:'hunter', action:'验证联系方式', columns:['企业','邮箱','邮箱状态','电话','处理状态'] },
  research: { title:'企业背调', desc:'使用 Tavily 汇总企业公开新闻、融资、招聘和扩张信号，结果保存在每条线索的研究数据中。', provider:'tavily', action:'运行企业背调', columns:['企业','网站','研究摘要','研究状态'] },
  route: { title:'渠道路由', desc:'根据已验证的联系方式为线索分配后续渠道。此步骤不调用外部 API。', provider:null, action:'生成渠道路由', columns:['企业','邮箱','电话','路由结果','状态'] },
};
function stateLabel(lead, stage) {
  const data = lead.data || {};
  if (stage === 'scrape') return data.public_signals?.length ? '已抓取' : '待处理';
  if (stage === 'enrich') return data.enrichment ? '已补全' : '待处理';
  if (stage === 'verify') return data.emailStatus || '待验证';
  if (stage === 'research') return data.research ? '已完成' : '待处理';
  return data.route || '待分流';
}
function stageRows(stage) {
  return leads.map((lead, i) => {
    const data = lead.data || {};
    const name = escapeHtml(lead.title || lead.domain);
    const website = escapeHtml(lead.website || lead.domain || '—');
    if (stage === 'scrape') return [name, website, escapeHtml(data.public_signal_summary || '—'), tag(stateLabel(lead, stage), data.public_signals?.length ? 'green' : 'gray')];
    if (stage === 'enrich') return [name, website, escapeHtml(lead.contactName || data.enrichment?.contact_name || '—'), escapeHtml(lead.email || '—'), escapeHtml(lead.phone || '—'), tag(stateLabel(lead, stage), data.enrichment ? 'green' : 'gray')];
    if (stage === 'verify') return [name, escapeHtml(lead.email || '—'), tag(data.emailStatus || '待验证', data.emailStatus === 'valid' ? 'green' : 'gray'), escapeHtml(lead.phone || '—'), tag(stateLabel(lead, stage), data.emailStatus === 'valid' ? 'green' : 'gray')];
    if (stage === 'research') return [name, website, escapeHtml(data.research_summary || '—'), tag(stateLabel(lead, stage), data.research ? 'green' : 'gray')];
    return [name, escapeHtml(lead.email || '—'), escapeHtml(lead.phone || '—'), tag(data.route || '待分流', 'blue'), tag(lead.status || 'new', 'gray')];
  });
}
export function renderStagePage(stage) {
  const config = STAGES[stage];
  const rows = stageRows(stage);
  const empty = leads.length ? '' : '<div class="empty-state"><h3>当前账号还没有线索</h3><p>请先到「候选发现」运行已配置的搜索 API。所有阶段都读取真实 Supabase 数据，不再使用预置演示记录。</p></div>';
  const providerHint = config.provider ? `需要已启用的 ${config.provider} 服务。请先在侧边栏「API 与 AI 集成」保存并测试连接。` : '按数据库中的真实联系人字段生成路由规则。';
  return `
    <div class="notification"><span class="notif-icon">i</span><div>${escapeHtml(config.desc)}</div></div>
    <section class="panel stage-action-panel"><div class="panel-header"><div><h2>${escapeHtml(config.title)}</h2><p class="panel-meta">${escapeHtml(providerHint)}</p></div><button class="btn btn-primary btn-sm" type="button" data-run-stage="${stage}" ${leads.length ? '' : 'disabled'}>${escapeHtml(config.action)}</button></div><div class="panel-body"><p class="field-help" data-stage-message>当前账号共有 ${leads.length} 条线索；每次最多处理 10 条，失败记录会保留并显示原因。</p></div></section>
    ${panelNoPad(config.title + ' · 结果记录', rows.length ? table(config.columns, rows, config.title) : empty, `${leads.length} 条数据库记录`)}
  `;
}
export function bindStagePage(root, stage) {
  const button = root.querySelector('[data-run-stage]');
  const message = root.querySelector('[data-stage-message]');
  button?.addEventListener('click', async () => {
    button.disabled = true;
    const config = STAGES[stage];
    button.textContent = '处理中…';
    message.textContent = '正在连接 Supabase 并处理线索…';
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('登录会话已失效，请重新登录');
      await loadLeads();
      if (config.provider) {
        await loadIntegrations();
        const service = listIntegrations().find(item => item.id === config.provider && item.enabled);
        if (!service) throw new Error('请先在 API 与 AI 集成页面配置并启用 ' + config.provider);
      }
      const batch = leads.slice(0, 10);
      let success = 0;
      const errors = [];
      for (let index = 0; index < batch.length; index++) {
        const lead = batch[index];
        const data = { ...(lead.data || {}) };
        const patch = { data, updated_at: new Date().toISOString() };
        try {
          if (stage === 'scrape') {
            const result = await integrationClient.call('tavily', { query: [lead.title, lead.website || lead.domain].filter(Boolean).join(' '), max_results: 3 });
            data.public_signals = result.results || [];
            data.public_signal_summary = (data.public_signals || []).slice(0, 3).map(x => x.title || x.content || x.url).filter(Boolean).join(' · ').slice(0, 900);
            patch.status = 'scraped';
          } else if (stage === 'enrich') {
            const result = await integrationClient.call('apollo', { q_organization_name: lead.title, q_organization_domains: lead.domain ? [lead.domain] : [], per_page: 1 });
            const organization = result.organization || result.organizations?.[0] || result.account || result;
            data.enrichment = organization;
            const contact = result.contacts?.[0] || result.person || {};
            if (!lead.contactName && (contact.name || contact.first_name || contact.last_name)) patch.contact_name = contact.name || [contact.first_name, contact.last_name].filter(Boolean).join(' ');
            if (!lead.email && contact.email) patch.email = contact.email;
            if (!lead.phone && (contact.phone_number || organization.phone)) patch.phone = contact.phone_number || organization.phone;
            if (organization.name && !lead.companyName) patch.company_name = organization.name;
            if (organization.website_url && !lead.website) patch.website = organization.website_url;
          } else if (stage === 'verify') {
            if (!lead.email && !lead.domain) throw new Error('缺少邮箱或企业域名');
            const result = await integrationClient.call('hunter', lead.email ? { email: lead.email } : { domain: lead.domain });
            if (!lead.email && result.emails?.length) {
              patch.email = result.emails[0].value || result.emails[0].email;
              data.emailStatus = result.emails[0].verification?.status || result.emails[0].confidence ? 'valid' : 'discovered';
            } else {
              data.emailStatus = result.data?.status || result.status || result.result || 'checked';
            }
          } else if (stage === 'research') {
            const result = await integrationClient.call('tavily', { query: `${lead.title} ${lead.website || lead.domain} company news funding hiring growth`, max_results: 5 });
            data.research = result.results || [];
            data.research_summary = (data.research || []).slice(0, 5).map(x => x.title || x.content || x.url).filter(Boolean).join(' · ').slice(0, 1500);
            data.research_completed = true;
          } else if (stage === 'route') {
            const email = lead.email && lead.email !== '—';
            const phone = lead.phone && lead.phone !== '—';
            data.route = email && phone ? '邮件 + 电话' : email ? '邮件序列' : phone ? '电话外呼' : '人工补全';
            data.route_updated_at = new Date().toISOString();
            patch.status = 'routed';
          }
          const { error } = await supabase.from('leads').update(patch).eq('id', lead.id).eq('user_id', user.id);
          if (error) throw error;
          success++;
        } catch (error) {
          errors.push((lead.title || lead.domain) + '：' + (error.message || '处理失败'));
          const { error: saveError } = await supabase.from('leads').update({ data: { ...data, stage_errors: { ...(data.stage_errors || {}), [stage]: error.message || '处理失败' } }, updated_at: new Date().toISOString() }).eq('id', lead.id).eq('user_id', user.id);
          if (saveError) console.error(saveError);
        }
        message.textContent = `处理进度 ${index + 1}/${batch.length}；成功 ${success} 条。`;
      }
      await loadLeads();
      message.textContent = `处理结束：成功 ${success} 条，失败 ${errors.length} 条。` + (errors.length ? ' 首个错误：' + errors[0] : '');
      showToast(`${config.action}完成：成功 ${success} 条，失败 ${errors.length} 条`);
      document.dispatchEvent(new CustomEvent('euresis:leads-updated'));
    } catch (error) {
      message.textContent = error.message || '阶段处理失败';
      showToast('处理失败：' + (error.message || '未知错误'));
    } finally {
      button.disabled = false;
      button.textContent = config.action;
    }
  });
}
