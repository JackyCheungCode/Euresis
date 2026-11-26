import { createClient, type Session, type User } from "@supabase/supabase-js";

const SUPABASE_URL = "https://phkqazqhjbzxehgieenn.supabase.co";
const SUPABASE_KEY = "sb_publishable_wxbkywOVDA483LEvf1wUBg_a0E3VAYG";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit" },
});

export type AuthUser = User;
export type AuthSession = Session;

export async function getSession(): Promise<AuthSession | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/account` },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function currentUser(): Promise<AuthUser | null> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!sessionData.session) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account` });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function request<T>(table: string, options: { method?: string; query?: string; body?: unknown; prefer?: string } = {}): Promise<T> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error("Please sign in again to continue.");
  const run = (token: string) => fetch(`${SUPABASE_URL}/rest/v1/${table}${options.query ? `?${options.query}` : ""}`, {
    method: options.method || "GET",
    headers: {
      apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json",
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });
  let response = await run(data.session.access_token);
  if (response.status === 401) {
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) throw refreshed.error || new Error("Your session expired. Please sign in again.");
    response = await run(refreshed.data.session.access_token);
  }
  const payload = await response.json().catch(() => null) as Record<string, any> | null;
  if (!response.ok) throw new Error(payload?.message || payload?.hint || payload?.details || "Could not save your information.");
  return payload as T;
}

export function acceptAuthRedirect() {
  return typeof window !== "undefined" && window.location.hash.includes("access_token=");
}


export type WheelInquirySubmission = {
  reference: string;
  product_slug: string;
  product_code: string;
  product_name: string;
  manufacturing: string;
  customer_name: string;
  company: string;
  contact_email: string;
  contact_phone: string;
  country: string;
  vehicle: Record<string, string>;
  wheel_configurations: Record<string, string>[];
  fitment_status: "verified" | "potential" | "pending_verification" | "unverified" | "not_applicable";
  requirements: string;
};

export async function submitWheelInquiry(payload: WheelInquirySubmission): Promise<void> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const { error: insertError } = await supabase.from("wheel_inquiries").insert({
    ...payload,
    user_id: data.session?.user.id ?? null,
  });
  if (insertError) throw insertError;
}
