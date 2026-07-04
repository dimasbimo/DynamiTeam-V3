'use client';

import { useState } from 'react';
import { Trophy } from 'lucide-react';
import { LeaderboardList, TrophyAward, MonthSelect, EmptyState } from './ui';

export default function LeaderboardView({ rows, monthOptions, selectedKey, monthLabel, highlightId, basePath = '/member/leaderboard', profileBase = '/member/profile' }) {
  const [tab, setTab] = useState('activity');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" /> Leaderboard Bulanan
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Top activity squad · {monthLabel}</p>
        </div>
        <MonthSelect value={selectedKey} options={monthOptions} basePath={basePath} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setTab('activity')} className={`chip ${tab === 'activity' ? 'chip-active' : ''}`}>Top Activity</button>
        <button onClick={() => setTab('improvement')} className={`chip ${tab === 'improvement' ? 'chip-active' : ''}`}>Top Improvement</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {tab === 'activity' ? (
            <div className="dyn-card dyn-card-accent p-4 sm:p-5 anim-slide-up">
              <LeaderboardList
                rows={rows.map((r) => ({ member: r, total: r.total, rank: r.rank }))}
                hrefFor={(m) => `${profileBase}/${m.id}`}
                highlightId={highlightId}
              />
            </div>
          ) : (
            <div className="dyn-card p-5 anim-fade">
              <EmptyState
                title="Top Improvement — Segera hadir"
                hint="Butuh data pembanding antar-bulan yang belum dilacak sistem. Akan aktif setelah ada minimal 2 bulan riwayat."
              />
            </div>
          )}
        </div>

        {/* Trophy card desktop */}
        <div className="hidden lg:block dyn-card dyn-card-accent overflow-hidden anim-slide-up">
          <TrophyAward />
          <div className="px-5 pb-5 text-center">
            <p className="font-display text-sm font-semibold text-amber-300">Champion of the Month</p>
            <p className="text-xs text-slate-500 mt-1">
              {rows[0] ? `${rows[0].nicknameML || rows[0].nama} memimpin dengan ${rows[0].total.toLocaleString('id-ID')} activity` : 'Belum ada data bulan ini.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
