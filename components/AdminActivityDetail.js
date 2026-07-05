'use client';

import { Info } from 'lucide-react';
import { StatCard, StatusBadge, MonthSelect, EmptyState, BackLink, AvatarRing } from './ui';

export default function AdminActivityDetail({ member, weekRows, monthlyTotal, avg, rank, monthOptions, selectedKey, monthLabel }) {
  return (
    <div className="max-w-4xl mx-auto">
      <BackLink href={`/admin/activity?month=${selectedKey}`} label="Kembali ke Activity Bulanan" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <AvatarRing name={member.nama} src={member.avatarUrl} size={48} />
          <div>
            <h1 className="font-display text-xl font-bold text-white">Detail Activity — {member.nama}</h1>
            <p className="text-sm text-slate-400">{member.roleSquad} · {member.idML}</p>
          </div>
        </div>
        <MonthSelect value={selectedKey} options={monthOptions} basePath={`/admin/activity/${member.id}`} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Activity Point" value={monthlyTotal.toLocaleString('id-ID')} accent />
        <StatCard label="Rata-rata per Minggu" value={avg.toLocaleString('id-ID')} />
        <div className="dyn-card p-3.5">
          <div className="text-slate-400 text-xs mb-1">Nyawa Saat Ini</div>
          <div className="font-display text-2xl font-bold text-white">{member.nyawaCurrent} <span className="text-sm text-slate-500">/ 4</span></div>
        </div>
        <StatCard label="Peringkat Bulan Ini" value={rank ? `#${rank}` : '—'} />
      </div>

      <h3 className="font-display text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">Rincian Mingguan · {monthLabel}</h3>

      {weekRows.length === 0 ? (
        <div className="dyn-card"><EmptyState title="Belum ada data minggu di bulan ini." hint="Data muncul setelah admin memproses minggu pada bulan terpilih." /></div>
      ) : (
        <div className="dyn-card overflow-hidden mb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Minggu</th>
                  <th className="px-4 py-3 font-medium">Activity Point</th>
                  <th className="px-4 py-3 font-medium">Nyawa Akhir</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {weekRows.map((h) => (
                  <tr key={h.id} className="border-b border-slate-800/60 last:border-0">
                    <td className="px-4 py-3 text-slate-300">Minggu #{h.mingguKe}</td>
                    <td className="px-4 py-3 text-slate-100 font-medium">{h.activityPoint.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-slate-200">{h.nyawaAfter} / 4</td>
                    <td className="px-4 py-3"><StatusBadge status={h.statusAkhir} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-sky-500/30 bg-sky-500/[0.07] px-4 py-3 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
        <p className="text-sm text-sky-200/90">Data ini dapat digunakan untuk mempertimbangkan pemberian hadiah bulanan.</p>
      </div>
    </div>
  );
}
