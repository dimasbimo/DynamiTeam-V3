'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { AvatarRing, RankBadge, EmptyState } from './ui';
import { roleLabel } from '../lib/roles';

export default function HighrankList({ entries, profileBase = '/member/profile' }) {
  if (!entries || entries.length === 0) {
    return <EmptyState title="Belum ada data highrank." hint="Admin belum menambahkan member ke leaderboard highrank." />;
  }

  return (
    <div className="space-y-2.5">
      {entries.map((e, i) => {
        const rank = i + 1;
        const top = rank <= 3;
        const displayName = e.member.nicknameML || e.member.nama;

        return (
          <Link
            key={e.id}
            href={`${profileBase}/${e.member.id}`}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 border transition-colors hover:bg-white/[0.04] ${
              top
                ? 'border-amber-500/30 bg-amber-500/[0.04]'
                : 'border-[color:var(--dyn-border)] bg-white/[0.01]'
            }`}
          >
            <div className="w-7 flex justify-center shrink-0">
              <RankBadge rank={rank} />
            </div>

            <AvatarRing name={displayName} src={e.member.avatarUrl} size={42} />

            <div className="min-w-0 flex-1">
              <div className="font-medium text-slate-100 truncate">
                {displayName}
              </div>

              {/* Mobile: tampilkan rank ML saja */}
              <div className="text-[11px] text-slate-500 truncate sm:hidden">
                {e.rankName}
              </div>

              {/* Desktop/tablet: tetap tampilkan rank + role */}
              <div className="hidden sm:block text-[11px] text-slate-500 truncate">
                {e.rankName} · {roleLabel(e.member)}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-display font-bold text-amber-300 inline-flex items-center gap-1 leading-none">
                <Star className="w-3.5 h-3.5" />
                {e.point}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">bintang</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}