import { supabase } from './supabase';

const BASE = (
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3000')
).replace(/\/$/, '');

export async function auditClientEvent(action, details = {}, { authenticated = false } = {}) {
  try {
    const headers = { 'Content-Type': 'application/json' };

    if (authenticated) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    await fetch(`${BASE}/api/audit/client${authenticated ? '/authenticated' : ''}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action,
        ...details,
      }),
    });
  } catch {
    // Audit logging must never block the user flow.
  }
}
