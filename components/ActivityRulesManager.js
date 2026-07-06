'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save, Plus, XCircle } from 'lucide-react';
import { Field, EmptyState } from './ui';

function fmtPoint(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

export default function ActivityRulesManager({ initialRule, members, initialPenalties }) {
  const [rule, setRule] = useState(initialRule || { safePoint: 1500, bonusPoint: 3000 });
  const [draftRule, setDraftRule] = useState(initialRule || { safePoint: 1500, bonusPoint: 3000 });
  const [penalties, setPenalties] = useState(initialPenalties || []);
  const [form, setForm] = useState({ memberId: '', extraPoint: 500, reason: '' });
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false);
  const [penaltyBusyId, setPenaltyBusyId] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  function showOk(msg) { setToast({ type: 'ok', msg }); }
  function showError(msg) { setToast({ type: 'error', msg }); }

  async function api(url, options) {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Terjadi kesalahan.');
    return body;
  }

  async function saveRule() {
    setBusy(true);
    try {
      const { rule: saved } = await api('/api/activity-rules', {
        method: 'PUT',
        body: JSON.stringify({
          safePoint: Number(draftRule.safePoint),
          bonusPoint: Number(draftRule.bonusPoint),
        }),
      });

      setRule({ safePoint: saved.safePoint, bonusPoint: saved.bonusPoint });
      setDraftRule({ safePoint: saved.safePoint, bonusPoint: saved.bonusPoint });
      showOk('Aturan activity berhasil disimpan.');
    } catch (e) {
      showError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function addPenalty() {
    setBusy(true);
    try {
      const { penalty } = await api('/api/activity-penalties', {
        method: 'POST',
        body: JSON.stringify({
          memberId: form.memberId,
          extraPoint: Number(form.extraPoint),
          reason: form.reason,
        }),
      });

      setPenalties((prev) => [penalty, ...prev.filter((p) => p.id !== penalty.id && p.memberId !== penalty.memberId)]);
      setForm({ memberId: '', extraPoint: 500, reason: '' });
      showOk('Hukuman tambahan activity berhasil disimpan.');
    } catch (e) {
      showError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function removePenalty(id) {
    setPenaltyBusyId(id);
    try {
      await api(`/api/activity-penalties/${id}`, { method: 'DELETE' });
      setPenalties((prev) => prev.filter((p) => p.id !== id));
      showOk('Hukuman tambahan dinonaktifkan.');
    } catch (e) {
      showError(e.message);
    } finally {
      setPenaltyBusyId(null);
    }
  }

  const selectedMember = useMemo(
    () => members.find((m) => m.id === form.memberId),
    [members, form.memberId]
  );

  const extraPoint = Math.max(0, Number(form.extraPoint) || 0);
  const previewSafe = rule.safePoint + extraPoint;
  const previewBonus = rule.bonusPoint + extraPoint;

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto z-50 px-4 py-2.5 rounded-lg border text-sm shadow-lg anim-slide-up ${toast.type === 'error' ? 'bg-rose-950 border-rose-700 text-rose-200' : 'bg-emerald-950 border-emerald-700 text-emerald-200'}`}>
          {toast.msg}
        </div>
      )}

      <div className="space-y-5">
        <div className="anim-fade">
          <p className="text-xs uppercase tracking-[0.22em] text-amber-300/80 mb-1">Admin Panel</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">Aturan Activity</h1>
          <p className="text-sm text-slate-400 mt-1">
            Atur batas activity mingguan dan tambahan target untuk member yang terkena hukuman.
          </p>
        </div>

        <div className="dyn-card dyn-card-accent p-5 anim-slide-up">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">Target Activity Mingguan</h2>
              <p className="text-sm text-slate-400 mt-1">
                Aturan ini akan dipakai saat admin menekan tombol proses mingguan.
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-sm text-slate-300">
              <ul className="text-xs text-slate-400 mt-3 space-y-1.5">
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" /> &lt; {fmtPoint(rule.safePoint)} = nyawa berkurang</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> {fmtPoint(rule.safePoint)} - {fmtPoint(rule.bonusPoint - 1)} = aman</li>
                <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" /> {fmtPoint(rule.bonusPoint)}+ = nyawa bertambah</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <Field label="Batas aman">
              <input
                type="number"
                min="0"
                value={draftRule.safePoint}
                onChange={(e) => setDraftRule((r) => ({ ...r, safePoint: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Batas tambah nyawa">
              <input
                type="number"
                min="1"
                value={draftRule.bonusPoint}
                onChange={(e) => setDraftRule((r) => ({ ...r, bonusPoint: e.target.value }))}
                className="input"
              />
            </Field>
          </div>

          <div className="flex justify-end mt-4">
            <button onClick={saveRule} disabled={busy} className="btn-primary inline-flex items-center gap-1.5">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Simpan Aturan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 dyn-card p-5 anim-slide-up">
            <h2 className="font-display text-lg font-semibold text-white mb-1">Tambah Hukuman</h2>
            <p className="text-sm text-slate-400 mb-4">
              Hukuman ini menambah target activity member tertentu.
            </p>

            <div className="space-y-3">
              <Field label="Member">
                <select
                  value={form.memberId}
                  onChange={(e) => setForm((f) => ({ ...f, memberId: e.target.value }))}
                  className="input"
                >
                  <option value="">— Pilih member —</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.nama} / {m.nicknameML}</option>
                  ))}
                </select>
              </Field>

              <Field label="Tambahan activity">
                <input
                  type="number"
                  min="1"
                  value={form.extraPoint}
                  onChange={(e) => setForm((f) => ({ ...f, extraPoint: e.target.value }))}
                  className="input"
                />
              </Field>

              <Field label="Alasan hukuman">
                <input
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  placeholder="Contoh: ganti akun / tidak aktif tanpa kabar"
                  className="input"
                />
              </Field>

              {selectedMember && (
                <div className="rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-xs text-slate-400">
                  <div className="text-slate-300 font-medium mb-1">Preview target {selectedMember.nicknameML || selectedMember.nama}</div>
                  <div>&lt; {fmtPoint(previewSafe)} = nyawa berkurang</div>
                  <div>{fmtPoint(previewSafe)} - {fmtPoint(previewBonus - 1)} = aman</div>
                  <div>{fmtPoint(previewBonus)}+ = nyawa bertambah</div>
                </div>
              )}

              <button onClick={addPenalty} disabled={busy} className="btn-primary w-full inline-flex items-center justify-center gap-1.5">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Simpan Hukuman
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 dyn-card overflow-hidden anim-slide-up">
            <div className="px-5 py-4 border-b border-slate-800/70">
              <h2 className="font-display text-lg font-semibold text-white">Hukuman Tambahan Aktif</h2>
              <p className="text-sm text-slate-400 mt-1">
                Member di daftar ini punya target activity lebih berat saat proses mingguan.
              </p>
            </div>

            {penalties.length === 0 ? (
              <EmptyState title="Belum ada hukuman tambahan aktif." hint="Tambahkan member jika ada yang terkena target activity tambahan." />
            ) : (
              <div className="divide-y divide-slate-800/70">
                {penalties.map((p) => {
                  const safe = rule.safePoint + p.extraPoint;
                  const bonus = rule.bonusPoint + p.extraPoint;

                  return (
                    <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-100 truncate">
                          {p.member?.nama || 'Member'} <span className="text-slate-500">/ {p.member?.nicknameML || '-'}</span>
                        </div>
                        <div className="text-xs text-amber-300 mt-1">
                          Tambahan target +{fmtPoint(p.extraPoint)} activity
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Target: aman {fmtPoint(safe)} · tambah nyawa {fmtPoint(bonus)}
                        </div>
                        {p.reason && <div className="text-xs text-slate-400 mt-1">Alasan: {p.reason}</div>}
                      </div>

                      <button
                        onClick={() => removePenalty(p.id)}
                        disabled={penaltyBusyId === p.id}
                        className="btn-secondary inline-flex items-center justify-center gap-1.5 shrink-0"
                      >
                        {penaltyBusyId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Nonaktifkan
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
