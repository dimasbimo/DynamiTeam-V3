'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, Pencil, History as HistoryIcon, RotateCcw, Play, Users,
  Search, Loader2, PlusCircle, MinusCircle,
} from 'lucide-react';
import { roleLabel, MAIN_ROLES, SUB_ROLES } from '../../lib/roles';
import {
  NyawaShards, StatusBadge, DeltaTag, ModalShell, Field, fmtDate, MAX_NYAWA,
  ActivityMeter, getActivityZone, EmptyState, STATUS_STYLES,
} from '../../components/ui';

const FILTERS = [
  { key: 'ALL', label: 'Semua' },
  { key: 'AMAN', label: 'Aman' },
  { key: 'WASPADA', label: 'Waspada' },
  { key: 'TERANCAM_KICK', label: 'Terancam' },
  { key: 'KICK', label: 'Kick' },
];

// PENTING: dua komponen ini HARUS di level atas file, BUKAN di dalam
// AdminDashboard. Komponen yang didefinisikan di dalam komponen lain dibuat
// ulang setiap render, sehingga React membongkar-pasang elemennya terus -
// input kehilangan fokus setiap satu ketikan.
function ActionButtons({ m, large = false, onHistory, onEdit, onReset, onAddLife, onDecreaseLife, onDelete }) {
  const isKick = m.status === 'KICK';
  const btn = large ? 'p-2' : 'p-1.5';
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onHistory(m.id)} title="Riwayat" className={`${btn} rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200`}><HistoryIcon className="w-4 h-4" /></button>
      <button onClick={() => onEdit(m)} title="Edit" className={`${btn} rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200`}><Pencil className="w-4 h-4" /></button>
    {m.nyawaCurrent < MAX_NYAWA && (
  <button
    onClick={() => onAddLife(m.id)}
    title="Tambah nyawa / bonus"
    className={`${btn} rounded-md hover:bg-slate-800 text-slate-400 hover:text-emerald-400`}
  >
    <PlusCircle className="w-4 h-4" />
  </button>
    )}

    {m.nyawaCurrent > 0 && (
      <button
        onClick={() => onDecreaseLife(m.id)}
        title="Kurangi nyawa / hukuman"
        className={`${btn} rounded-md hover:bg-slate-800 text-slate-400 hover:text-orange-400`}
      >
        <MinusCircle className="w-4 h-4" />
      </button>
    )}

    {(m.nyawaCurrent < MAX_NYAWA || isKick) && (
      <button onClick={() => onReset(m.id)} title="Reset nyawa" className={`${btn} rounded-md hover:bg-slate-800 text-slate-400 hover:text-amber-400`}><RotateCcw className="w-4 h-4" /></button>
    )}

    <button onClick={() => onDelete(m.id)} title="Hapus" className={`${btn} rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400`}><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

function ActivityInput({ m, withMeter = false, drafts, setDrafts, commitActivity }) {
  const isKick = m.status === 'KICK';
  const draftVal = drafts[m.id] !== undefined ? drafts[m.id] : m.activityPoint;
  const zone = getActivityZone(m.activityPoint);
  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="number" min="0" disabled={isKick} inputMode="numeric"
          value={draftVal}
          onChange={(e) => setDrafts((d) => ({ ...d, [m.id]: e.target.value }))}
          onBlur={() => commitActivity(m.id)}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          className="input w-28"
        />
        {!isKick && <span className={`text-[11px] font-medium ${zone.text}`}>{zone.label}</span>}
      </div>
      {withMeter && !isKick && <div className="mt-2"><ActivityMeter value={m.activityPoint} showLabel={false} /></div>}
      <div className={`text-[11px] mt-1 ${m.activityInputted ? 'text-emerald-400' : 'text-slate-500'}`}>
        {isKick ? 'Terkunci (Kick)' : m.activityInputted ? 'Siap diproses' : 'Belum diinput minggu ini'}
      </div>
    </div>
  );
}

export default function AdminDashboard({ initialMembers, initialWeekNumber }) {
  const [members, setMembers] = useState(initialMembers);
  const [weekNumber, setWeekNumber] = useState(initialWeekNumber);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [form, setForm] = useState({ nama: '', nicknameML: '', idML: '', roleSquad: '', mainRole: '', subRole: '', username: '', password: '' });
  const [linkToSelf, setLinkToSelf] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  function showError(msg) { setToast({ type: 'error', msg }); }
  function showOk(msg) { setToast({ type: 'ok', msg }); }

  async function api(url, options) {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Terjadi kesalahan.');
    return body;
  }

  const openAdd = () => { setForm({ nama: '', nicknameML: '', idML: '', roleSquad: '', mainRole: '', subRole: '', username: '', password: '' }); setLinkToSelf(false); setModal({ type: 'add' }); };
  const openEdit = (m) => { setForm({ nama: m.nama, nicknameML: m.nicknameML, idML: m.idML, roleSquad: m.roleSquad, mainRole: m.mainRole || '', subRole: m.subRole || '', username: '', password: '' }); setModal({ type: 'edit', id: m.id }); };

  async function submitForm() {
    if (!form.nama.trim() || !form.nicknameML.trim()) { showError('Nama dan nickname wajib diisi.'); return; }
    setBusy(true);
    try {
      if (modal.type === 'add') {
        if (!linkToSelf && (!form.username.trim() || !form.password.trim())) { showError('ID login dan password wajib diisi untuk akun member baru.'); setBusy(false); return; }
        const { member } = await api('/api/members', { method: 'POST', body: JSON.stringify({ ...form, linkToSelf }) });
        setMembers((prev) => [...prev, member]);
        showOk(linkToSelf ? 'Data member kamu dibuat dan tertaut ke akun admin ini.' : `${member.nama} ditambahkan ke squad dengan 2 nyawa.`);
      } else {
        const { member } = await api(`/api/members/${modal.id}`, { method: 'PATCH', body: JSON.stringify(form) });
        setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
        showOk('Data member diperbarui.');
      }
      setModal(null);
    } catch (e) {
      showError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await api(`/api/members/${modal.id}`, { method: 'DELETE' });
      setMembers((prev) => prev.filter((m) => m.id !== modal.id));
      showOk('Member dihapus dari squad.');
      setModal(null);
    } catch (e) {
      showError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmAdjustLife() {
    setBusy(true);

    try {
      const delta = modal.type === 'addLifeConfirm' ? 1 : -1;

      const { member } = await api(`/api/members/${modal.id}/life`, {
        method: 'POST',
        body: JSON.stringify({ delta }),
      });

      setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));

      showOk(
        delta === 1
          ? `Nyawa ${member.nama} ditambah 1.`
          : `Nyawa ${member.nama} dikurangi 1.`
      );

      setModal(null);
    } catch (e) {
      showError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmReset() {
    setBusy(true);
    try {
      const { member } = await api(`/api/members/${modal.id}/reset`, { method: 'POST' });
      setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
      showOk(`Nyawa ${member.nama} direset ke 2.`);
      setModal(null);
    } catch (e) {
      showError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function commitActivity(id) {
    const raw = drafts[id];
    if (raw === undefined) return;
    const val = Math.max(0, parseInt(raw, 10) || 0);
    try {
      const { member } = await api(`/api/members/${id}/activity`, { method: 'PATCH', body: JSON.stringify({ activityPoint: val }) });
      setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
      setDrafts((d) => { const nd = { ...d }; delete nd[id]; return nd; });
    } catch (e) {
      showError(e.message);
    }
  }

  async function openHistory(id) {
    setModal({ type: 'history', id });
    setHistoryItems(null);
    try {
      const { history } = await api(`/api/members/${id}/history`);
      setHistoryItems(history);
    } catch (e) {
      showError(e.message);
    }
  }

  async function openProcessConfirm() {
    setModal({ type: 'processConfirm' });
    setPreview(null);
    try {
      const data = await api('/api/process-week');
      setPreview(data);
    } catch (e) {
      showError(e.message);
      setModal(null);
    }
  }

  async function applyProcessWeek() {
    setBusy(true);
    try {
      const result = await api('/api/process-week', { method: 'POST' });
      const { members: fresh } = await api('/api/members');
      setMembers(fresh);
      setWeekNumber(result.mingguKe + 1);
      showOk(`Minggu ke-${result.mingguKe} diproses. ${result.processed} member diperbarui${result.kicksNow ? `, ${result.kicksNow} member ter-Kick` : ''}.`);
      setModal(null);
    } catch (e) {
      showError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const statCounts = members.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {});
  const skippedCount = members.filter((m) => m.status !== 'KICK' && !m.activityInputted).length;

  const visibleMembers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return members.filter((m) => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (!q) return true;
      return (
        m.nama.toLowerCase().includes(q) ||
        m.nicknameML.toLowerCase().includes(q) ||
        (m.idML || '').toLowerCase().includes(q)
      );
    });
  }, [members, search, statusFilter]);

  const actionHandlers = {
  onHistory: openHistory,
  onEdit: openEdit,
  onReset: (id) => setModal({ type: 'resetConfirm', id }),
  onAddLife: (id) => setModal({ type: 'addLifeConfirm', id }),
  onDecreaseLife: (id) => setModal({ type: 'decreaseLifeConfirm', id }),
  onDelete: (id) => setModal({ type: 'deleteConfirm', id }),
  };
  const activityProps = { drafts, setDrafts, commitActivity };

  return (
    <>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto z-50 px-4 py-2.5 rounded-lg border text-sm shadow-lg anim-slide-up ${toast.type === 'error' ? 'bg-rose-950 border-rose-700 text-rose-200' : 'bg-emerald-950 border-emerald-700 text-emerald-200'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5 anim-fade">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-amber-300/80 mb-1">Admin Panel</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Dashboard Admin</h1>
            <p className="text-sm text-slate-400 mt-1">Kelola member, input activity point, dan proses nyawa mingguan.</p>
          </div>
          <div className="dyn-card dyn-card-accent px-4 py-3 sm:text-right">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">Proses Berikutnya</div>
            <div className="font-display text-xl font-bold text-white">Minggu ke-{weekNumber}</div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6 anim-fade">
          <div className="dyn-card dyn-card-accent p-3.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Users className="w-3.5 h-3.5" />Total Member</div>
            <div className="text-2xl font-display font-bold text-white">{members.length}</div>
          </div>
          {['AMAN', 'WASPADA', 'TERANCAM_KICK', 'KICK'].map((st) => (
            <div key={st} className="dyn-card p-3.5">
              <div className={`text-xs mb-1 ${STATUS_STYLES[st].text}`}>{STATUS_STYLES[st].label}</div>
              <div className="text-2xl font-display font-bold text-white">{statCounts[st] || 0}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, nickname, atau ID ML..."
              className="input input-iconized"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {FILTERS.map((f) => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)} className={`chip ${statusFilter === f.key ? 'chip-active' : ''}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-4">
          <button onClick={openAdd} className="btn-secondary inline-flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> Tambah Member
          </button>
          <button onClick={openProcessConfirm} className="btn-primary inline-flex items-center justify-center gap-1.5">
            <Play className="w-4 h-4" /> Proses Minggu Ini
          </button>
        </div>

        {/* ===== Desktop: tabel ===== */}
        <div className="hidden md:block dyn-card overflow-hidden anim-fade">
          {visibleMembers.length === 0 ? (
            <EmptyState
              title={members.length === 0 ? 'Belum ada member di squad.' : 'Tidak ada member yang cocok dengan pencarian/filter.'}
              hint={members.length === 0 ? 'Klik "Tambah Member" untuk mulai.' : 'Coba ubah kata kunci atau filter status.'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">Member</th>
                    <th className="px-4 py-3 font-medium">ID ML</th>
                    <th className="px-4 py-3 font-medium">Nyawa</th>
                    <th className="px-4 py-3 font-medium">Activity</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMembers.map((m) => (
                    <tr key={m.id} className={`border-b border-slate-800/60 last:border-0 ${m.status === 'KICK' ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-100">{m.nama}</div>
                        <div className="text-xs text-slate-400">{m.nicknameML} · {roleLabel(m)}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{m.idML}</td>
                      <td className="px-4 py-3"><NyawaShards n={m.nyawaCurrent} /></td>
                      <td className="px-4 py-3"><ActivityInput m={m} {...activityProps} /></td>
                      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                      <td className="px-4 py-3"><div className="flex justify-end"><ActionButtons m={m} {...actionHandlers} /></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ===== Mobile: card list ===== */}
        <div className="md:hidden space-y-3 anim-fade">
          {visibleMembers.length === 0 ? (
            <div className="dyn-card">
              <EmptyState
                title={members.length === 0 ? 'Belum ada member di squad.' : 'Tidak ada member yang cocok.'}
                hint={members.length === 0 ? 'Klik "Tambah Member" untuk mulai.' : 'Coba ubah kata kunci atau filter.'}
              />
            </div>
          ) : (
            visibleMembers.map((m) => (
              <div key={m.id} className={`dyn-card p-4 ${m.status === 'KICK' ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-100 truncate">{m.nama}</div>
                    <div className="text-xs text-slate-400 truncate">{m.nicknameML} · {roleLabel(m)}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{m.idML}</div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
                <div className="mb-3"><NyawaShards n={m.nyawaCurrent} /></div>
                <ActivityInput m={m} withMeter {...activityProps} />
                <div className="flex justify-end mt-2 pt-2 border-t border-slate-800/60">
                  <ActionButtons m={m} large {...actionHandlers} />
                </div>
              </div>
            ))
          )}
        </div>

        {skippedCount > 0 && (
          <p className="text-xs text-slate-500 mt-3">{skippedCount} member belum diinput activity point minggu ini — tidak akan ikut diproses sampai diinput.</p>
        )}
      </div>

      {/* ===== Modals ===== */}
      {modal && (modal.type === 'add' || modal.type === 'edit') && (
        <ModalShell onClose={() => setModal(null)} title={modal.type === 'add' ? 'Tambah Member' : 'Edit Member'}>
          <div className="space-y-3">
            <Field label="Nama"><input value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} className="input" /></Field>
            <Field label="Nickname Mobile Legends"><input value={form.nicknameML} onChange={(e) => setForm((f) => ({ ...f, nicknameML: e.target.value }))} className="input" /></Field>
            <Field label="ID Mobile Legends"><input value={form.idML} onChange={(e) => setForm((f) => ({ ...f, idML: e.target.value }))} placeholder="123456789" className="input" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Main Role">
                <select value={form.mainRole} onChange={(e) => setForm((f) => ({ ...f, mainRole: e.target.value }))} className="input">
                  <option value="">— Pilih —</option>
                  {MAIN_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Sub Role">
                <select value={form.subRole} onChange={(e) => setForm((f) => ({ ...f, subRole: e.target.value }))} className="input">
                  <option value="">— Pilih —</option>
                  {SUB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
            </div>
            {modal.type === 'add' && (
              <>
                <label className="flex items-start gap-2 cursor-pointer rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                  <input
                    type="checkbox"
                    checked={linkToSelf}
                    onChange={(e) => setLinkToSelf(e.target.checked)}
                    className="mt-0.5 accent-amber-500"
                  />
                  <span className="text-xs text-slate-300">
                    <span className="font-medium text-slate-100">Ini data saya sendiri (admin)</span><br />
                    Tautkan ke akun admin yang sedang login — tanpa membuat akun login baru.
                  </span>
                </label>
                {!linkToSelf && (
                  <>
                    <Field label="ID login member">
                      <input
                        value={form.username}
                        onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                        className="input"
                        placeholder="contoh: rajahutan atau fajar123"
                        autoCapitalize="none" autoCorrect="off"
                      />
                      <span className="block text-[11px] text-slate-500 mt-1">3-30 karakter, huruf/angka/titik/strip/underscore, tanpa spasi. Ini yang dipakai member untuk login.</span>
                    </Field>
                    <Field label="Password awal"><input type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="input" placeholder="Member bisa ganti sendiri nanti" /></Field>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
            <button onClick={submitForm} disabled={busy} className="btn-primary inline-flex items-center gap-1.5">
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {modal.type === 'add' ? 'Tambahkan' : 'Simpan'}
            </button>
          </div>
        </ModalShell>
      )}

      {modal && modal.type === 'deleteConfirm' && (
        <ModalShell onClose={() => setModal(null)} title="Hapus Member">
          <p className="text-sm text-slate-300">Yakin hapus <span className="font-semibold text-white">{members.find((m) => m.id === modal.id)?.nama}</span> dari squad? Riwayat dan akun login-nya juga akan terhapus. Tindakan ini tidak bisa dibatalkan.</p>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
            <button onClick={confirmDelete} disabled={busy} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium disabled:opacity-40 inline-flex items-center gap-1.5">
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Hapus
            </button>
          </div>
        </ModalShell>
      )}


      {modal && (modal.type === 'addLifeConfirm' || modal.type === 'decreaseLifeConfirm') && (
        <ModalShell
          onClose={() => setModal(null)}
          title={modal.type === 'addLifeConfirm' ? 'Tambah Nyawa' : 'Kurangi Nyawa'}
        >
          <p className="text-sm text-slate-300">
            Yakin ingin{' '}
            {modal.type === 'addLifeConfirm' ? 'menambah' : 'mengurangi'} nyawa{' '}
            <span className="font-semibold text-white">
              {members.find((m) => m.id === modal.id)?.nama}
            </span>{' '}
            sebanyak 1?
          </p>

          <p className="text-xs text-slate-500 mt-2">
            {modal.type === 'addLifeConfirm'
              ? 'Tindakan ini cocok untuk bonus/reward member dan akan dicatat ke riwayat.'
              : 'Tindakan ini cocok untuk hukuman/punishment member dan akan dicatat ke riwayat.'}
          </p>

          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setModal(null)} className="btn-secondary">
              Batal
            </button>

            <button
              onClick={confirmAdjustLife}
              disabled={busy}
              className={`px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40 inline-flex items-center gap-1.5 ${
                modal.type === 'addLifeConfirm'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-orange-600 hover:bg-orange-500'
              }`}
            >
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {modal.type === 'addLifeConfirm' ? 'Tambah Nyawa' : 'Kurangi Nyawa'}
            </button>
          </div>
        </ModalShell>
      )}

      {modal && modal.type === 'resetConfirm' && (
        <ModalShell onClose={() => setModal(null)} title="Reset Nyawa">
          <p className="text-sm text-slate-300">Reset nyawa <span className="font-semibold text-white">{members.find((m) => m.id === modal.id)?.nama}</span> ke 2 (default) dan status menjadi Waspada? Dicatat sebagai override manual di riwayat.</p>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
            <button onClick={confirmReset} disabled={busy} className="btn-primary inline-flex items-center gap-1.5">
              {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Reset
            </button>
          </div>
        </ModalShell>
      )}

      {modal && modal.type === 'history' && (
        <ModalShell onClose={() => setModal(null)} title={`Riwayat — ${members.find((m) => m.id === modal.id)?.nama || ''}`} wide>
          {historyItems === null ? (
            <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Memuat riwayat...
            </div>
          ) : historyItems.length === 0 ? (
            <EmptyState title="Belum ada riwayat untuk member ini." hint="Riwayat muncul setelah proses mingguan pertama." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wide">
                    <th className="px-3 py-2 font-medium">Minggu</th>
                    <th className="px-3 py-2 font-medium">Tanggal</th>
                    <th className="px-3 py-2 font-medium">Activity</th>
                    <th className="px-3 py-2 font-medium">Nyawa</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((h) => (
                    <tr key={h.id} className="border-b border-slate-800/60 last:border-0">
                      <td className="px-3 py-2 text-slate-300">#{h.mingguKe}</td>
                      <td className="px-3 py-2 text-slate-400">{fmtDate(h.tanggal)}</td>
                      <td className="px-3 py-2 text-slate-300">{h.activityPoint.toLocaleString('id-ID')}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{h.nyawaBefore} → {h.nyawaAfter} <DeltaTag delta={h.delta} /></td>
                      <td className="px-3 py-2"><StatusBadge status={h.statusAkhir} /></td>
                      <td className="px-3 py-2 text-slate-500 text-xs">{h.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ModalShell>
      )}

      {modal && modal.type === 'processConfirm' && (
        <ModalShell onClose={() => setModal(null)} title={`Proses Minggu ke-${weekNumber}`} wide>
          {!preview ? (
            <div className="flex items-center justify-center py-8 text-slate-400 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Memuat preview...
            </div>
          ) : (
            <>
              {preview.preview.length === 0 ? (
                <EmptyState title="Belum ada member dengan activity point yang diinput minggu ini." hint="Input activity dulu, baru jalankan proses." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wide">
                        <th className="px-3 py-2 font-medium">Member</th>
                        <th className="px-3 py-2 font-medium">Activity</th>
                        <th className="px-3 py-2 font-medium">Nyawa</th>
                        <th className="px-3 py-2 font-medium">Status Baru</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.preview.map((p) => (
                        <tr key={p.id} className="border-b border-slate-800/60 last:border-0">
                          <td className="px-3 py-2 text-slate-200">{p.nama}</td>
                          <td className="px-3 py-2 text-slate-300">{p.activityPoint.toLocaleString('id-ID')}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{p.nyawaBefore} → {p.nyawaAfter} <DeltaTag delta={p.delta} /></td>
                          <td className="px-3 py-2"><StatusBadge status={p.statusAfter} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="text-xs text-slate-500 mt-3 space-y-0.5">
                {preview.skippedCount > 0 && <p>{preview.skippedCount} member dilewati karena belum diinput activity minggu ini.</p>}
                {preview.kickedLockedCount > 0 && <p>{preview.kickedLockedCount} member berstatus Kick dan dikunci sampai direset manual.</p>}
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setModal(null)} className="btn-secondary">Batal</button>
                <button onClick={applyProcessWeek} disabled={busy || preview.preview.length === 0} className="btn-primary inline-flex items-center gap-1.5">
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Konfirmasi &amp; Proses
                </button>
              </div>
            </>
          )}
        </ModalShell>
      )}

    </>
  );
}
