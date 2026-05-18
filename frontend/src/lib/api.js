const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? `HTTP ${res.status}`);
  }
  return json;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
};
