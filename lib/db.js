// Lapisan database sederhana.
// - Jika env UPSTASH_REDIS_REST_URL / TOKEN (atau KV_REST_API_URL / TOKEN dari Vercel KV/Upstash) ada -> pakai Redis (PERSISTEN).
// - Jika tidak ada -> fallback ke file /tmp (HANYA untuk testing, data bisa hilang saat cold start).
const fs = require('fs');

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const USE_REDIS = !!(REDIS_URL && REDIS_TOKEN);
const FILE = '/tmp/fericod-db.json';

async function redis(cmd) {
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

function readFile() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; }
}
function writeFile(d) { fs.writeFileSync(FILE, JSON.stringify(d)); }

async function hget(table, field) {
  if (USE_REDIS) {
    const v = await redis(['HGET', table, field]);
    return v ? JSON.parse(v) : null;
  }
  const d = readFile();
  return (d[table] && d[table][field]) || null;
}

async function hset(table, field, value) {
  if (USE_REDIS) { await redis(['HSET', table, field, JSON.stringify(value)]); return; }
  const d = readFile();
  d[table] = d[table] || {};
  d[table][field] = value;
  writeFile(d);
}

// true jika berhasil dibuat, false jika field sudah ada
async function hsetnx(table, field, value) {
  if (USE_REDIS) return (await redis(['HSETNX', table, field, JSON.stringify(value)])) === 1;
  const d = readFile();
  d[table] = d[table] || {};
  if (d[table][field]) return false;
  d[table][field] = value;
  writeFile(d);
  return true;
}

async function hdel(table, field) {
  if (USE_REDIS) { await redis(['HDEL', table, field]); return; }
  const d = readFile();
  if (d[table]) delete d[table][field];
  writeFile(d);
}

async function hgetall(table) {
  if (USE_REDIS) {
    const arr = (await redis(['HGETALL', table])) || [];
    const out = {};
    for (let i = 0; i < arr.length; i += 2) out[arr[i]] = JSON.parse(arr[i + 1]);
    return out;
  }
  return readFile()[table] || {};
}

module.exports = { hget, hset, hsetnx, hdel, hgetall, USE_REDIS };
