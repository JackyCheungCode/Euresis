import { listIntegrations, saveIntegration, resetIntegrations, integrationClient, loadIntegrations } from '../services/integrations.js';
import { showToast } from '../components/toast.js';

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let busy = new Set();
let messages = {};

const AUTH_OPTIONS = [
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'x-api-key', label: 'X-API-KEY' },
  { value: 'query-key', label: 'Query 参数 API Key' },
  { value: 'anthropic', label: 'Anthropic x-api-key' },
  { value: 'none', label: '无认证' },
];
const METHOD_OPTIONS = ['GET','POST','PUT','PATCH','DELETE','HEAD'].map(value => ({ value, label: value }));
const METHOD_LABELS = { tavily: 'POST', serper: 'POST', deepl: 'POST', openai: 'GET / POST', anthropic: 'POST', apollo: 'GET / POST', hunter: 'GET', apify: 'GET / POST', n8n: 'POST' };
const MODEL_OPTIONS = {
  openai: ['gpt-4o','gpt-4o-mini','gpt-4.1','gpt-4.1-mini','o3','o4-mini','自定义模型 ID'],
  anthropic: ['claude-sonnet-4-20250514','claude-3-7-sonnet-latest','claude-3-5-haiku-latest','claude-opus-4-1','自定义模型 ID'],
  custom: ['gpt-4o-mini','gpt-4o','gpt-4.1','gpt-4.1-mini','自定义模型 ID'],
};
function modelControl(config) {
  const known = MODEL_OPTIONS[config.id] || [];
  const selected = known.includes(config.model) ? config.model : '自定义模型 ID';
  const options = known.map(value => ({ value: value === '自定义模型 ID' ? '__custom__' : value, label: value }));
  const custom = selected === '自定义模型 ID';
  return `<div class="integration-field"><label>模型</label>${customSelect('modelPreset', selected === '自定义模型 ID' ? '__custom__' : selected, options, '模型')}<cds-text-input class="model-custom-input" data-field="model" type="text" autocomplete="off" placeholder="输入服务支持的模型 ID" value="${escapeHtml(custom ? config.model || '' : config.model || '')}" ${custom ? '' : 'hidden'} aria-label="输入服务支持的模型 ID"></cds-text-input><span class="field-help">选择模型或切换到自定义模型 ID。</span></div>`;
}
function customSelect(id, selected, options, label) {
  const choice = options.find(option => option.value === selected) || options[0];
  return `<div class="cds-select" data-select="${id}">
    <cds-button class="cds-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false" kind="ghost"><span>${escapeHtml(choice?.label || '')}</span><span aria-hidden="true">⌄</span></cds-button>
    <div class="cds-select-menu" role="listbox" aria-label="${escapeHtml(label)}" hidden>
      ${options.map(option => `<cds-button class="cds-select-option" type="button" role="option" data-value="${escapeHtml(option.value)}" aria-selected="${option.value === selected}" kind="ghost">${escapeHtml(option.label)}</cds-button>`).join('')}
    </div>
    <input type="hidden" data-field="${id}" value="${escapeHtml(selected)}">
  </div>`;
}
function renderCard(config) {
  const message = messages[config.id] || { text: config.enabled ? '已启用 · 等待调用' : '未启用', type: '' };
  return `<article class="integration-card" data-integration-card="${config.id}">
    <div class="integration-card-header">
      <div class="integration-icon" aria-hidden="true">${escapeHtml(config.icon)}</div>
      <div class="integration-title"><h3>${escapeHtml(config.name)}</h3><p>${escapeHtml(config.category)} · ${escapeHtml(config.description)}</p></div>
      <cds-toggle data-field="enabled" label-text="启用此服务" on-text="启用" off-text="停用" ${config.enabled ? 'checked' : ''}></cds-toggle>
    </div>
    <div class="integration-card-body"><div class="integration-form-grid">
      <div class="integration-field full"><label for="endpoint-${config.id}">API 端点 URL</label><cds-text-input id="endpoint-${config.id}" data-field="endpoint" type="url" autocomplete="url" required placeholder="https://api.example.com/..." value="${escapeHtml(config.endpoint)}" aria-label="https://api.example.com/..."></cds-text-input><span class="field-help">${config.id === 'openai' ? '填写 API 基础地址，例如 https://api.openai.com/v1。' : config.id === 'custom' ? '填写 OpenAI 兼容服务地址；自定义请求方式由下方配置。' : '此服务的专用端点。生产环境仅允许 HTTPS。'}</span></div>
      ${config.supportsKey ? `<div class="integration-field"><label for="key-${config.id}">API Key / Token</label><cds-text-input id="key-${config.id}" data-field="apiKey" type="password" autocomplete="new-password" placeholder="${config.apiKeyConfigured ? '已在服务端保存；留空保持不变' : '粘贴服务密钥'}" value="" aria-label="${config.apiKeyConfigured ? '已在服务端保存；留空保持不变' : '粘贴服务密钥'}"></cds-text-input><span class="field-help">${config.apiKeyConfigured ? '密钥已安全保存在服务端，不会回传到浏览器。' : '密钥将通过已验证的服务端网关保存。'}</span></div>` : ''}
      ${!config.supportsMethod ? `<div class="integration-field"><label>请求方式</label><div class="method-fixed"><strong>${METHOD_LABELS[config.id] || config.requestMethod}</strong><span>按服务 API 协议执行</span></div></div>` : ''}
      ${config.supportsModel ? modelControl(config) : ''}
      ${config.supportsMethod ? `<div class="integration-field"><label>请求方式</label>${customSelect('requestMethod', config.requestMethod, METHOD_OPTIONS, '请求方式')}</div><div class="integration-field"><label>认证方式</label>${customSelect('auth', config.auth, AUTH_OPTIONS, '认证方式')}</div>` : ''}
    </div></div>
    <div class="integration-card-footer"><div class="integration-message ${escapeHtml(message.type)}" data-message role="status">${escapeHtml(message.text)}</div>
      <div class="integration-footer-actions"><cds-button class="btn btn-ghost btn-sm" type="button" data-action="test" ${busy.has(config.id) ? 'disabled' : ''} kind="ghost" size="sm">${busy.has(config.id) ? '测试中…' : '测试连接'}</cds-button><cds-button class="btn btn-primary btn-sm" type="button" data-action="save" kind="primary" size="sm">保存配置</cds-button></div>
    </div>
  </article>`;
}
export function renderIntegrations() {
  const configs = listIntegrations();
  const enabled = configs.filter(item => item.enabled).length;
  const withKey = configs.filter(item => item.apiKeyConfigured).length;
  document.getElementById('integrationSummary').innerHTML = [
    ['服务适配器', configs.length, '已注册连接器'],
    ['已启用', enabled, '保存至 Supabase'],
    ['已配置凭据', withKey, '密钥只在服务端保存'],
  ].map(([label, value, note]) => `<div class="integration-summary-card"><div class="integration-summary-label">${label}</div><div class="integration-summary-value">${value}</div><div class="field-help">${note}</div></div>`).join('');
  document.getElementById('integrationCards').innerHTML = configs.map(renderCard).join('');
}
function collect(card) {
  const id = card.dataset.integrationCard;
  const current = listIntegrations().find(item => item.id === id);
  const patch = { ...current };
  card.querySelectorAll('[data-field]').forEach(input => {
    const field = input.dataset.field;
    if (field === 'apiKey') { if (input.value.trim()) patch.apiKey = input.value.trim(); }
    else if (field === 'enabled') patch.enabled = input.checked;
    else if (field === 'auth') patch.auth = input.value;
    else if (field === 'requestMethod') patch.requestMethod = input.value;
    else if (field === 'modelPreset') { if (input.value !== '__custom__') patch.model = input.value; }
    else patch[field] = input.value.trim();
  });
  return { id, patch };
}
function showMessage(card, text, type = '') {
  const node = card.querySelector('[data-message]');
  node.textContent = text;
  node.className = 'integration-message ' + type;
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
    wrap.querySelector('input[type="hidden"]').value = option.dataset.value;
    wrap.querySelector('.cds-select-trigger span').textContent = option.textContent;
    wrap.querySelector('.cds-select-menu').hidden = true;
    wrap.querySelector('.cds-select-trigger').setAttribute('aria-expanded', 'false');
    wrap.querySelectorAll('.cds-select-option').forEach(item => item.setAttribute('aria-selected', String(item === option)));
  }));
}
export async function bindIntegrations() {
  const root = document.getElementById('integrationsView');
  bindSelects(root);
  root.querySelectorAll('[data-action="save"]').forEach(button => button.addEventListener('click', async () => {
    const card = button.closest('[data-integration-card]');
    const { id, patch } = collect(card);
    button.disabled = true;
    try {
      await saveIntegration(id, patch);
      messages[id] = { text: '配置已安全保存到 Supabase。', type: 'success' };
      await loadIntegrations();
      renderIntegrations();
      await bindIntegrations();
      showToast('已保存 ' + patch.name + ' 配置');
    } catch (error) { showMessage(card, error.message || '保存失败', 'error'); }
    finally { button.disabled = false; }
  }));
  root.querySelectorAll('[data-action="test"]').forEach(button => button.addEventListener('click', async () => {
    const card = button.closest('[data-integration-card]');
    const { id, patch } = collect(card);
    button.disabled = true;
    button.textContent = '正在测试…';
    try {
      await saveIntegration(id, patch);
      await loadIntegrations();
      const result = await integrationClient.test(id);
      messages[id] = { text: '连接成功 · HTTP ' + result.status, type: 'success' };
      showMessage(card, messages[id].text, 'success');
    } catch (error) {
      const detail = error instanceof TypeError ? '服务端网关网络异常，请检查连接后重试。' : (error.message || '连接失败');
      messages[id] = { text: detail, type: 'error' };
      showMessage(card, detail, 'error');
    } finally {
      await loadIntegrations().catch(() => {});
      renderIntegrations();
      await bindIntegrations();
    }
  }));
  root.querySelectorAll('[data-integration-card]').forEach(card => {
    card.querySelector('[data-field="enabled"]').addEventListener('cds-toggle-changed', async event => {
      const { id, patch } = collect(card);
      try {
        patch.enabled = event.target.checked;
        await saveIntegration(id, patch);
        showToast(event.target.checked ? '服务已启用' : '服务已停用');
        await loadIntegrations();
        renderIntegrations();
        await bindIntegrations();
      } catch (error) { showMessage(card, error.message, 'error'); }
    });
  });
  const reset = document.getElementById('resetIntegrations');
  if (reset) reset.onclick = async () => {
    try {
      await resetIntegrations();
      messages = {};
      renderIntegrations();
      await bindIntegrations();
      showToast('已清除此账号的集成配置');
    } catch (error) { showToast(error.message || '清除失败'); }
  };
}
