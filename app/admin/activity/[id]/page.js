import { redirect, notFound } from 'next/navigation';
import { getSession } from '../../../../lib/session';
import { prisma } from '../../../../lib/prisma';
import { monthKey, monthLabel, recentMonths, historyInMonth, monthlyTotalFor, weeklyAverageFor, buildLeaderboard, rankOf } from '../../../../lib/monthly';
import AdminShell from '../../../../components/AdminShell';
import AdminActivityDetail from '../../../../components/AdminActivityDetail';

export const dynamic = 'force-dynamic';

export default async function AdminActivityDetailPage({ params, searchParams }) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const member = await prisma.member.findUnique({ where: { id: params.id } });
  if (!member) notFound();

  const options = recentMonths(6).map((k) => ({ key: k, label: monthLabel(k) }));
  const selectedKey = options.some((o) => o.key === searchParams?.month) ? searchParams.month : monthKey(new Date());

  const [allMembers, allHistory] = await Promise.all([
    prisma.member.findMany(),
    prisma.weeklyHistory.findMany(),
  ]);
  const historiesByMember = {};
  for (const h of allHistory) (historiesByMember[h.memberId] ||= []).push(h);

  const myHistory = historiesByMember[member.id] || [];
  const weekRows = historyInMonth(myHistory, selectedKey).sort((a, b) => a.mingguKe - b.mingguKe);
  const leaderboard = buildLeaderboard(allMembers, historiesByMember, selectedKey);

  return (
    <AdminShell>
      <AdminActivityDetail
        member={member}
        weekRows={weekRows}
        monthlyTotal={monthlyTotalFor(member, myHistory, selectedKey)}
        avg={weeklyAverageFor(member, myHistory, selectedKey)}
        rank={rankOf(member.id, leaderboard)}
        monthOptions={options}
        selectedKey={selectedKey}
        monthLabel={monthLabel(selectedKey)}
      />
    </AdminShell>
  );
}
