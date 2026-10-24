import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://euresis.xg-y.workers.dev",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function validateEndpoint(value: unknown): URL {
  if (typeof value !== "string" || !value.trim()) throw new Error("请填写 API 端点");
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("生产环境仅允许 HTTPS API 端点");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host === "metadata.google.internal" ||
      host === "169.254.169.254" || host === "127.0.0.1" || host === "::1" ||
      /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
    throw new Error("不允许访问本地、内网或云元数据地址");
  }
  return url;
}
function endpointFor(config: any, suffix = "") {
  const url = validateEndpoint(config.endpoint);
  if (suffix) return config.endpoint.replace(/\/$/, "") + "/" + suffix.replace(/^\//, "");
  return url.toString();
}
function requestHeaders(config: any) {
  const headers: Record<string, string> = { Accept: "application/json" };
  const key = config.api_key || "";
  if (config.auth_type === "bearer" && key) headers.Authorization = "Bearer " + key;
  if (config.auth_type === "x-api-key" && key) headers["X-API-KEY"] = key;
  if (config.auth_type === "anthropic" && key) {
    headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
  }
  for (const [k, v] of Object.entries(config.extra_headers || {})) {
    if (!/^(authorization|cookie|host|content-length)$/i.test(k) && typeof v === "string") headers[k] = v;
  }
  return headers;
}
async function callProvider(config: any, action: string, payload: any = {}) {
  const id = config.provider_id;
  let url = config.endpoint;
  let method = config.request_method || "POST";
  const headers = requestHeaders(config);
  let body: string | undefined;
  if (id === "openai" || id === "custom") {
    if (action === "test") {
      url = id === "openai" && !/\/models\/?$/.test(url) ? endpointFor(config, "models") : url;
      method = id === "custom" ? (config.request_method || "POST") : "GET";
      if (id === "custom" && method !== "GET" && method !== "HEAD") {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ model: config.model || "gpt-4o-mini", messages: [{ role: "user", content: "Reply with OK" }], max_tokens: 8 });
      }
    } else {
      url = id === "openai" && !/\/chat\/completions\/?$/.test(url) ? endpointFor(config, "chat/completions") : url;
      method = "POST";
      body = JSON.stringify({ model: config.model || "gpt-4o-mini", messages: payload.messages || [{ role: "user", content: payload.query || "Hello" }], ...payload });
    }
  } else if (id === "serper") {
    method = "POST"; headers["X-API-KEY"] = config.api_key || ""; headers["Content-Type"] = "application/json";
    body = JSON.stringify(action === "test" ? { q: "solar distributors Germany", num: 1 } : { q: payload.query || payload.q || "solar distributors Germany", ...payload });
  } else if (id === "tavily") {
    method = "POST"; headers["Content-Type"] = "application/json";
    body = JSON.stringify({ api_key: config.api_key, query: action === "test" ? "solar distributors Germany" : (payload.query || "solar distributors Germany"), max_results: 1, ...payload });
  } else if (id === "anthropic") {
    method = "POST"; headers["Content-Type"] = "application/json"; headers["x-api-key"] = config.api_key || ""; headers["anthropic-version"] = "2023-06-01";
    body = JSON.stringify({ model: config.model || "claude-3-5-haiku-latest", max_tokens: action === "test" ? 8 : 1024, messages: payload.messages || [{ role: "user", content: action === "test" ? "Reply with OK" : (payload.query || "Hello") }], ...payload });
  } else if (id === "hunter") {
    const parsed = validateEndpoint(url);
    if (action === "test") parsed.pathname = "/v2/account";
    else {
      parsed.pathname = "/v2/domain-search";
      if (payload.domain) parsed.searchParams.set("domain", String(payload.domain));
      if (payload.email) { parsed.pathname = "/v2/email-verifier"; parsed.searchParams.set("email", String(payload.email)); }
    }
    parsed.searchParams.set("api_key", config.api_key || "");
    url = parsed.toString(); method = "GET";
  } else if (id === "apify") {
    if (action === "test") { method = "GET"; }
    else {
      method = config.request_method || "POST";
      if (method !== "GET" && method !== "HEAD") { headers["Content-Type"] = "application/json"; body = JSON.stringify(payload || {}); }
    }
  } else if (id === "apollo") {
    if (action === "test") {
      const parsed = validateEndpoint(url);
      parsed.pathname = "/api/v1/auth/health";
      url = parsed.toString();
      method = "GET";
    } else {
      method = config.request_method || "POST";
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(payload || {});
    }
  } else if (id === "n8n") {
    method = "POST"; headers["Content-Type"] = "application/json"; body = JSON.stringify(payload || { test: true, source: "Euresis" });
  } else if (action === "test" && method === "GET") {
    // Generic APIs can be tested with a safe GET when explicitly configured.
  } else {
    headers["Content-Type"] = "application/json";
    if (method !== "GET" && method !== "HEAD") body = JSON.stringify(payload || { test: true, source: "Euresis" });
  }
  const parsed = validateEndpoint(url);
  const response = await fetch(parsed.toString(), { method, headers, ...(body ? { body } : {}), signal: AbortSignal.timeout(18000), redirect: "error" });
  const text = await response.text();
  let data: any;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text.slice(0, 300) }; }
  if (!response.ok) {
    const rawMessage = data?.error?.message || data?.message || data?.error || ("HTTP " + response.status);
    throw new Error("HTTP " + response.status + ": " + String(rawMessage).slice(0, 180));
  }
  return { status: response.status, data: action === "test" ? undefined : data };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const origin = req.headers.get("origin") || "";
  if (origin && origin !== "https://euresis.xg-y.workers.dev" && !/^http:\/\/localhost:(5173|8787)$/.test(origin)) return json({ error: "Origin not allowed" }, 403);
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "请先登录 Euresis" }, 401);
  const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: "登录会话已过期，请重新登录" }, 401);
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  try {
    const input = await req.json();
    const action = String(input.action || "");
    const providerId = String(input.provider_id || "");
    if (action === "list") {
      const { data, error } = await admin.from("integration_configs").select("provider_id,name,endpoint,request_method,auth_type,model,enabled,updated_at,api_key").eq("user_id", userData.user.id);
      if (error) throw error;
      return json({ configs: (data || []).map((row: any) => { const { api_key, ...safe } = row; return { ...safe, has_api_key: Boolean(api_key) }; }) });
    }
    if (action === "save") {
      const config = input.config || {};
      if (!/^[a-z0-9_-]{2,48}$/.test(String(config.provider_id || ""))) throw new Error("无效的服务 ID");
      validateEndpoint(config.endpoint);
      const record = {
        user_id: userData.user.id,
        provider_id: config.provider_id,
        name: String(config.name || config.provider_id).slice(0, 120),
        endpoint: String(config.endpoint),
        request_method: ["GET","POST","PUT","PATCH","DELETE","HEAD"].includes(config.request_method) ? config.request_method : "POST",
        auth_type: ["bearer","x-api-key","query-key","anthropic","none"].includes(config.auth_type) ? config.auth_type : "bearer",
        model: config.model ? String(config.model).slice(0, 180) : null,
        api_key: config.api_key ? String(config.api_key).slice(0, 2000) : undefined,
        enabled: Boolean(config.enabled),
        extra_headers: config.extra_headers && typeof config.extra_headers === "object" ? config.extra_headers : {},
        request_template: config.request_template && typeof config.request_template === "object" ? config.request_template : {},
        updated_at: new Date().toISOString(),
      };
      const { data: existing, error: lookupError } = await admin.from("integration_configs").select("api_key").eq("user_id", userData.user.id).eq("provider_id", record.provider_id).maybeSingle();
      if (lookupError) throw lookupError;
      if (!record.api_key) record.api_key = existing?.api_key || null;
      const { error } = await admin.from("integration_configs").upsert(record, { onConflict: "user_id,provider_id" });
      if (error) throw error;
      return json({ saved: true, provider_id: providerId || record.provider_id });
    }
    if (action === "reset") {
      const { error } = await admin.from("integration_configs").delete().eq("user_id", userData.user.id);
      if (error) throw error;
      return json({ reset: true });
    }
    if (action === "test" || action === "call") {
      let config: any;
      if (input.config) {
        config = { ...input.config, provider_id: providerId || input.config.provider_id, api_key: input.config.api_key || "" };
      } else {
        const { data, error } = await admin.from("integration_configs").select("*").eq("user_id", userData.user.id).eq("provider_id", providerId).maybeSingle();
        if (error) throw error;
        config = data;
      }
      if (!config) throw new Error("请先保存此服务配置");
      if (config.enabled === false && action === "call") throw new Error("此服务未启用");
      if (config.provider_id !== "n8n" && !config.api_key) throw new Error("请填写 API Key / Token");
      const result = await callProvider(config, action, input.payload || {});
      return json({ ok: true, status: result.status, data: result.data });
    }
    throw new Error("不支持的操作");
  } catch (error) {
    const message = error instanceof Error ? error.message : "请求失败";
    const isNetwork = /fetch failed|timeout|network|certificate|dns|connection/i.test(message);
    return json({ error: isNetwork ? "上游 API 网络连接失败或端点不可达" : message }, 400);
  }
});