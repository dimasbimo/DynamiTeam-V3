'use client';

import Link from 'next/link';
import { ChevronRight, AlertTriangle, TrendingUp, Coins } from 'lucide-react';
import { roleLabel } from '../../lib/roles';
import {
  NyawaShards, StatusBadge, DeltaTag, fmtDate, MAX_NYAWA, ActivityMeter, getActivityZone, DEFAULT_ACTIVITY_RULE,
  EmptyState, AvatarRing, StatCard, SectionCard, LeaderboardList,
} from '../../components/ui';

function fmtPoint(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

function activityMessage(m, activityRule = DEFAULT_ACTIVITY_RULE) {
  if (m.status === 'KICK') return { text: 'Status kamu saat ini Kick. Hubungi admin squad untuk kesempatan bergabung kembali.', tone: 'text-slate-400' };
  if (!m.activityInputted) return { text: 'Activity minggu ini belum diinput admin.', tone: 'text-slate-400' };
  const zone = getActivityZone(m.activityPoint, activityRule);
  if (zone.key === 'danger') return { text: 'Activity kamu masih kurang — hati-hati, nyawa bisa berkurang saat proses mingguan.', tone: 'text-rose-400' };
  if (zone.key === 'safe') return { text: 'Kamu aman minggu ini. Pertahankan!', tone: 'text-emerald-400' };
  return { text: 'Mantap! Kamu berpeluang menambah nyawa minggu ini.', tone: 'text-amber-300' };
}

export default function MemberDashboard({ member, history, monthlyTotal, myRank, prevDelta, leaderboardPreview, activityRule = DEFAULT_ACTIVITY_RULE, penaltyExtraPoint = 0 }) {
  const msg = activityMessage(member, activityRule);
  const isCritical = member.nyawaCurrent === 1 && member.status !== 'KICK';
  const previewHistory = history.slice(0, 4);

  return (
    <div className="space-y-5">
      {/* ===== Welcome hero + total activity ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 anim-slide-up">
        <div className="lg:col-span-2 dyn-card dyn-card-accent p-5 flex items-center gap-4">
          <AvatarRing name={member.nama} src={member.avatarUrl} size={64} danger={isCritical} />
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Welcome back,</p>
            <h1 className="font-display text-2xl font-bold text-white truncate">{member.nama}</h1>
            <p className="text-sm text-slate-400 mt-0.5 truncate">{roleLabel(member)} · {member.idML}</p>
            <div className="mt-2.5"><StatusBadge status={member.status} /></div>
          </div>
        </div>

        <div className="dyn-card dyn-card-accent p-5">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Coins className="w-3.5 h-3.5" /> Total Activity Point
          </div>
          <div className="font-display text-4xl font-bold gold-text leading-tight">{monthlyTotal.toLocaleString('id-ID')}</div>
          {prevDelta !== null && (
            <div className={`text-xs mt-1 inline-flex items-center gap-1 ${prevDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <TrendingUp className="w-3.5 h-3.5" />
              {prevDelta >= 0 ? '+' : ''}{prevDelta.toLocaleString('id-ID')} dari minggu lalu
            </div>
          )}
          {myRank && <div className="text-[11px] text-slate-500 mt-2">Peringkat bulan ini: <span className="text-amber-300 font-semibold">#{myRank}</span></div>}
        </div>
      </div>

      {isCritical && (
        <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 flex items-start gap-2.5 anim-pulse-danger">
          <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
          <p className="text-sm text-rose-300">
            <span className="font-semibold">Nyawa kritis!</span> Sisa 1 nyawa — tingkatkan activity minggu depan atau kamu akan ter-Kick.
          </p>
        </div>
      )}

      {/* ===== Status minggu ini + Riwayat preview ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Status Minggu Ini"
          accent
          action={<StatusBadge status={member.status} />}
          className="anim-slide-up"
        >
          <div className="flex flex-col items-center py-2">
            <NyawaShards n={member.nyawaCurrent} size="lg" />
            <p className="text-sm text-slate-400 mt-3">{member.nyawaCurrent} / {MAX_NYAWA} Nyawa</p>
          </div>
          {member.status !== 'KICK' && (
            <div className="mt-3">
              <ActivityMeter value={member.activityPoint} rule={activityRule} />
            </div>
          )}
          <ul className="text-xs text-slate-400 mt-3 space-y-1.5">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" /> &lt; {fmtPoint(activityRule.safePoint)} = nyawa berkurang</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> {fmtPoint(activityRule.safePoint)} - {fmtPoint(activityRule.bonusPoint - 1)} = aman</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" /> {fmtPoint(activityRule.bonusPoint)}+ = nyawa bertambah</li>
          </ul>
          {penaltyExtraPoint > 0 && (
            <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-200">
              Target kamu naik +{fmtPoint(penaltyExtraPoint)} activity minggu ini karena hukuman tambahan dari admin.
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Riwayat Mingguan"
          className="anim-slide-up"
          action={
            <Link href="/member/riwayat" className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {previewHistory.length === 0 ? (
            <EmptyState title="Belum ada riwayat." hint="Muncul setelah admin memproses minggu pertama." />
          ) : (
            <div className="space-y-2.5">
              {previewHistory.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-2 border-b border-slate-800/60 last:border-0 pb-2.5 last:pb-0">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">Minggu #{h.mingguKe} · {fmtDate(h.tanggal)}</div>
                    <div className="text-sm text-slate-200">Activity: <span className="font-medium">{h.activityPoint.toLocaleString('id-ID')}</span></div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <DeltaTag delta={h.delta} />
                    <StatusBadge status={h.statusAkhir} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ===== Top activity bulan ini ===== */}
      <SectionCard
        title="Top Activity Bulan Ini"
        className="anim-slide-up"
        action={
          <Link href="/member/leaderboard" className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1">
            Lihat Leaderboard Lengkap <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        <LeaderboardList
          rows={leaderboardPreview.map((r) => ({ member: r, total: r.total, rank: r.rank }))}
          hrefFor={(m) => `/member/profile/${m.id}`}
          highlightId={member.id}
          compact
        />
      </SectionCard>
    </div>
  );
}
