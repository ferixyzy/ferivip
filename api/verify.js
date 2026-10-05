const db = require('../lib/db');

// GET /api/verify?key=FERICOD-XXXX-XXXX-XXXX  ->  { "success": true }  atau  { "success": false }
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const key = String((req.query && req.query.key) || '').trim().toUpperCase();
  if (!/^FERICOD-[A-Z0-9-]{4,40}$/.test(key)) return res.status(200).send(JSON.stringify({ success: false }));

  try {
    const rec = await db.hget('keys', key);
    const valid = !!rec && rec.active && (!rec.expiresAt || rec.expiresAt > Date.now());
    return res.status(200).send(JSON.stringify({ success: valid }));
  } catch (e) {
    return res.status(500).send(JSON.stringify({ success: false }));
  }
};
