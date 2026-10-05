const crypto = require('crypto');

const ACCESS_CODE = (process.env.ACCESS_CODE || 'FERICOD').trim();
const SECRET = process.env.SESSION_SECRET || 'ganti-secret-ini-di-vercel-env';
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 hari

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function checkPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  const real = Buffer.from(hash, 'hex');
  return real.length === test.length && crypto.timingSafeEqual(real, test);
}

function signToken(email) {
  const body = b64url(JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS, ac: 1 }));
  const sig = b64url(crypto.createHmac('sha256', SECRET).update(body).digest());
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expect = b64url(crypto.createHmac('sha256', SECRET).update(body).digest());
  if (sig.length !== expect.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  try {
    const p = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
    if (!p.exp || p.exp < Date.now() || !p.ac) return null;
    return p;
  } catch { return null; }
}

function codeOk(code) {
  const a = Buffer.from(String(code || '').trim());
  const b = Buffer.from(ACCESS_CODE);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function authUser(req) {
  const h = req.headers.authorization || '';
  return verifyToken(h.startsWith('Bearer ') ? h.slice(7) : '');
}

function send(res, status, data) {
  res.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(data));
}

function validEmail(e) {
  return typeof e === 'string' && e.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

module.exports = { hashPassword, checkPassword, signToken, verifyToken, codeOk, authUser, send, validEmail };
