'use client';

import Link from 'next/link';
import { Pencil, BadgeCheck } from 'lucide-react';
import { AvatarRing, StatusBadge, NyawaShards, StatCard, BackLink, fmtDate, MAX_NYAWA } from './ui';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm text-slate-100 font-medium text-right">{value}</span>
    </div>
  );
}

export default function ProfileView({ member, monthlyTotal, rank, monthLabel, canEdit, backHref, backLabel }) {
  const isCritical = member.nyawaCurrent === 1 && member.status !== 'KICK';
  return (
    <div className="max-w-3xl mx-auto">
      <BackLink href={backHref} label={backLabel} />

      {/* Hero */}
      <div className="relative dyn-card overflow-hidden mb-5 anim-slide-up">
        <div aria-hidden className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 120% at 15% 0%, rgba(245,196,81,0.16), transparent 55%), radial-gradient(120% 120% at 100% 100%, rgba(139,92,246,0.12), transparent 55%)' }} />
        <div aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,196,81,0.6), transparent)' }} />
        <div className="relative p-6 flex flex-col items-center text-center">
          <AvatarRing name={member.nama} size={96} danger={isCritical} />
          <div className="mt-3 flex items-center gap-1.5">
            <h1 className="font-display text-2xl font-bold text-white">{member.nicknameML || member.nama}</h1>
            <BadgeCheck className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-sm text-slate-400 mt-1">{member.roleSquad} · {member.idML}</p>
          <div className="mt-3"><StatusBadge status={member.status} size="lg" /></div>
          {canEdit && (
            <Link href="/member/profile/edit" className="gold-button inline-flex items-center gap-2 mt-4">
              <Pencil className="w-4 h-4" /> Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* Info table */}
      <div className="dyn-card p-5 mb-5 anim-slide-up">
        <h3 className="font-display text-sm font-semibold text-slate-200 uppercase tracking-wide mb-2">Informasi</h3>
        <InfoRow label="Nickname" value={member.nicknameML} />
        <InfoRow label="Nama" value={member.nama} />
        <InfoRow label="Role" value={member.roleSquad} />
        <InfoRow label="ID ML" value={member.idML} />
        <InfoRow label="Bergabung" value={fmtDate(member.createdAt)} />
        <InfoRow label="Total Activity Point" value={monthlyTotal.toLocaleString('id-ID')} />
        <InfoRow label="Status" value={<StatusBadge status={member.status} />} />
      </div>

      {/* Statistik bulanan */}
      <div className="dyn-card dyn-card-accent p-5 anim-slide-up">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-semibold text-slate-200 uppercase tracking-wide">Statistik Bulanan</h3>
          <span className="text-xs text-slate-500">{monthLabel}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Activity Point" value={monthlyTotal.toLocaleString('id-ID')} />
          <div className="dyn-card p-3.5">
            <div className="text-slate-400 text-xs mb-2">Nyawa Saat Ini</div>
            <div className="flex items-center gap-2">
              <span className={`font-display text-2xl font-bold ${isCritical ? 'text-rose-400' : 'text-white'}`}>{member.nyawaCurrent}</span>
              <span className="text-slate-500 text-sm">/ {MAX_NYAWA}</span>
            </div>
          </div>
          <StatCard label="Peringkat Bulan Ini" value={rank ? `#${rank}` : '—'} />
        </div>
      </div>
    </div>
  );
}
