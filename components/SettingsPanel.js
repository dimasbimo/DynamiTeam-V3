'use client';

import { useState } from 'react';
import { KeyRound, Loader2, Check, Smartphone } from 'lucide-react';
import { Field } from './ui';
import InstallButton from './InstallButton';

export default function SettingsPanel() {
  const [currentPassword, setCur] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirmPassword, setConf] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSave() {
    setError(''); setOk(false);
    if (newPassword.length < 6) return setError('Password baru minimal 6 karakter.');
    if (newPassword !== confirmPassword) return setError('Konfirmasi password baru tidak cocok.');

    setBusy(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Gagal mengganti password.');
      setOk(true); setCur(''); setNew(''); setConf('');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-bold text-white mb-1">Pengaturan</h1>
      <p className="text-sm text-slate-400 mb-5">Kelola keamanan akun kamu.</p>

      <div className="dyn-card dyn-card-accent p-5">
        <h3 className="font-display text-sm font-semibold text-slate-200 uppercase tracking-wide flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-amber-400" /> Ganti Password
        </h3>
        <div className="space-y-3">
          <Field label="Password Saat Ini">
            <input type="password" value={currentPassword} onChange={(e) => setCur(e.target.value)} className="input" />
          </Field>
          <Field label="Password Baru">
            <input type="password" value={newPassword} onChange={(e) => setNew(e.target.value)} className="input" />
          </Field>
          <Field label="Konfirmasi Password Baru">
            <input type="password" value={confirmPassword} onChange={(e) => setConf(e.target.value)} className="input" />
          </Field>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          {ok && <p className="text-sm text-emerald-400 inline-flex items-center gap-1.5"><Check className="w-4 h-4" /> Password berhasil diganti.</p>}
          <div className="flex justify-end pt-1">
            <button type="button" onClick={handleSave} disabled={busy} className="gold-button inline-flex items-center gap-2">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}{busy ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>

      <div className="dyn-card dyn-card-accent p-5 mt-4">
        <h3 className="font-display text-sm font-semibold text-slate-200 uppercase tracking-wide flex items-center gap-2 mb-3">
          <Smartphone className="w-4 h-4 text-amber-400" /> Aplikasi
        </h3>
        <p className="text-xs text-slate-400 mb-4">Install DynamiTeam ke home screen HP agar terasa seperti aplikasi.</p>
        <InstallButton />
      </div>
    </div>
  );
}
