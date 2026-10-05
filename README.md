# FERICOD Panel (Vercel)

Full-stack sederhana: HTML + Tailwind (dark red/black) + Vercel Serverless Functions.

## Struktur
```
public/            -> frontend statis (signin, signup, dashboard)
api/               -> serverless: signup, signin, keys, verify
lib/               -> db.js (Redis/Upstash atau /tmp), auth.js (hash + token)
vercel.json        -> clean URL (/dashboard, /signin, /signup) + redirect
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

## API Verify
`GET /api/verify?key=FERICOD-XXXX-XXXX-XXXX` -> `{ "success": true }` / `{ "success": false }`

Lua (Roblox, aktifkan Allow HTTP Requests):
```lua
local HttpService = game:GetService("HttpService")
local ok, res = pcall(function()
    return HttpService:GetAsync("https://feri.vercel.app/api/verify?key=FERICOD-XXXX-XXXX-XXXX")
end)
if ok and HttpService:JSONDecode(res).success then print("valid") end
```

## Catatan keamanan
- Password di-hash (scrypt), sesi pakai token HMAC 7 hari.
- Ganti `ACCESS_CODE` dan `SESSION_SECRET` sebelum dipakai publik.
