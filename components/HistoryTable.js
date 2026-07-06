'use client';

import { StatusBadge, DeltaTag, EmptyState, fmtDate } from './ui';
import { isManualHistory } from '../lib/monthly';

export default function HistoryTable({
  history,
  emptyTitle = 'Belum ada riwayat proses mingguan.',
  emptyHint,
}) {
  if (!history || history.length === 0) {
    return (
      <div className="dyn-card">
        <EmptyState title={emptyTitle} hint={emptyHint} />
      </div>
    );
  }

  return (
    <div className="space-y-2.5 anim-fade">
      {history.map((h) => {
        const isManual = isManualHistory(h);
        const hasRuleNote = Boolean(h.note) && !isManual;

        return (
          <div key={h.id} className="dyn-card p-3.5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <div className="text-xs text-slate-400">
                  Minggu #{h.mingguKe} · {fmtDate(h.tanggal)}
                </div>

                {isManual && (
                  <div className="text-[11px] text-amber-300 mt-1">
                    Aksi manual admin
                  </div>
                )}
                {hasRuleNote && (
                  <div className="text-[11px] text-sky-300 mt-1">
                    Proses activity mingguan
                  </div>
                )}
              </div>

              <StatusBadge status={h.statusAkhir} />
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-300">
                Activity:{' '}
                <span className="text-slate-100 font-medium">
                  {h.activityPoint.toLocaleString('id-ID')}
                </span>
              </span>

              <span className="whitespace-nowrap">
                <span className="text-slate-400">{h.nyawaBefore}</span>
                <span className="mx-1 text-slate-600">→</span>
                <span className="text-slate-100 font-medium">{h.nyawaAfter}</span>
                <span className="ml-1.5">
                  <DeltaTag delta={h.delta} />
                </span>
              </span>
            </div>

            {h.note && (
              <p className="text-[11px] text-slate-500 mt-1.5">
                {h.note}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}