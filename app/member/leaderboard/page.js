import { redirect } from 'next/navigation';
import { getSession } from '../../../lib/session';
import { prisma } from '../../../lib/prisma';
import { monthKey, monthLabel, recentMonths, buildLeaderboard } from '../../../lib/monthly';
import MemberShell from '../../../components/MemberShell';
import LeaderboardView from '../../../components/LeaderboardView';

export const dynamic = 'force-dynamic';

export default async function MemberLeaderboardPage({ searchParams }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const isAdmin = session.user.role === 'ADMIN';

  const options = recentMonths(6).map((k) => ({ key: k, label: monthLabel(k) }));
  const selectedKey = options.some((o) => o.key === searchParams?.month) ? searchParams.month : monthKey(new Date());

  const [allMembers, allHistory] = await Promise.all([
    prisma.member.findMany(),
    prisma.weeklyHistory.findMany(),
  ]);
  const historiesByMember = {};
  for (const h of allHistory) (historiesByMember[h.memberId] ||= []).push(h);

  const leaderboard = buildLeaderboard(allMembers, historiesByMember, selectedKey);
  const rows = leaderboard.map((r) => ({
    id: r.member.id, nama: r.member.nama, nicknameML: r.member.nicknameML,
    roleSquad: r.member.roleSquad, total: r.total, rank: r.rank,
  }));

  return (
    <MemberShell isAdmin={isAdmin}>
      <LeaderboardView
        rows={rows}
        monthOptions={options}
        selectedKey={selectedKey}
        monthLabel={monthLabel(selectedKey)}
        highlightId={session.user.memberId || null}
      />
    </MemberShell>
  );
}
