-- FERICOD Key Check (Delta / executor)
-- Hanya 1 link statis. Tidak perlu diganti saat membuat key baru.

local LIST_URL = "https://NAMA-PROJECT.vercel.app/keys.json" -- ganti sekali saja
local KEY = (getgenv and getgenv().Key) or "FERICOD-XXXX-XXXX-XXXX"

local HttpService = game:GetService("HttpService")

local function checkKey(input)
    input = tostring(input or ""):gsub("%s+", ""):upper()
    if input == "" then return false, "Key kosong" end

    local ok, body = pcall(function()
        return game:HttpGet(LIST_URL .. "?t=" .. tostring(os.time()))
    end)
    if not ok then return false, "Gagal konek ke server" end

    local okJson, data = pcall(function() return HttpService:JSONDecode(body) end)
    if not okJson or type(data) ~= "table" or not data.success then
        return false, "Respon server tidak valid"
    end

    for _, k in ipairs(data.keys) do
        if k == input then return true end
    end
    return false, "Key tidak valid / expired"
end

local valid, err = checkKey(KEY)
if not valid then
    warn("[FERICOD] " .. tostring(err))
    return
end

print("[FERICOD] Key valid!")

-- === LETAKKAN SCRIPT UTAMA KAMU DI BAWAH INI ===
