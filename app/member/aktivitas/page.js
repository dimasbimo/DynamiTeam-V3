import { redirect } from 'next/navigation';
import { getSession } from '../../../lib/session';
import { prisma } from '../../../lib/prisma';
import { monthKey, monthLabel, historyInMonth, weeklyAverageFor, monthlyTotalFor } from '../../../lib/monthly';
import { getActiveActivityRule, getActivePenaltyMap, getEffectiveActivityRule } from '../../../lib/activityRules';
import MemberShell from '../../../components/MemberShell';
import HistoryTable from '../../../components/HistoryTable';
import { ActivityMeter, NyawaShards, StatusBadge, StatCard } from '../../../components/ui';

export const dynamic = 'force-dynamic';

function fmtPoint(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

export default async function AktivitasPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const isAdmin = session.user.role === 'ADMIN';
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.memberId) redirect('/member');

  const member = await prisma.member.findUnique({ where: { id: user.memberId } });
  if (!member) redirect('/member');

  const [history, activityRule, penaltyMap] = await Promise.all([
    prisma.weeklyHistory.findMany({
      where: { memberId: member.id },
      orderBy: [{ mingguKe: 'desc' }, { createdAt: 'desc' }],
    }),
    getActiveActivityRule(),
    getActivePenaltyMap(),
  ]);

  const penaltyExtraPoint = penaltyMap[member.id] || 0;
  const effectiveRule = getEffectiveActivityRule(activityRule, penaltyExtraPoint);

  const key = monthKey(new Date());
  const monthRows = historyInMonth(history, key).sort((a, b) => b.mingguKe - a.mingguKe);
  const monthlyTotal = monthlyTotalFor(member, history, key);
  const avg = weeklyAverageFor(member, history, key);

  return (
    <MemberShell isAdmin={isAdmin}>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Aktivitas Saya</h1>
        <p className="text-sm text-slate-400 mb-5">Detail activity kamu · {monthLabel(key)}</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard label="Total Bulan Ini" value={monthlyTotal.toLocaleString('id-ID')} accent />
          <StatCard label="Rata-rata / Minggu" value={avg.toLocaleString('id-ID')} />
          <div className="dyn-card p-3.5">
            <div className="text-slate-400 text-xs mb-2">Nyawa Saat Ini</div>
            <NyawaShards n={member.nyawaCurrent} />
            <div className="text-[11px] text-slate-500 mt-1.5">{member.nyawaCurrent} / 4</div>
          </div>
          <div className="dyn-card p-3.5">
            <div className="text-slate-400 text-xs mb-2">Status</div>
            <StatusBadge status={member.status} />
          </div>
        </div>

        <div className="dyn-card dyn-card-accent p-5 mb-5">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-xs text-slate-400">Activity Minggu Berjalan</p>
            <p className="font-display text-xl font-bold text-white">{member.activityPoint.toLocaleString('id-ID')}</p>
          </div>
          {member.status !== 'KICK' && <ActivityMeter value={member.activityPoint} rule={effectiveRule} />}
          <ul className="text-xs text-slate-400 mt-3 space-y-1.5">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" /> &lt; {fmtPoint(effectiveRule.safePoint)} = nyawa berkurang</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> {fmtPoint(effectiveRule.safePoint)} - {fmtPoint(effectiveRule.bonusPoint - 1)} = aman</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" /> {fmtPoint(effectiveRule.bonusPoint)}+ = nyawa bertambah</li>
          </ul>
          {penaltyExtraPoint > 0 && (
            <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2 text-xs text-amber-200">
              Target kamu naik +{fmtPoint(penaltyExtraPoint)} activity minggu ini karena hukuman tambahan dari admin.
            </div>
          )}
        </div>

        <h3 className="font-display text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">Rincian Minggu Bulan Ini</h3>
        <HistoryTable history={monthRows} emptyTitle="Belum ada minggu tercatat di bulan ini." />
      </div>
    </MemberShell>
  );
}
