# Fitur Foto Profil (Vercel Blob) — Panduan Setup

Build lolos (`✓ Compiled successfully`, route `/api/members/[id]/avatar` terdaftar).
**Yang sudah diverifikasi:** kode compile & semua route ada. **Yang HARUS kamu
verifikasi sendiri** (tak bisa dari sisi saya): (1) upload beneran jalan di Vercel,
(2) migrasi kolom di DB produksi. Alasannya di bagian bawah.

---

## ⚠️ MENDESAK — bukan soal fitur ini
File `.env` di ZIP yang kamu upload sebelumnya berisi **kredensial Neon + NEXTAUTH_SECRET
asli**. Anggap sudah bocor. **Rotate sekarang:**
1. Neon dashboard → reset password database → update `DATABASE_URL` di Vercel.
2. `openssl rand -base64 32` → set `NEXTAUTH_SECRET` baru di Vercel.
3. Redeploy.
`.env` yang saya kembalikan hanya placeholder.

---

## Yang kamu WAJIB lakukan agar fitur jalan (2 langkah)

### 1. Buat Blob store + token
Vercel Dashboard → project → **Storage** → **Create** → **Blob**. Vercel otomatis
menyuntik `BLOB_READ_WRITE_TOKEN` ke Environment Variables project (Production &
Preview). Untuk dev lokal: `vercel env pull` (atau salin token ke `.env` lokalmu).
Tanpa token ini, upload akan gagal dengan error 500.

### 2. Migrasi DB (menambah kolom `avatarUrl`)
Kolom baru bersifat **nullable → non-destruktif** (baris lama otomatis NULL, tak ada
data hilang). File migrasi sudah disiapkan di
`prisma/migrations/20260705090000_add_avatar_url/`.

- **Lokal (dev):** `npx prisma migrate dev` — apply + regenerate client.
- **Produksi:** `npx prisma migrate deploy` dengan `DATABASE_URL` menunjuk DB produksi.
  JANGAN pakai `migrate dev` ke prod. `migrate deploy` hanya menerapkan migrasi yang
  ada, tak pernah reset.
- Karena `postinstall: prisma generate` sudah ada, Vercel akan regenerate client saat
  build. Tapi **apply migrasi tetap perlu kamu jalankan** (build tak menjalankan migrasi
  secara default).

Setelah dua langkah ini: buka **Edit Profile** → klik foto/kamera → pilih gambar.

---

## Apa saja yang berubah

**Baru**
- `app/api/members/[id]/avatar/route.js` — POST (upload) & DELETE (hapus). Cek izin
  sama seperti PATCH: admin bebas, member hanya dirinya. Validasi **magic-byte di
  server** (bukan cuma Content-Type), batas **512KB**, dan **hapus foto lama** saat
  ganti agar Blob tak jadi sampah.
- `prisma/migrations/20260705090000_add_avatar_url/migration.sql`

**Diubah**
- `prisma/schema.prisma` — Member tambah `avatarUrl String?`.
- `package.json` — tambah dependency `@vercel/blob`.
- `components/EditProfileForm.js` — input file + **resize/crop ke 256px JPEG di client**
  (canvas, tanpa dependency) + preview instan + tombol "Ganti/Hapus foto". Catatan
  "foto belum didukung" dihapus.
- Avatar kini tampil di semua tempat: profil, dashboard, leaderboard (member & admin),
  daftar & detail activity admin. `avatarUrl` diteruskan ke tiap mapping + `AvatarRing`.
  (`AvatarRing` sendiri sudah mendukung `src` + fallback inisial, jadi tak diubah.)

**Moderasi:** admin membuka `/admin/activity/[id]`… (belum ada tombol hapus foto di UI
admin — endpoint DELETE sudah mengizinkan admin, jadi tuas moderasi *ada di API* tapi
**belum ada tombolnya di layar admin**. Lihat "Batasan" di bawah.)

---

## Batasan / yang belum & risiko (jujur)

1. **Belum saya uji upload sungguhan.** Sandbox saya tak punya `BLOB_READ_WRITE_TOKEN`
   maupun akses ke API Blob/DB-mu. Saya hanya bisa memastikan kode compile. Titik yang
   paling mungkin bermasalah saat kamu tes: token belum di-set, atau migrasi belum
   di-apply ke prod (maka kolom `avatarUrl` tak ada → error saat simpan).
2. **Tombol "Hapus Foto" untuk admin belum ada di UI.** Endpoint DELETE sudah mengizinkan
   admin menghapus foto member mana pun, tapi saya belum menaruh tombolnya di halaman
   admin. Untuk moderasi penuh (foto asli = suatu saat ada yang upload tak pantas), kamu
   perlu tombol itu. Bilang kalau mau saya tambahkan.
3. **Biaya:** di Hobby, Blob gratis (1GB storage, 10GB transfer/bulan). Avatar 256px
   ~30–80KB → muat ribuan. Praktis nol untuk squad. Tapi Hobby hanya untuk non-komersial.
4. **Format:** menerima JPG/PNG/WebP (deteksi magic-byte). GIF animasi tidak didukung
   (akan ditolak sebagai bukan gambar valid) — resize canvas juga akan meng-flatten-nya.
