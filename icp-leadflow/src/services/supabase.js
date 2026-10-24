import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

export const SUPABASE_URL = 'https://ioqfxwtjgefyndtbfudk.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_nrIXKxqO1WQqlDw0Iz40ww_mgOluNTk';
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export async function gateway(action, payload = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('请先登录 Euresis');
  const response = await fetch(SUPABASE_URL + '/functions/v1/integration-gateway', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: 'Bearer ' + session.access_token,
    },
    body: JSON.stringify({ action, ...payload }),
    signal: AbortSignal.timeout(25000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || ('请求失败（HTTP ' + response.status + '）'));
  return data;
}
