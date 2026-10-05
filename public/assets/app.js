// Helper bersama untuk semua halaman
const TOKEN_KEY = 'fericod_token';
const EMAIL_KEY = 'fericod_email';

const Auth = {
  get token() { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  get email() { try { return localStorage.getItem(EMAIL_KEY); } catch { return null; } },
  save(token, email) { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(EMAIL_KEY, email); },
  clear() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(EMAIL_KEY); },
};

async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (Auth.token) headers.Authorization = 'Bearer ' + Auth.token;
  const r = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let data = {};
  try { data = await r.json(); } catch {}
  if (r.status === 401 && path.startsWith('/api/keys')) { Auth.clear(); location.href = '/signin'; }
  return { ok: r.ok, status: r.status, data };
}

function toast(msg, bad) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.className =
    'fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg text-sm border ' +
    (bad ? 'bg-black border-blood text-blood-light' : 'bg-black border-green-500 text-green-400');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}
