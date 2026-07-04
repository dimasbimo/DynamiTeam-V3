'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { AvatarRing, Field, BackLink } from './ui';

export default function EditProfileForm({ member }) {
  const router = useRouter();
  const [nicknameML, setNickname] = useState(member.nicknameML || '');
  const [roleSquad, setRole] = useState(member.roleSquad || '');
  const [idML, setIdML] = useState(member.idML || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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

  return (
    <div className="max-w-lg mx-auto">
      <BackLink href="/member/profile" label="Batal" />

      <div className="dyn-card dyn-card-accent p-6 anim-slide-up">
        <h1 className="font-display text-xl font-bold text-white text-center mb-5">Edit Profile</h1>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <AvatarRing name={member.nama} size={96} />
            <span className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0e1424] border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Camera className="w-4 h-4" />
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 text-center -mt-4 mb-5">Foto profil belum didukung — avatar dibuat otomatis dari nama.</p>

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
