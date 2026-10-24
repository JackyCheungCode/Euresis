import { icpLayers, aiSchema } from '../data/icp.js';
import { optionsForField, optionLabel, optionValue, MARKET_OPTIONS } from '../data/icp-options.js';
import { panelNoPad } from '../components/panel.js';
import { tag } from '../components/tag.js';
import { showToast } from '../components/toast.js';
import { supabase } from '../services/supabase.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let savedProfileId = null;
const MODELS = [
  { value: 'gpt-4o-mini', label: 'OpenAI · gpt-4o-mini' },
  { value: 'gpt-4o', label: 'OpenAI · gpt-4o' },
  { value: 'claude-3-5-haiku-latest', label: 'Anthropic · Claude Haiku' },
  { value: 'claude-sonnet-4-20250514', label: 'Anthropic · Claude Sonnet 4' },
];
function renderSelect(key, options, selected, label) {
  const normalized = [{ value: '', label: '不限 / 请选择' }, ...options.map(option => ({
    value: String(optionValue(option)), label: optionLabel(option),
    flag: typeof option === 'object' ? option.flag : null,
  }))];
  const choice = normalized.find(option => option.value === String(selected ?? '')) || normalized[0];
  return `<div class="cds-select icp-carbon-select" data-select-wrap="${escapeHtml(key)}">
    <button type="button" class="cds-select-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="${escapeHtml(label)}">
      <span class="cds-select-current">${choice.flag ? `<span class="flag-circle" aria-hidden="true">${choice.flag}</span>` : ''}${escapeHtml(choice.label)}</span><span class="cds-select-chevron" aria-hidden="true">⌄</span>
    </button>
    <div class="cds-select-menu" role="listbox" aria-label="${escapeHtml(label)}" hidden>
      ${normalized.map(option => `<button type="button" class="cds-select-option" role="option" data-value="${escapeHtml(option.value)}" aria-selected="${option.value === choice.value}">${option.flag ? `<span class="flag-circle" aria-hidden="true">${option.flag}</span>` : ''}<span>${escapeHtml(option.label)}</span></button>`).join('')}
    </div>
    <input type="hidden" data-icp-field="${escapeHtml(key)}" value="${escapeHtml(choice.value)}">
  </div>`;
}
function modelSelect() {
  const selected = 'gpt-4o-mini';
  return renderSelect('aiModel', MODELS, selected, '选择 AI 模型');
}
function queryPreview(root) {
  const layers = [...root.querySelectorAll('.icp-layer')];
  const selections = layers.map(layer => [...layer.querySelectorAll('.icp-field')].map(field => ({
    label: field.querySelector('label')?.textContent?.trim() || '',
    value: field.querySelector('[data-icp-field]')?.value || '',
  })).filter(item => item.value && item.value !== '不限' && item.value !== '不排除'));
  const format = items => items.length
    ? items.map(item => `${item.label}：${item.value}`).join('；')
    : '';
  const companyTerms = [...(selections[0] || []), ...(selections[2] || [])];
  const company = root.querySelector('[data-query-preview]');
  const persona = root.querySelector('[data-persona-preview]');
  const exclusion = root.querySelector('[data-exclusion-preview]');
  if (company) company.textContent = format(companyTerms) || '选择行业、国家/地区、规模或购买信号后，实时生成筛选条件';
  if (persona) persona.textContent = format(selections[1] || []) || '选择目标职位、决策权限、部门或资历层级';
  if (exclusion) exclusion.textContent = format(selections[3] || []) || '选择需要排除的行业、地域、规模或状态';
}
export function renderStep0() {
  const layersHtml = icpLayers.map((layer, i) => `
    <section class="icp-layer ${i === 0 ? 'open' : ''}">
      <h3 class="icp-layer-heading"><button class="icp-layer-header" type="button" aria-expanded="${i === 0 ? 'true' : 'false'}"><span>${escapeHtml(layer.title)}</span><span class="icp-layer-chevron" aria-hidden="true">⌄</span></button></h3>
      <div class="icp-layer-body" ${i === 0 ? '' : 'hidden'}>
        <div class="icp-field-grid">
          ${layer.fields.map((field, fieldIndex) => {
            const key = `layer-${i}-field-${fieldIndex}`;
            return `<div class="icp-field"><label>${escapeHtml(field.label)}</label>${renderSelect(key, optionsForField(field.label), '', field.label)}</div>`;
          }).join('')}
        </div>
      </div>
    </section>`).join('');
  const queries = [
    ['企业筛选', 'data-query-preview'],
    ['联系人角色', 'data-persona-preview'],
    ['排除规则', 'data-exclusion-preview'],
  ];
  return `
    <div class="notification"><span class="notif-icon" aria-hidden="true">i</span><div>定义你的目标客户标准。行业、员工区间、公司类型、国家/地区及其余可枚举字段均使用 Carbon 风格自定义选择器；保存后将写入当前账号的 Supabase 数据库。</div></div>
    <section class="icp-definition-section" aria-labelledby="icpDefinitionTitle">
      <div class="icp-section-heading"><div><h2 id="icpDefinitionTitle">ICP 定义</h2><p>四层筛选条件 · 按需选择，无需手动输入</p></div><div class="icp-section-actions"><button class="btn btn-ghost btn-sm" type="button" id="resetIcpFields">清空条件</button><button class="btn btn-primary btn-sm" type="button" id="saveIcpFields">保存 ICP</button></div></div>
      ${layersHtml}
    </section>
    <div class="two-col icp-support-grid">
      ${panelNoPad('实时查询预览', `<div class="generated-queries"><div class="generated-query"><span class="query-note">当前筛选</span><code data-query-preview>请先选择筛选条件</code></div><div class="generated-query"><span class="query-note">目标联系人</span><code data-persona-preview>选择职位、部门与资历层级</code></div><div class="generated-query"><span class="query-note">排除规则</span><code data-exclusion-preview>按需配置排除条件</code></div></div>`)}
      <section class="panel icp-schema-panel"><div class="panel-header"><h2>AI 判定 Schema</h2><span class="panel-meta">结构化输出字段</span></div><div class="panel-body"><div class="field-tags">${aiSchema.map(field => tag(field, 'blue')).join('')}</div><div class="model-picker-wrap"><label class="form-label">AI 模型</label>${modelSelect()}<p class="field-help">仅显示常用模型。实际调用前需在「API 与 AI 集成」配置对应服务及可用模型。</p></div></div></section>
    </div>`;
}
function updateSelectedLabel(wrap, option) {
  const label = wrap.querySelector('.cds-select-current');
  label.innerHTML = '';
  if (option.querySelector('.flag-circle')) label.append(option.querySelector('.flag-circle').cloneNode(true));
  const text = document.createElement('span');
  text.textContent = option.querySelector('span:last-child')?.textContent || option.textContent.trim();
  label.append(text);
}
function bindSelects(root) {
  root.querySelectorAll('.cds-select-trigger').forEach(trigger => trigger.addEventListener('click', () => {
    const wrap = trigger.closest('.cds-select');
    const menu = wrap.querySelector('.cds-select-menu');
    const willOpen = menu.hidden;
    root.querySelectorAll('.cds-select-menu').forEach(other => {
      other.hidden = true;
      other.closest('.cds-select').querySelector('.cds-select-trigger').setAttribute('aria-expanded', 'false');
    });
    menu.hidden = !willOpen;
    trigger.setAttribute('aria-expanded', String(willOpen));
  }));
  root.querySelectorAll('.cds-select-option').forEach(option => option.addEventListener('click', () => {
    const wrap = option.closest('.cds-select');
    const field = wrap.querySelector('input[type="hidden"]');
    field.value = option.dataset.value;
    updateSelectedLabel(wrap, option);
    wrap.querySelector('.cds-select-menu').hidden = true;
    wrap.querySelector('.cds-select-trigger').setAttribute('aria-expanded', 'false');
    wrap.querySelectorAll('.cds-select-option').forEach(item => item.setAttribute('aria-selected', String(item === option)));
    queryPreview(root);
    queryPreview(root);
  }));
}
export function bindStep0(root) {
  bindSelects(root);
  root.querySelectorAll('.icp-layer-header').forEach(button => button.addEventListener('click', () => {
    const layer = button.closest('.icp-layer');
    const body = layer.querySelector('.icp-layer-body');
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    layer.classList.toggle('open', open);
    body.hidden = !open;
  }));
  const modelWrap = root.querySelector('[data-select-wrap="aiModel"]');
  root.querySelector('#saveIcpFields')?.addEventListener('click', async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) { showToast('登录状态已过期，请重新登录'); return; }
    const criteria = {};
    root.querySelectorAll('[data-icp-field]').forEach(input => { criteria[input.dataset.icpField] = input.value; });
    const payload = { user_id: user.id, name: '默认 ICP', criteria, updated_at: new Date().toISOString() };
    const button = root.querySelector('#saveIcpFields');
    button.disabled = true;
    try {
      let result;
      if (savedProfileId) result = await supabase.from('icp_profiles').update(payload).eq('id', savedProfileId).select('id').single();
      else result = await supabase.from('icp_profiles').insert(payload).select('id').single();
      if (result.error) throw result.error;
      savedProfileId = result.data.id;
      showToast('ICP 条件已保存到 Supabase');
    } catch (error) { showToast('保存失败：' + (error.message || '数据库错误')); }
    finally { button.disabled = false; }
  });
  root.querySelector('#resetIcpFields')?.addEventListener('click', async () => {
    root.querySelectorAll('[data-icp-field]').forEach(input => {
      input.value = '';
      const wrap = input.closest('.cds-select');
      const first = wrap.querySelector('.cds-select-option[data-value=""]');
      if (first) {
        updateSelectedLabel(wrap, first);
        wrap.querySelectorAll('.cds-select-option').forEach(item => item.setAttribute('aria-selected', String(item === first)));
      }
    });
    if (savedProfileId) {
      const { error } = await supabase.from('icp_profiles').delete().eq('id', savedProfileId);
      if (error) { showToast('清空数据库条件失败：' + error.message); return; }
      savedProfileId = null;
    }
    queryPreview(root);
    showToast('已清空当前 ICP 条件');
  });
  root.querySelectorAll('[data-icp-field]').forEach(input => {
    input.addEventListener('change', () => queryPreview(root));
  });
  supabase.auth.getUser().then(async ({ data: { user } }) => {
    if (!user) return;
    const { data, error } = await supabase.from('icp_profiles').select('id,criteria').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1).maybeSingle();
    if (error || !data) return;
    savedProfileId = data.id;
    Object.entries(data.criteria || {}).forEach(([key, value]) => {
      const input = root.querySelector(`[data-icp-field="${key}"]`);
      if (!input) return;
      input.value = String(value ?? '');
      const wrap = input.closest('.cds-select');
      const option = [...wrap.querySelectorAll('.cds-select-option')].find(item => item.dataset.value === input.value);
      if (option) {
        updateSelectedLabel(wrap, option);
        wrap.querySelectorAll('.cds-select-option').forEach(item => item.setAttribute('aria-selected', String(item === option)));
      }
    });
    queryPreview(root);
  });
  if (modelWrap) {
    const stored = localStorage.getItem('euresis.icp.model');
    if (stored) {
      const hidden = modelWrap.querySelector('input[type="hidden"]');
      const option = [...modelWrap.querySelectorAll('.cds-select-option')].find(item => item.dataset.value === stored);
      if (hidden && option) {
        hidden.value = stored;
        updateSelectedLabel(modelWrap, option);
      }
    }
    modelWrap.querySelectorAll('.cds-select-option').forEach(option => option.addEventListener('click', () => localStorage.setItem('euresis.icp.model', option.dataset.value)));
  }
}
