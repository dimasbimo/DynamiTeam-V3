'use client';

import { NyawaShards, StatusBadge, DeltaTag, EmptyState, fmtDate } from './ui';

export default function HistoryTable({ history, emptyTitle = 'Belum ada riwayat proses mingguan.', emptyHint }) {
  if (!history || history.length === 0) {
    return <div className="dyn-card"><EmptyState title={emptyTitle} hint={emptyHint} /></div>;
  }
  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:block dyn-card overflow-hidden anim-fade">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-800 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Minggu</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Activity Point</th>
                <th className="px-4 py-3 font-medium">Nyawa</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-slate-800/60 last:border-0">
                  <td className="px-4 py-3 text-slate-300">#{h.mingguKe}</td>
                  <td className="px-4 py-3 text-slate-400">{fmtDate(h.tanggal)}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{h.activityPoint.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-slate-400">{h.nyawaBefore}</span>
                    <span className="mx-1.5 text-slate-600">→</span>
                    <span className="text-slate-100 font-medium">{h.nyawaAfter}</span>
                    <span className="ml-2"><DeltaTag delta={h.delta} /></span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={h.statusAkhir} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden space-y-2.5 anim-fade">
        {history.map((h) => (
          <div key={h.id} className="dyn-card p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Minggu #{h.mingguKe} · {fmtDate(h.tanggal)}</span>
              <StatusBadge status={h.statusAkhir} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Activity: <span className="text-slate-100 font-medium">{h.activityPoint.toLocaleString('id-ID')}</span></span>
              <span className="whitespace-nowrap">
                <span className="text-slate-400">{h.nyawaBefore}</span>
                <span className="mx-1 text-slate-600">→</span>
                <span className="text-slate-100 font-medium">{h.nyawaAfter}</span>
                <span className="ml-1.5"><DeltaTag delta={h.delta} /></span>
              </span>
            </div>
            {h.note && <p className="text-[11px] text-slate-500 mt-1.5">{h.note}</p>}
          </div>
        ))}
      </div>
    </>
  );
}
