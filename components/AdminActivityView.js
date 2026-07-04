'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import { NyawaShards, StatusBadge, MonthSelect, EmptyState, AvatarRing } from './ui';

export default function AdminActivityView({ rows, monthOptions, selectedKey, monthLabel }) {
  const [q, setQ] = useState('');

  const visible = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return rows;
    return rows.filter((r) =>
      r.nama.toLowerCase().includes(s) ||
      (r.nicknameML || '').toLowerCase().includes(s) ||
      (r.idML || '').toLowerCase().includes(s)
    );
  }, [rows, q]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Activity Bulanan</h1>
          <p className="text-sm text-slate-400 mt-0.5">Rekap activity &amp; nyawa seluruh member · {monthLabel}</p>
        </div>
        <MonthSelect value={selectedKey} options={monthOptions} basePath="/admin/activity" />
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari member..." className="input input-iconized" />
      </div>

      {visible.length === 0 ? (
        <div className="dyn-card"><EmptyState title="Tidak ada member yang cocok." hint="Coba ubah kata kunci atau bulan." /></div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block dyn-card overflow-hidden anim-fade">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Member</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Activity Point</th>
                    <th className="px-4 py-3 font-medium">Nyawa</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Peringkat</th>
                    <th className="px-4 py-3 font-medium text-right">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id} className={`border-b border-slate-800/60 last:border-0 hover:bg-white/[0.02] ${r.status === 'KICK' ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 text-slate-400 font-display">{r.rank ? `#${r.rank}` : '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <AvatarRing name={r.nama} size={32} />
                          <div className="min-w-0">
                            <div className="font-medium text-slate-100 truncate">{r.nama}</div>
                            <div className="text-[11px] text-slate-500 truncate">{r.nicknameML}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{r.roleSquad}</td>
                      <td className="px-4 py-3 text-slate-100 font-medium">{r.total.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3"><NyawaShards n={r.nyawaCurrent} /></td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-amber-300 font-display">{r.rank ? `#${r.rank}` : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/activity/${r.id}?month=${selectedKey}`} className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 text-xs">
                          Detail <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2.5 anim-fade">
            {visible.map((r) => (
              <Link key={r.id} href={`/admin/activity/${r.id}?month=${selectedKey}`} className="block dyn-card p-3.5">
                <div className="flex items-center gap-3">
                  <span className="font-display text-slate-400 w-6">{r.rank ? `#${r.rank}` : '—'}</span>
                  <AvatarRing name={r.nama} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-100 truncate">{r.nama}</div>
                    <div className="text-[11px] text-slate-500">{r.roleSquad} · {r.total.toLocaleString('id-ID')} activity</div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
