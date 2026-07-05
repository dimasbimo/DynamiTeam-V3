'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Loader2, Trophy, Star } from 'lucide-react';
import { ModalShell, Field, EmptyState, AvatarRing } from './ui';
import { rankFromStars } from '../lib/highrank';
import { roleLabel } from '../lib/roles';

export default function HighrankManager({ entries, members }) {
  const router = useRouter();
  const [modal, setModal] = useState(null); // {type:'add'|'edit'|'delete', entry?}
  const [form, setForm] = useState({ memberId: '', rankName: 'Mythic', point: 0, season: '', note: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const usedIds = new Set(entries.map((e) => e.memberId));
  const availableMembers = members.filter((m) => !usedIds.has(m.id));

  const openAdd = () => {
    setError('');
    setForm({ memberId: availableMembers[0]?.id || '', rankName: 'Mythic', point: 0, season: '', note: '' });
    setModal({ type: 'add' });
  };
  const openEdit = (e) => {
    setError('');
    setForm({ memberId: e.memberId, rankName: e.rankName, point: e.point, season: e.season || '', note: e.note || '' });
    setModal({ type: 'edit', entry: e });
  };

  async function save() {
    setError('');
    if (!form.memberId) return setError('Pilih member dulu.');
    setBusy(true);
    try {
      const isEdit = modal.type === 'edit';
      const url = isEdit ? `/api/highrank/${modal.entry.id}` : '/api/highrank';
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: form.memberId,
          point: Number(form.point) || 0,
          season: form.season,
          note: form.note,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan.');
      setModal(null);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/highrank/${modal.entry.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus.');
      setModal(null);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" /> Leaderboard Highrank
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Kelola daftar rank tertinggi member (urut otomatis by bintang).</p>
        </div>
        <button onClick={openAdd} disabled={availableMembers.length === 0} className="gold-button inline-flex items-center gap-2 shrink-0 disabled:opacity-50">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Tambah</span>
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="dyn-card"><EmptyState title="Belum ada data highrank." hint="Tekan Tambah untuk memilih member dan mengisi rank-nya." /></div>
      ) : (
        <div className="space-y-2.5">
          {entries.map((e, i) => (
            <div key={e.id} className="dyn-card p-3.5 flex items-center gap-3">
              <span className="font-display text-slate-400 w-6 text-center shrink-0">{i + 1}</span>
              <AvatarRing name={e.member.nama} src={e.member.avatarUrl} size={40} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-100 truncate">{e.member.nama}</div>
                <div className="text-[11px] text-slate-500 truncate">{e.rankName} · {roleLabel(e.member)}</div>
              </div>
              <div className="text-right shrink-0 mr-1">
                <div className="font-display font-bold text-amber-300 inline-flex items-center gap-1"><Star className="w-3.5 h-3.5" />{e.point}</div>
              </div>
              <button onClick={() => openEdit(e)} className="p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-amber-300 shrink-0" aria-label="Edit"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => { setError(''); setModal({ type: 'delete', entry: e }); }} className="p-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-rose-400 shrink-0" aria-label="Hapus"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      {/* Modal add / edit */}
      {(modal?.type === 'add' || modal?.type === 'edit') && (
        <ModalShell title={modal.type === 'add' ? 'Tambah Highrank' : 'Edit Highrank'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <Field label="Member">
              <select
                value={form.memberId}
                onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value }))}
                className="input"
                disabled={modal.type === 'edit'}
              >
                {modal.type === 'edit' ? (
                  <option value={modal.entry.memberId}>{modal.entry.member.nama}</option>
                ) : availableMembers.length === 0 ? (
                  <option value="">Semua member sudah ada di highrank</option>
                ) : (
                  availableMembers.map((m) => <option key={m.id} value={m.id}>{m.nama}</option>)
                )}
              </select>
            </Field>
            <Field label="Jumlah Bintang">
              <input type="number" min={0} value={form.point} onChange={(e) => setForm((f) => ({ ...f, point: e.target.value }))} className="input" placeholder="mis. 51" />
            </Field>
            <div className="text-xs text-slate-400 -mt-1.5 pl-0.5">
              Rank otomatis: <span className="text-amber-300 font-medium">{rankFromStars(form.point)}</span>
              <span className="text-slate-600"> · Mythic 0-24 · Honor 25-49 · Glory 50-99 · Immortal 100+</span>
            </div>
            <Field label="Season (opsional)">
              <input value={form.season} onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))} className="input" placeholder="mis. S32" />
            </Field>
            <Field label="Catatan (opsional)">
              <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} className="input" />
            </Field>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
              <button onClick={save} disabled={busy} className="gold-button inline-flex items-center gap-2">
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}{busy ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Modal delete */}
      {modal?.type === 'delete' && (
        <ModalShell title="Hapus Highrank" onClose={() => setModal(null)}>
          <p className="text-sm text-slate-300">Hapus <span className="text-white font-medium">{modal.entry.member.nama}</span> dari leaderboard highrank? Data member tidak akan terhapus.</p>
          {error && <p className="text-sm text-rose-400 mt-2">{error}</p>}
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
            <button onClick={remove} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-white text-sm font-medium">
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} Hapus
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
