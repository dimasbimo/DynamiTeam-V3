'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { AvatarRing, Field, BackLink } from './ui';

// Resize + crop-tengah ke kotak `size`px, output JPEG kecil. Tanpa dependency.
async function resizeToJpeg(file, size = 256) {
  const img = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const s = Math.min(img.width, img.height);
  ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal memproses gambar'))), 'image/jpeg', 0.82)
  );
}

export default function EditProfileForm({ member }) {
  const router = useRouter();
  const fileRef = useRef(null);
  const [nicknameML, setNickname] = useState(member.nicknameML || '');
  const [roleSquad, setRole] = useState(member.roleSquad || '');
  const [idML, setIdML] = useState(member.idML || '');
  const [avatarUrl, setAvatarUrl] = useState(member.avatarUrl || null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  async function handlePickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset agar file yang sama bisa dipilih lagi
    if (!file) return;
    setError('');

    if (!file.type.startsWith('image/')) return setError('File harus berupa gambar.');
    if (file.size > 10 * 1024 * 1024) return setError('Gambar terlalu besar (maks 10MB sebelum kompres).');

    setPhotoBusy(true);
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    try {
      const blob = await resizeToJpeg(file, 256);
      const res = await fetch(`/api/members/${member.id}/avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'image/jpeg' },
        body: blob,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah foto.');
      setAvatarUrl(data.url);
      setPreview(null);
      URL.revokeObjectURL(localUrl);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setPreview(null);
      URL.revokeObjectURL(localUrl);
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleRemovePhoto() {
    setError('');
    setPhotoBusy(true);
    try {
      const res = await fetch(`/api/members/${member.id}/avatar`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus foto.');
      setAvatarUrl(null);
      setPreview(null);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleSave() {
    setError('');
    if (!nicknameML.trim()) return setError('Nickname wajib diisi.');
    if (!roleSquad.trim()) return setError('Role squad wajib diisi.');
    if (!idML.trim()) return setError('ID ML wajib diisi.');

    setBusy(true);
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicknameML, roleSquad, idML }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Gagal menyimpan perubahan.');
      router.push('/member/profile');
      router.refresh();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  const shownSrc = preview || avatarUrl;

  return (
    <div className="max-w-lg mx-auto">
      <BackLink href="/member/profile" label="Batal" />

      <div className="dyn-card dyn-card-accent p-6 anim-slide-up">
        <h1 className="font-display text-xl font-bold text-white text-center mb-5">Edit Profile</h1>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePickPhoto} />

        <div className="flex justify-center mb-3">
          <button
            type="button"
            onClick={() => !photoBusy && fileRef.current?.click()}
            className="relative group"
            aria-label="Ganti foto profil"
          >
            <AvatarRing name={member.nama} src={shownSrc} size={96} />
            <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0e1424] border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              {photoBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </span>
          </button>
        </div>
        <div className="flex items-center justify-center gap-3 mb-5">
          <button type="button" onClick={() => !photoBusy && fileRef.current?.click()} className="text-xs text-amber-400 hover:text-amber-300" disabled={photoBusy}>
            {avatarUrl ? 'Ganti foto' : 'Unggah foto'}
          </button>
          {avatarUrl && (
            <button type="button" onClick={handleRemovePhoto} className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1" disabled={photoBusy}>
              <Trash2 className="w-3 h-3" /> Hapus
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Nickname</span>
              <span className="text-[11px] text-slate-600">{nicknameML.length}/20</span>
            </div>
            <input value={nicknameML} maxLength={20} onChange={(e) => setNickname(e.target.value)} className="input" placeholder="Nickname ML" />
          </div>

          <Field label="Role Squad">
            <input value={roleSquad} onChange={(e) => setRole(e.target.value)} className="input" placeholder="Jungler, Roamer, Midlaner, ..." />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">ID ML</span>
              <span className="text-[11px] text-slate-600">{idML.length}/20</span>
            </div>
            <input value={idML} maxLength={20} onChange={(e) => setIdML(e.target.value)} className="input" placeholder="1234567 (8901)" />
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => router.push('/member/profile')} className="btn-secondary">Batal</button>
            <button type="button" onClick={handleSave} disabled={busy} className="gold-button inline-flex items-center gap-2">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}{busy ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
