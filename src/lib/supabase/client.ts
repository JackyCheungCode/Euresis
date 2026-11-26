const SUPABASE_URL = "https://phkqazqhjbzxehgieenn.supabase.co";
const SUPABASE_KEY = "sb_publishable_wxbkywOVDA483LEvf1wUBg_a0E3VAYG";

export type AuthUser = { id: string; email: string; user_metadata?: { full_name?: string } };
export type AuthSession = { access_token: string; refresh_token: string; expires_at?: number; user: AuthUser };
const SESSION_KEY = "euresis-supabase-session-v1";

function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null") as AuthSession | null; } catch { return null; }
}
function saveSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}
async function authRequest(path: string, body: unknown): Promise<Record<string, any>> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({})) as Record<string, any>;
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || data.error || "Authentication request failed.");
  return data;
}
async function refreshSession(session: AuthSession): Promise<AuthSession> {
  const data = await authRequest("token?grant_type=refresh_token", { refresh_token: session.refresh_token });
  const next = { ...data, expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600) } as AuthSession;
  saveSession(next); return next;
}
export async function getSession(): Promise<AuthSession | null> {
  const session = readSession();
  if (!session) return null;
  if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000) + 60) {
    try { return await refreshSession(session); } catch { saveSession(null); return null; }
  }
  return session;
}
export async function signUp(email: string, password: string, fullName: string) {
  const data = await authRequest(`signup?redirect_to=${encodeURIComponent(window.location.origin + "/account")}`, { email, password, data: { full_name: fullName } });
  if (data.access_token && data.refresh_token) saveSession({ ...data, expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600) } as AuthSession);
  return data;
}
export async function signIn(email: string, password: string) {
  const data = await authRequest("token?grant_type=password", { email, password });
  saveSession({ ...data, expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600) } as AuthSession);
  return data as AuthSession;
}
export async function currentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } });
  if (!response.ok) { saveSession(null); return null; }
  const user = await response.json() as AuthUser;
  saveSession({ ...session, user });
  return user;
}
export async function resetPassword(email: string) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(window.location.origin + "/account")}`, {
    method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email }),
  });
  if (!response.ok) { const data = await response.json().catch(() => ({})) as Record<string, any>; throw new Error(data.msg || data.message || "Could not send password reset email."); }
}
export async function updatePassword(password: string) {
  const session = await getSession();
  if (!session) throw new Error("Password reset session expired. Request a new link.");
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { method: "PUT", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
  if (!response.ok) { const data = await response.json().catch(() => ({})) as Record<string, any>; throw new Error(data.msg || data.message || "Could not update password."); }
}
export async function signOut() {
  const session = readSession();
  if (session) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` } }).catch(() => undefined);
  }
  saveSession(null);
}
export async function request<T>(table: string, options: { method?: string; query?: string; body?: unknown; prefer?: string } = {}): Promise<T> {
  let session = await getSession();
  if (!session) throw new Error("Please sign in again to continue.");
  const run = (token: string) => fetch(`${SUPABASE_URL}/rest/v1/${table}${options.query ? `?${options.query}` : ""}`, {
    method: options.method || "GET",
    headers: {
      apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
  let response = await run(session.access_token);
  if (response.status === 401) {
    session = await refreshSession(session);
    response = await run(session.access_token);
  }
  const payload = await response.json().catch(() => null) as Record<string, any> | null;
  if (!response.ok) throw new Error(payload?.message || payload?.hint || payload?.details || "Could not save your information.");
  return payload as T;
}
export function acceptAuthRedirect() {
  if (typeof window === "undefined" || !window.location.hash) return false;
  const params = new URLSearchParams(window.location.hash.slice(1));
  const access = params.get("access_token"), refresh = params.get("refresh_token");
  if (!access || !refresh) return false;
  const expires = Number(params.get("expires_in") || "3600");
  const userRaw = params.get("user");
  let user: AuthUser = { id: "", email: "" };
  try { if (userRaw) user = JSON.parse(userRaw) as AuthUser; } catch { /* Auth session will be checked on next sign in. */ }
  saveSession({ access_token: access, refresh_token: refresh, expires_at: Math.floor(Date.now() / 1000) + expires, user });
  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
  return true;
}
