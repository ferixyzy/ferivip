const crypto = require('crypto');
const db = require('../lib/db');
const { authUser, send } = require('../lib/auth');

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function chunk(n) {
  const bytes = crypto.randomBytes(n);
  let s = '';
  for (let i = 0; i < n; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return s;
}

// Format: FERICOD-XXXX-XXXX-XXXX
function makeKey() {
  return `FERICOD-${chunk(4)}-${chunk(4)}-${chunk(4)}`;
}

module.exports = async (req, res) => {
  const user = authUser(req);
  if (!user) return send(res, 401, { success: false, message: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const all = await db.hgetall('keys');
      const list = Object.values(all)
        .filter((k) => k.owner === user.email)
        .sort((a, b) => b.createdAt - a.createdAt);
      return send(res, 200, { success: true, keys: list });
    }

    if (req.method === 'POST') {
      const { label, days } = req.body || {};
      const d = Math.max(0, Math.min(3650, parseInt(days, 10) || 0)); // 0 = permanen
      const key = makeKey();
      const rec = {
        key,
        owner: user.email,
        label: String(label || '').slice(0, 40),
        active: true,
        createdAt: Date.now(),
        expiresAt: d ? Date.now() + d * 86400000 : null,
      };
      await db.hset('keys', key, rec);
      return send(res, 200, { success: true, key: rec });
    }

    if (req.method === 'DELETE') {
      const key = String((req.query && req.query.key) || '');
      const rec = await db.hget('keys', key);
      if (!rec || rec.owner !== user.email) return send(res, 404, { success: false, message: 'Key tidak ditemukan' });
      await db.hdel('keys', key);
      return send(res, 200, { success: true });
    }

    if (req.method === 'PATCH') {
      // toggle aktif / nonaktif
      const key = String((req.query && req.query.key) || '');
      const rec = await db.hget('keys', key);
      if (!rec || rec.owner !== user.email) return send(res, 404, { success: false, message: 'Key tidak ditemukan' });
      rec.active = !rec.active;
      await db.hset('keys', key, rec);
      return send(res, 200, { success: true, key: rec });
    }

    return send(res, 405, { success: false, message: 'Method not allowed' });
  } catch (e) {
    return send(res, 500, { success: false, message: 'Server error: ' + e.message });
  }
};
