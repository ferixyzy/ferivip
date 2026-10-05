const db = require('../lib/db');

// GET /keys.json  (alias: /api/list)
// Daftar PUBLIK semua key yang masih aktif & belum expired.
// Dibaca langsung dari database di setiap request, jadi otomatis ter-update
// saat Admin generate / hapus / nonaktifkan key di dashboard.
// Link ini statis: tidak berubah walau key baru dibuat.
//
// Respon: { "success": true, "count": 2, "updatedAt": 1760000000000,
//           "keys": ["FERICOD-AAAA-BBBB-CCCC", "FERICOD-DDDD-EEEE-FFFF"] }
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'HEAD')
    return res.status(405).send(JSON.stringify({ success: false, count: 0, keys: [] }));

  try {
    const all = await db.hgetall('keys');
    const now = Date.now();
    const keys = Object.values(all)
      .filter((k) => k && k.key && k.active && (!k.expiresAt || k.expiresAt > now))
      .map((k) => k.key)
      .sort();
    return res.status(200).send(JSON.stringify({ success: true, count: keys.length, updatedAt: now, keys }));
  } catch (e) {
    return res.status(500).send(JSON.stringify({ success: false, count: 0, keys: [] }));
  }
};
