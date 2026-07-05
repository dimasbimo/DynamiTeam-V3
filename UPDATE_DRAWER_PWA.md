# Update: Hamburger Kiri + Drawer Profil + PWA

Build lolos (`✓ Compiled successfully`, 21/21 halaman, `/manifest.webmanifest` &
`/api/members/me` terdaftar). **Tanpa dependency baru.**

## Cara pakai (paling aman untuk pemula)
Extract zip ini ke folder **baru**, lalu:
1. Salin `.env` **asli**-mu (yang berisi kredensial Neon + BLOB_READ_WRITE_TOKEN) ke folder baru itu. **Jangan** pakai `.env` template dari zip.
2. `npm install`
3. `npm run dev` (atau deploy ke Vercel seperti biasa).

Tidak ada `npm install` package tambahan. Tidak ada perubahan schema. Tidak ada setting Vercel khusus — PWA otomatis jalan karena Vercel sudah HTTPS.

---

## Yang berubah & alasannya

### 1. Hamburger pindah ke kiri (mobile)
- **`components/ui.js`** — `AppShell`: topbar mobile diubah jadi `[hamburger] [logo+nama] ... [tombol admin]`. Drawer-nya **sudah** slide dari kiri sejak awal (`left-0`), jadi itu tak perlu diubah.

### 2. Drawer profil ala Roblox (mobile)
- **`components/ui.js`** — `AppShell` menerima prop opsional `profile`. Kalau ada, drawer menampilkan header: foto lingkaran + nama + role/username, tappable ke `/member/profile`. Kalau `profile` null (mis. drawer admin), header tak muncul → **drawer admin tak berubah**.
- **`components/MemberShell.js`** — mengambil profil via `fetch('/api/members/me')` lalu meneruskannya ke `AppShell`.
- **`app/api/members/me/route.js`** (baru) — GET profil ringkas member yang login (nama, nickname, role, avatarUrl).
- **Kenapa lewat fetch, bukan dioper dari tiap halaman?** Supaya **8 halaman member tidak perlu diubah sama sekali** (sesuai permintaanmu "jangan ubah halaman lain"). Konsekuensinya: profil di drawer muncul sepersekian detik setelah drawer dibuka (fetch ringan). Itu trade-off yang saya pilih sadar.

### 3. PWA (tanpa dependency baru)
- **`app/manifest.js`** (baru) — manifest native Next: name/short_name, standalone, start_url `/`, theme `#0b0f1c`, background `#070a12`, portrait, icon 192/512/maskable, shortcuts (Dashboard/Profile/Leaderboard).
- **`public/icons/`** (baru) — `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (di-generate dari `logo.png`-mu; maskable diberi padding safe-zone di atas bg gelap).
- **`public/sw.js`** (baru) — service worker. Aturan cache **persis** seperti mautmu:
  - `/api/*` → **selalu jaringan, tak pernah di-cache** (activity, nyawa, leaderboard, session real-time).
  - Navigasi halaman → **network-first**, offline → `offline.html`. Halaman **tidak** di-cache, jadi dashboard/nyawa selalu terbaru.
  - `/_next/static`, `/icons`, logo → cache-first (aman, immutable).
- **`public/offline.html`** (baru) — halaman offline bertema gelap: "Kamu sedang offline. Sambungkan internet untuk melihat data terbaru DynamiTeam."
- **`components/PWARegister.js`** (baru) + **`app/layout.js`** — daftarkan SW + theme-color + meta iOS.
- **`components/InstallButton.js`** (baru) + **`components/SettingsPanel.js`** — tombol "Install Aplikasi" di Pengaturan; hanya muncul jika browser mendukung & belum terinstall.

---

## Yang TIDAK saya ubah (sesuai permintaan)
Login/logout, role admin/member, aturan nyawa/activity, schema DB, warna tema,
isi dashboard/card/riwayat/leaderboard, semua halaman admin (kecuali nav bersama
`AppShell` yang memang perlu untuk hamburger — dan itu pun aditif/opsional).

---

## Batasan jujur (belum bisa saya verifikasi)
1. **PWA hanya bisa dites di HP/HTTPS asli.** Saya cuma memastikan kode compile. Install ke home screen, offline page, dan service worker **wajib kamu tes** di Vercel (HTTPS) atau `localhost`. Di `http://` selain localhost, SW tidak jalan.
2. **Tombol Install tidak muncul di iOS.** iOS Safari tak mendukung `beforeinstallprompt`. Di iOS, komponen otomatis menampilkan instruksi manual (Share → Add to Home Screen) sebagai gantinya. Ini batasan Apple, bukan bug.
3. **Update service worker:** kalau nanti kamu ubah aset dan mau paksa refresh cache user, naikkan versi di `public/sw.js` (`const CACHE = 'dynamiteam-v2'`).
