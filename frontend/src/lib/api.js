import { supabase } from './supabase';

const BASE = (
  import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '' : 'http://localhost:3000')
).replace(/\/$/, '');

async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function request(path, options = {}) {
  const token = await getToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 401) {
    await supabase.auth.signOut();
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }
  if (res.status === 204) return null;
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  put: (path, body) =>
    request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  // For multipart/form-data (file uploads) — do NOT stringify, browser sets Content-Type with boundary
  postForm: (path, formData) => request(path, { method: 'POST', body: formData }),
  delete: (path, body) =>
    request(path, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    }),
};
