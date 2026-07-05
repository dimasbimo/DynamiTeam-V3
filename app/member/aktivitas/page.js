import { redirect } from 'next/navigation';
import { getSession } from '../../../lib/session';
import { prisma } from '../../../lib/prisma';
import { monthKey, monthLabel, historyInMonth, weeklyAverageFor, monthlyTotalFor } from '../../../lib/monthly';
import MemberShell from '../../../components/MemberShell';
import HistoryTable from '../../../components/HistoryTable';
import { ActivityMeter, NyawaShards, StatusBadge, StatCard } from '../../../components/ui';

export const dynamic = 'force-dynamic';

export default async function AktivitasPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const isAdmin = session.user.role === 'ADMIN';
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.memberId) redirect('/member');

  const member = await prisma.member.findUnique({ where: { id: user.memberId } });
  if (!member) redirect('/member');
  const history = await prisma.weeklyHistory.findMany({
    where: { memberId: member.id },
    orderBy: [{ mingguKe: 'desc' }, { createdAt: 'desc' }],
  });

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
          {member.status !== 'KICK' && <ActivityMeter value={member.activityPoint} />}
          <ul className="text-xs text-slate-400 mt-3 space-y-1.5">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" /> &lt; 1.500 = nyawa berkurang</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> 1.500 - 3.000 = aman</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" /> 3.000+ = nyawa bertambah</li>
          </ul>
        </div>

        <h3 className="font-display text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">Rincian Minggu Bulan Ini</h3>
        <HistoryTable history={monthRows} emptyTitle="Belum ada minggu tercatat di bulan ini." />
      </div>
    </MemberShell>
  );
}
