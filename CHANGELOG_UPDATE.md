# DynamiTeam — Update UI/UX (Login, Member, Profile, Leaderboard, Admin Activity)

Status build: `next build` **sukses (exit 0)**, compiled successfully, type-check lolos,
24 route terdaftar, tidak ada error import/route.

> Catatan Prisma saat build: muncul `PrismaClientInitializationError` karena
> `node_modules` di ZIP ini di-generate untuk **Windows**, sedangkan sandbox build
> memakai Linux. Ini **bukan** error kode — semua halaman data pakai
> `force-dynamic` sehingga dirender saat request, bukan saat build. Di mesin
> Windows kamu, pesan ini tidak muncul. (Kalau nanti deploy ke host Linux
> seperti Vercel, tambahkan `binaryTargets = ["native","debian-openssl-3.0.x"]`
> di `schema.prisma` lalu `prisma generate` — ini isu deploy lama, bukan dari update ini.)

## Aturan yang dijaga (tidak diubah)
- Login, session, NextAuth, Prisma, seluruh API activity/nyawa/process-week **utuh**.
- Konsep sistem: activity point, nyawa maks 4, status Aman/Waspada/Terancam/Kick,
  riwayat mingguan — **tidak diubah** (`lib/rules.js` tidak disentuh).
- **Tidak ada dependency baru.** Hanya Tailwind + CSS custom + lucide-react (sudah ada).
- Semua export lama di `components/ui.js` dipertahankan → AdminDashboard lama tetap jalan.

## File yang diubah
| File | Perubahan |
|---|---|
| `app/globals.css` | Retheme total ke gold/amber/bronze + glow ungu. Token baru (`--dyn-bg/panel/panel-soft/border/gold/gold-soft/amber/danger/success/purple`), class baru (`.premium-bg .login-bg .gold-text .gold-button .sidebar-shell .nav-item(-active) .avatar-ring .trophy-glow`), animasi baru (glow pulse, ember particles) + `prefers-reduced-motion`. Class lama dipertahankan; `--dyn-cyan/--dyn-gold-deep` dijadikan alias agar referensi lama tidak pecah. |
| `app/login/page.js` | Redesain sesuai LOGIN.png: glass card, logo + "DynamiTeam / ACTIVITY SYSTEM", "Welcome Back, DynamiTeam", subtitle, input user/lock, **show/hide password**, tombol gold "Login", ember particles. **Link "Hubungi Admin" dihapus**; hanya "Lupa password?" (tanpa kontak admin). `signIn('credentials')` & error handling tidak diubah. |
| `app/member/MemberDashboard.js` | Diubah jadi konten preview (di dalam sidebar shell): hero welcome + avatar, kartu Total Activity Point (+delta minggu lalu), Status Minggu Ini (nyawa shard + meter), preview Riwayat, preview Top Activity → semua nge-link ke halaman lengkap. |
| `app/member/page.js` | Fetch data untuk dashboard (leaderboard preview, rank, monthly total, delta) + bungkus `MemberShell`. Logika auth/redirect member tetap. |
| `app/api/members/[id]/route.js` | **PATCH di-harden** (lihat bagian Keamanan). |
| `app/admin/AdminDashboard.js` | Hanya menambah 2 link header (Activity Bulanan, Leaderboard) + 2 icon import. Tabel & logika edit member **tidak disentuh**. |

## File baru
- `lib/monthly.js` — sumber tunggal agregasi "bulanan" + ranking (dipakai leaderboard, profil, admin activity).
- `components/ui.js` (ditulis ulang) — tambah `AppShell, AvatarRing, StatCard, SectionCard, LeaderboardList, TrophyAward, MonthSelect, PremiumButton, BackLink`; `NyawaShards` di-restyle jadi shard gold.
- `components/MemberShell.js`, `components/AdminShell.js` — konfigurasi sidebar + bottom nav mobile.
- `components/ProfileView.js` — profil (dipakai profil sendiri & member lain).
- `components/EditProfileForm.js` — form edit profil.
- `components/LeaderboardView.js` — leaderboard + tab + trophy.
- `components/HistoryTable.js` — tabel riwayat mingguan (reusable).
- `components/AdminActivityView.js`, `components/AdminActivityDetail.js` — tampilan admin.
- `components/SettingsPanel.js` — ganti password inline.
- Halaman baru:
  - `app/member/profile/page.js`, `app/member/profile/[id]/page.js`, `app/member/profile/edit/page.js`
  - `app/member/leaderboard/page.js`, `app/member/riwayat/page.js`, `app/member/aktivitas/page.js`, `app/member/settings/page.js`
  - `app/admin/activity/page.js`, `app/admin/activity/[id]/page.js`, `app/admin/leaderboard/page.js`, `app/admin/settings/page.js`

## Keamanan — perubahan PATCH `/api/members/[id]`
Sebelumnya admin-only. Sekarang: **admin** boleh ubah siapa saja; **member** boleh
ubah **hanya profil miliknya sendiri** (`session.memberId === params.id`, dicek di server).
Field yang diterima **di-whitelist ketat**: `nicknameML`, `roleSquad`, `idML` (nama hanya admin).
Endpoint ini **tidak pernah** menerima `activityPoint`, `nyawaCurrent`, atau `status` dari
siapa pun — jadi member **tidak bisa** menyuntik activity point sendiri lewat edit profil.
Edit member dari admin tetap berfungsi seperti semula.

## Yang sengaja TIDAK saya palsukan (biar tidak menyesatkan di produksi)
1. **"Bulanan" itu rekonstruksi, bukan metrik asli.** Skema tidak menyimpan total bulanan;
   `member.activityPoint` adalah nilai minggu berjalan yang ditimpa tiap proses. Angka
   leaderboard/peringkat = jumlah `WeeklyHistory` di bulan terpilih, fallback ke
   `member.activityPoint` untuk bulan berjalan. Untuk angka yang otoritatif → perlu ubah skema.
2. **Top Improvement** = tab "Segera hadir" (butuh pembanding antar-bulan yang belum dilacak).
3. **Avatar** = placeholder inisial + glow (belum ada kolom avatar di DB & belum ada upload).
4. **Label login "Username / Nickname / ID ML"** hanya kosmetik sesuai mockup —
   `authorize()` tetap cocokkan `username` saja. Login **tidak** saya ubah. Kalau mau login
   pakai nickname/ID ML juga, itu perlu ubah `lib/auth.js` (bilang kalau mau).

## Cara menjalankan (di mesin kamu)
```
# pastikan .env asli kamu ada (file .env di zip ini hanya TEMPLATE placeholder)
npm install
npm run build   # atau: npm run dev
```
