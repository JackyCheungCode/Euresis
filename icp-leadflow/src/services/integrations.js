import { gateway } from './supabase.js';

const DEFAULTS = [
  { id: 'tavily', name: 'Tavily Search', category: '搜索与研究', description: '网页搜索与研究上下文。', icon: 'T', endpoint: 'https://api.tavily.com/search', requestMethod: 'POST', auth: 'bearer', supportsModel: false, supportsMethod: false, supportsKey: true },
  { id: 'serper', name: 'Serper.dev', category: '搜索与研究', description: 'Google 搜索结果与企业发现。', icon: 'S', endpoint: 'https://google.serper.dev/search', requestMethod: 'POST', auth: 'x-api-key', supportsModel: false, supportsMethod: false, supportsKey: true },
  { id: 'openai', name: 'OpenAI API', category: 'AI 模型', description: 'OpenAI 模型列表与 Chat Completions。', icon: 'AI', endpoint: 'https://api.openai.com/v1', requestMethod: 'GET', auth: 'bearer', model: 'gpt-4o-mini', supportsModel: true, supportsMethod: false, supportsKey: true },
  { id: 'anthropic', name: 'Anthropic API', category: 'AI 模型', description: 'Claude Messages API。', icon: 'A', endpoint: 'https://api.anthropic.com/v1/messages', requestMethod: 'POST', auth: 'anthropic', model: 'claude-3-5-haiku-latest', supportsModel: true, supportsMethod: false, supportsKey: true },
  { id: 'apollo', name: 'Apollo.io', category: '数据补全', description: '企业与联系人数据补全。', icon: 'AP', endpoint: 'https://api.apollo.io/api/v1/mixed_companies/search', requestMethod: 'POST', auth: 'x-api-key', supportsModel: false, supportsMethod: false, supportsKey: true },
  { id: 'hunter', name: 'Hunter.io', category: '验证与联系方式', description: '域名邮箱发现与邮箱验证。', icon: 'H', endpoint: 'https://api.hunter.io/v2/domain-search', requestMethod: 'GET', auth: 'query-key', supportsModel: false, supportsMethod: false, supportsKey: true },
  { id: 'apify', name: 'Apify', category: '抓取与自动化', description: '网页抓取与 Actor 自动化。', icon: 'APY', endpoint: 'https://api.apify.com/v2/users/me', requestMethod: 'GET', auth: 'bearer', supportsModel: false, supportsMethod: false, supportsKey: true },
  { id: 'n8n', name: 'n8n Webhook', category: '自动化与 CRM', description: '将线索推送至自动化工作流。', icon: 'n8n', endpoint: '', requestMethod: 'POST', auth: 'none', supportsModel: false, supportsMethod: false, supportsKey: false },
  { id: 'custom', name: '自定义 OpenAI 兼容 API', category: 'AI 模型', description: '兼容 OpenAI Chat Completions 的服务。', icon: 'API', endpoint: '', requestMethod: 'POST', auth: 'bearer', model: '', supportsModel: true, supportsMethod: true, supportsKey: true },
];
let cache = DEFAULTS.map(item => ({ ...item, enabled: false, apiKeyConfigured: false, persisted: false }));
let loaded = false;

export async function loadIntegrations() {
  const result = await gateway('list');
  const saved = new Map((result.configs || []).map(item => [item.provider_id, item]));
  cache = DEFAULTS.map(def => {
    const row = saved.get(def.id);
    if (!row) return { ...def, enabled: false, apiKeyConfigured: false, persisted: false };
    return {
      ...def,
      endpoint: row.endpoint ?? def.endpoint,
      requestMethod: row.request_method ?? def.requestMethod,
      auth: row.auth_type ?? def.auth,
      model: row.model ?? def.model ?? '',
      enabled: Boolean(row.enabled),
      apiKeyConfigured: Boolean(row.has_api_key),
      persisted: true,
    };
  });
  loaded = true;
  return listIntegrations();
}
export function listIntegrations() { return cache.map(item => ({ ...item })); }
export function getIntegration(id) { return cache.find(item => item.id === id); }
export async function saveIntegration(id, patch) {
  const current = getIntegration(id);
  if (!current) throw new Error('未知的集成服务');
  const next = { ...current, ...patch };
  if (!next.endpoint) throw new Error('请填写 API 端点');
  const config = {
    provider_id: id,
    name: next.name,
    endpoint: next.endpoint.trim(),
    request_method: next.supportsMethod ? next.requestMethod : current.requestMethod,
    auth_type: next.auth,
    model: next.supportsModel ? (next.model || '') : null,
    enabled: Boolean(next.enabled),
    api_key: patch.apiKey || '',
  };
  await gateway('save', { config });
  cache = cache.map(item => item.id === id ? { ...next, apiKeyConfigured: Boolean(patch.apiKey) || current.apiKeyConfigured, persisted: true } : item);
  return getIntegration(id);
}
export async function resetIntegrations() {
  await gateway('reset');
  cache = DEFAULTS.map(item => ({ ...item, enabled: false, apiKeyConfigured: false, persisted: false }));
  loaded = true;
}
export const integrationClient = {
  async test(id) {
    if (!loaded) await loadIntegrations();
    const result = await gateway('test', { provider_id: id });
    return { status: result.status, data: result.data };
  },
  async call(id, payload = {}) {
    if (!loaded) await loadIntegrations();
    const config = getIntegration(id);
    if (!config || !config.enabled) throw new Error('该集成未启用，请先在 API 与 AI 集成页面保存并启用');
    const result = await gateway('call', { provider_id: id, payload });
    return result.data;
  },
};
