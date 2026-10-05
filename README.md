# FERICOD Panel (Vercel)

Full-stack sederhana: HTML + Tailwind (dark red/black) + Vercel Serverless Functions.

## Struktur
```
public/            -> frontend statis (signin, signup, dashboard)
api/               -> serverless: signup, signin, keys, verify, list (/keys.json)
lib/               -> db.js (Redis/Upstash atau /tmp), auth.js (hash + token)
vercel.json        -> clean URL (/dashboard, /signin, /signup) + redirect + rewrite /keys.json
```

## URL (tanpa .html)
- `/signin`, `/signup`, `/dashboard`
- `/` otomatis ke `/signin`

## Deploy
1. Upload folder ini ke GitHub, lalu Import di Vercel (atau `npx vercel`).
2. Settings > Environment Variables:
   - `ACCESS_CODE` = `FERICOD` (kode rahasia, bisa diganti)
   - `SESSION_SECRET` = string acak panjang (WAJIB diganti)
3. **Database persisten (sangat disarankan):** Vercel > Storage > tambah **Upstash Redis**
   (gratis). Env `KV_REST_API_URL` / `KV_REST_API_TOKEN` otomatis terisi dan terdeteksi kode.
   Tanpa ini data disimpan di `/tmp` (hanya untuk testing, bisa hilang kapan saja).

## Domain
Nama seperti `feri.app.vercel` tidak bisa dipilih bebas; subdomain Vercel berbentuk
`nama-project.vercel.app`. Ganti nama project di Vercel (Settings > General) jadi mis. `feri`
agar jadi `feri.vercel.app`, lalu halaman akan jadi `feri.vercel.app/dashboard`.
Atau pasang domain sendiri di Settings > Domains.

## List Key Online (1 link statis untuk Roblox)
`GET /keys.json` (alias `/api/list`) -> daftar PUBLIK semua key yang **aktif & belum expired**:
```json
{ "success": true, "count": 2, "updatedAt": 1760000000000,
  "keys": ["FERICOD-AAAA-BBBB-CCCC", "FERICOD-DDDD-EEEE-FFFF"] }
```
Dibaca langsung dari database di setiap request, jadi saat Admin **generate / hapus / ON-OFF**
key di dashboard, list ini langsung ikut berubah. Link-nya tidak pernah berganti,
script Roblox cukup dipasang sekali.

```lua
local HttpService = game:GetService("HttpService")
local LIST_URL = "https://feri.vercel.app/keys.json" -- statis

local function isKeyValid(key)
    local ok, res = pcall(function() return HttpService:GetAsync(LIST_URL, true) end)
    if not ok then return false end
    local ok2, data = pcall(function() return HttpService:JSONDecode(res) end)
    if not ok2 or not data.success then return false end
    key = string.upper(key)
    for _, k in ipairs(data.keys) do if k == key then return true end end
    return false
end
```

## API Verify (alternatif cek 1 key)
`GET /api/verify?key=FERICOD-XXXX-XXXX-XXXX` -> `{ "success": true }` / `{ "success": false }`

## Catatan keamanan
- Password di-hash (scrypt), sesi pakai token HMAC 7 hari.
- Ganti `ACCESS_CODE` dan `SESSION_SECRET` sebelum dipakai publik.
- `/keys.json` bersifat publik: siapa pun yang tahu link-nya bisa melihat semua key aktif.
