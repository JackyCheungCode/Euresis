import { listIntegrations, saveIntegration, resetIntegrations, integrationClient } from '../services/integrations.js';
import { showToast } from '../components/toast.js';

const AUTH_OPTIONS = [
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'x-api-key', label: 'X-API-KEY' },
  { value: 'query-key', label: 'Query 参数 API Key' },
  { value: 'none', label: '无认证' },
];
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let bound = false;
let busy = new Set();
let messages = {};

function customSelect(id, selected, options, label) {
  const choice = options.find(option => option.value === selected) || options[0];
  return `<div class="cds-select" data-select="${id}">
    <button class="cds-select-trigger" type="button" aria-haspopup="listbox" aria-expanded="false"><span>${escapeHtml(choice.label)}</span><span aria-hidden="true">⌄</span></button>
    <div class="cds-select-menu" role="listbox" aria-label="${escapeHtml(label)}" hidden>
      ${options.map(option => `<button class="cds-select-option" type="button" role="option" data-value="${escapeHtml(option.value)}" aria-selected="${option.value === selected}">${escapeHtml(option.label)}</button>`).join('')}
    </div>
    <input type="hidden" data-field="${id}" value="${escapeHtml(selected)}">
  </div>`;
}
function statusText(config) {
  if (messages[config.id]) return messages[config.id];
  if (config.enabled) return { text: '已启用 · 等待请求', type: '' };
  return { text: '未启用', type: '' };
}
function renderCard(config) {
  const status = statusText(config);
  const authSelect = customSelect('auth', config.auth || 'bearer', AUTH_OPTIONS, '认证方式');
  return `<article class="integration-card" data-integration-card="${config.id}">
    <div class="integration-card-header">
      <div class="integration-icon">${escapeHtml(config.icon)}</div>
      <div class="integration-title"><h3>${escapeHtml(config.name)}</h3><p>${escapeHtml(config.category)} · ${escapeHtml(config.description)}</p></div>
      <label class="cds-switch" title="启用此服务"><input type="checkbox" data-field="enabled" ${config.enabled ? 'checked' : ''}><span class="cds-switch-track"></span><span class="cds-switch-label">${config.enabled ? '启用' : '停用'}</span></label>
    </div>
    <div class="integration-card-body">
      <div class="integration-form-grid">
        <div class="integration-field full"><label for="endpoint-${config.id}">API 端点 URL</label><input id="endpoint-${config.id}" data-field="endpoint" type="url" autocomplete="url" placeholder="https://api.example.com/..." value="${escapeHtml(config.endpoint)}"><span class="field-help">服务请求地址；测试连接会向该端点发送轻量验证请求。</span></div>
        <div class="integration-field"><label for="key-${config.id}">API Key / Token</label><input id="key-${config.id}" data-field="apiKey" type="password" autocomplete="new-password" placeholder="${config.apiKey ? '已在本会话中设置（输入可替换）' : '粘贴服务密钥'}" value=""><span class="field-help">${config.apiKey ? '密钥已设置；留空保存会保留当前会话密钥。' : '密钥只保存在当前浏览器会话。'}</span></div>
        <div class="integration-field"><label>认证方式</label>${authSelect}</div>
        <div class="integration-field full"><label for="model-${config.id}">模型 / 附加标识（可选）</label><input id="model-${config.id}" data-field="model" type="text" autocomplete="off" placeholder="例如 gpt-4o-mini" value="${escapeHtml(config.model)}"></div>
      </div>
    </div>
    <div class="integration-card-footer">
      <div class="integration-message ${escapeHtml(status.type || '')}" data-message>${escapeHtml(status.text || status)}</div>
      <div class="integration-footer-actions"><button class="btn btn-ghost btn-sm" type="button" data-action="test" ${busy.has(config.id) ? 'disabled' : ''}>${busy.has(config.id) ? '测试中…' : '测试连接'}</button><button class="btn btn-primary btn-sm" type="button" data-action="save">保存配置</button></div>
    </div>
  </article>`;
}
export function renderIntegrations() {
  const configs = listIntegrations();
  const enabled = configs.filter(item => item.enabled).length;
  const withKey = configs.filter(item => item.apiKey).length;
  document.getElementById('integrationSummary').innerHTML = [
    ['可用服务', configs.length, '服务适配器'],
    ['已启用', enabled, '已保存启用状态'],
    ['已配置凭据', withKey, '当前浏览器会话'],
  ].map(([label, value, note]) => `<div class="integration-summary-card"><div class="integration-summary-label">${label}</div><div class="integration-summary-value">${value}</div><div class="field-help">${note}</div></div>`).join('');
  document.getElementById('integrationCards').innerHTML = configs.map(renderCard).join('');
}
function collect(card) {
  const id = card.dataset.integrationCard;
  const current = listIntegrations().find(item => item.id === id);
  const patch = { ...current };
  card.querySelectorAll('[data-field]').forEach(input => {
    const field = input.dataset.field;
    if (field === 'apiKey') {
      if (input.value.trim()) patch.apiKey = input.value.trim();
    } else if (field === 'enabled') patch.enabled = input.checked;
    else patch[field] = input.value.trim();
  });
  return { id, patch };
}
function showMessage(card, text, type = '') {
  const node = card.querySelector('[data-message]');
  node.textContent = text;
  node.className = 'integration-message ' + type;
}
function selectEvents(root) {
  root.querySelectorAll('.cds-select-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const wrap = trigger.closest('.cds-select');
      const menu = wrap.querySelector('.cds-select-menu');
      const willOpen = menu.hidden;
      root.querySelectorAll('.cds-select-menu').forEach(other => { other.hidden = true; other.closest('.cds-select').querySelector('.cds-select-trigger').setAttribute('aria-expanded', 'false'); });
      menu.hidden = !willOpen;
      trigger.setAttribute('aria-expanded', String(willOpen));
    });
  });
  root.querySelectorAll('.cds-select-option').forEach(option => {
    option.addEventListener('click', () => {
      const wrap = option.closest('.cds-select');
      const hidden = wrap.querySelector('input[type="hidden"]');
      hidden.value = option.dataset.value;
      wrap.querySelector('.cds-select-trigger span').textContent = option.textContent;
      wrap.querySelector('.cds-select-menu').hidden = true;
      wrap.querySelector('.cds-select-trigger').setAttribute('aria-expanded', 'false');
      wrap.querySelectorAll('.cds-select-option').forEach(item => item.setAttribute('aria-selected', String(item === option)));
    });
  });
}
export function bindIntegrations() {
  const root = document.getElementById('integrationsView');
  if (bound) {
    // Re-rendered cards need fresh handlers after every view switch.
    bound = false;
  }
  selectEvents(root);
  root.querySelectorAll('[data-action="save"]').forEach(button => button.addEventListener('click', () => {
    const card = button.closest('[data-integration-card]');
    const { id, patch } = collect(card);
    try {
      saveIntegration(id, patch);
      messages[id] = { text: '配置已保存；密钥保留在当前会话。', type: 'success' };
      renderIntegrations();
      bindIntegrations();
      showToast('已保存 ' + (patch.name || id) + ' 配置');
    } catch (error) { showMessage(card, error.message, 'error'); }
  }));
  root.querySelectorAll('[data-action="test"]').forEach(button => button.addEventListener('click', async () => {
    const card = button.closest('[data-integration-card]');
    const { id, patch } = collect(card);
    try {
      saveIntegration(id, patch);
      busy.add(id);
      showMessage(card, '正在请求服务端点…');
      button.disabled = true;
      button.textContent = '测试中…';
      const result = await integrationClient.test(id);
      const details = result.status + ' · 请求成功';
      messages[id] = { text: details, type: 'success' };
      showMessage(card, details, 'success');
    } catch (error) {
      const message = error instanceof TypeError ? '请求失败：可能是网络或跨域（CORS）限制。' : '连接失败：' + error.message;
      messages[id] = { text: message, type: 'error' };
      showMessage(card, message, 'error');
    } finally {
      busy.delete(id);
      renderIntegrations();
      bindIntegrations();
    }
  }));
  root.querySelectorAll('[data-integration-card]').forEach(card => {
    const toggle = card.querySelector('[data-field="enabled"]');
    toggle.addEventListener('change', () => {
      const { id, patch } = collect(card);
      saveIntegration(id, patch);
      const label = card.querySelector('.cds-switch-label');
      label.textContent = toggle.checked ? '启用' : '停用';
      showToast(toggle.checked ? '服务已启用' : '服务已停用');
      const summary = document.getElementById('integrationSummary');
      const enabled = listIntegrations().filter(item => item.enabled).length;
      summary.querySelectorAll('.integration-summary-value')[1].textContent = enabled;
    });
  });
  const reset = document.getElementById('resetIntegrations');
  if (reset) reset.onclick = () => {
    resetIntegrations();
    messages = {};
    renderIntegrations();
    bindIntegrations();
    showToast('已恢复默认配置');
  };
  bound = true;
}
