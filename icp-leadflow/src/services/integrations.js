const STORAGE_KEY = 'euresis.integration.settings.v1';
const SECRET_PREFIX = 'euresis.integration.secret.';
const DEFAULTS = [
  { id: 'tavily', name: 'Tavily Search', category: '搜索与研究', description: '网页搜索、内容提取与研究上下文。', icon: 'T', endpoint: 'https://api.tavily.com/search', auth: 'bearer', enabled: false, model: '' },
  { id: 'serper', name: 'Serper.dev', category: '搜索与研究', description: 'Google SERP、公司发现与搜索结果。', icon: 'S', endpoint: 'https://google.serper.dev/search', auth: 'x-api-key', enabled: false, model: '' },
  { id: 'openai', name: 'OpenAI API', category: 'AI 模型', description: 'OpenAI Chat Completions / Models API。', icon: 'AI', endpoint: 'https://api.openai.com/v1', auth: 'bearer', enabled: false, model: 'gpt-4o-mini' },
  { id: 'anthropic', name: 'Anthropic API', category: 'AI 模型', description: 'Claude Messages API。', icon: 'A', endpoint: 'https://api.anthropic.com/v1/messages', auth: 'x-api-key', enabled: false, model: 'claude-3-5-haiku-latest' },
  { id: 'apollo', name: 'Apollo.io', category: '数据补全', description: '企业与联系人数据补全。', icon: 'AP', endpoint: 'https://api.apollo.io/api/v1/auth/health', auth: 'x-api-key', enabled: false, model: '' },
  { id: 'hunter', name: 'Hunter.io', category: '验证与联系方式', description: '域名邮箱发现与邮箱验证。', icon: 'H', endpoint: 'https://api.hunter.io/v2/account', auth: 'query-key', enabled: false, model: '' },
  { id: 'apify', name: 'Apify', category: '抓取与自动化', description: '公开网页与联系方式抓取 Actor。', icon: 'APY', endpoint: 'https://api.apify.com/v2/users/me', auth: 'bearer', enabled: false, model: '' },
  { id: 'n8n', name: 'n8n Webhook', category: '自动化与 CRM', description: '将线索推送到已配置的自动化工作流。', icon: 'n8n', endpoint: '', auth: 'bearer', enabled: false, model: '' },
  { id: 'custom', name: '自定义 OpenAI 兼容 API', category: 'AI 模型', description: '兼容 OpenAI Chat Completions 的模型服务。', icon: 'API', endpoint: '', auth: 'bearer', enabled: false, model: '' },
];

function readMeta() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
function writeMeta(meta) { localStorage.setItem(STORAGE_KEY, JSON.stringify(meta)); }
function secret(id) { try { return sessionStorage.getItem(SECRET_PREFIX + id) || ''; } catch { return ''; } }
function setSecret(id, value) { try { if (value) sessionStorage.setItem(SECRET_PREFIX + id, value); else sessionStorage.removeItem(SECRET_PREFIX + id); } catch {} }
function mergeConfig(def, saved = {}) {
  return { ...def, ...saved, apiKey: secret(def.id) };
}
export function listIntegrations() {
  const meta = readMeta();
  return DEFAULTS.map(def => mergeConfig(def, meta[def.id] || {}));
}
export function getIntegration(id) {
  return listIntegrations().find(item => item.id === id);
}
export function saveIntegration(id, patch) {
  const meta = readMeta();
  const def = DEFAULTS.find(item => item.id === id);
  if (!def) throw new Error('未知的集成服务');
  const current = mergeConfig(def, meta[id] || {});
  const next = { ...current, ...patch };
  if (Object.prototype.hasOwnProperty.call(patch, 'apiKey')) setSecret(id, patch.apiKey);
  const { apiKey, ...safe } = next;
  meta[id] = safe;
  writeMeta(meta);
  return { ...safe, apiKey: secret(id) };
}
export function resetIntegrations() {
  localStorage.removeItem(STORAGE_KEY);
  DEFAULTS.forEach(item => setSecret(item.id, ''));
}
function authHeaders(config) {
  const headers = { Accept: 'application/json' };
  if (!config.apiKey || config.auth === 'none') return headers;
  if (config.auth === 'x-api-key') headers['X-API-KEY'] = config.apiKey;
  else if (config.auth === 'query-key') return headers;
  else headers.Authorization = 'Bearer ' + config.apiKey;
  if (config.id === 'anthropic') {
    headers['x-api-key'] = config.apiKey;
    headers['anthropic-version'] = '2023-06-01';
    delete headers.Authorization;
  }
  return headers;
}
function endpointFor(config, path = '') {
  const base = (config.endpoint || '').trim();
  if (!base) throw new Error('请先填写 API 端点');
  if (!path) return base;
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(18000) });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { message: raw.slice(0, 500) }; }
  if (!response.ok) {
    const message = data?.error?.message || data?.message || data?.error || ('HTTP ' + response.status);
    throw new Error(String(message).slice(0, 240));
  }
  return { status: response.status, data };
}
export const integrationClient = {
  async test(id) {
    const config = getIntegration(id);
    if (!config) throw new Error('未知的集成服务');
    if (!config.apiKey && id !== 'n8n') throw new Error('请先填写 API Key');
    const headers = authHeaders(config);
    if (id === 'serper') {
      return request(endpointFor(config), { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ q: 'solar distributors Germany', num: 1 }) });
    }
    if (id === 'tavily') {
      return request(endpointFor(config), { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ api_key: config.apiKey, query: 'solar distributors Germany', max_results: 1 }) });
    }
    if (id === 'openai' || id === 'custom') {
      const url = endpointFor(config, 'models');
      return request(url, { headers });
    }
    if (id === 'anthropic') {
      return request(endpointFor(config), { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' }, body: JSON.stringify({ model: config.model || 'claude-3-5-haiku-latest', max_tokens: 8, messages: [{ role: 'user', content: 'Reply with OK' }] }) });
    }
    if (id === 'hunter') {
      const url = new URL(endpointFor(config));
      url.searchParams.set('api_key', config.apiKey);
      return request(url.toString(), { headers });
    }
    return request(endpointFor(config), { headers });
  },
  async call(id, payload = {}) {
    const config = getIntegration(id);
    if (!config || !config.enabled) throw new Error('该集成未启用，请先在 API 与 AI 集成页面保存并启用');
    if (!config.apiKey && id !== 'n8n') throw new Error('该集成缺少 API Key');
    const headers = { ...authHeaders(config), 'Content-Type': 'application/json' };
    if (id === 'serper') return (await request(endpointFor(config), { method: 'POST', headers, body: JSON.stringify({ q: payload.query || payload.q || 'solar distributors Germany', ...payload }) })).data;
    if (id === 'tavily') return (await request(endpointFor(config), { method: 'POST', headers, body: JSON.stringify({ api_key: config.apiKey, query: payload.query || 'solar distributors Germany', ...payload }) })).data;
    if (id === 'openai' || id === 'custom') return (await request(endpointFor(config, 'chat/completions'), { method: 'POST', headers, body: JSON.stringify({ model: config.model || 'gpt-4o-mini', messages: payload.messages || [{ role: 'user', content: payload.query || 'Hello' }], ...payload }) })).data;
    if (id === 'anthropic') return (await request(endpointFor(config), { method: 'POST', headers, body: JSON.stringify({ model: config.model || 'claude-3-5-haiku-latest', max_tokens: 1024, messages: payload.messages || [{ role: 'user', content: payload.query || 'Hello' }], ...payload }) })).data;
    if (id === 'hunter') {
      const url = new URL(endpointFor(config));
      url.searchParams.set('api_key', config.apiKey);
      Object.entries(payload).forEach(([key, value]) => url.searchParams.set(key, String(value)));
      return (await request(url.toString(), { headers })).data;
    }
    return (await request(endpointFor(config), { method: id === 'n8n' ? 'POST' : 'GET', headers, ...(id === 'n8n' ? { body: JSON.stringify(payload) } : {}) })).data;
  },
};
