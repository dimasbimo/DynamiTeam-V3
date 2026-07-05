import { redirect } from 'next/navigation';
import { getSession } from '../../../lib/session';
import { prisma } from '../../../lib/prisma';
import { monthKey, monthLabel, recentMonths, buildLeaderboard } from '../../../lib/monthly';
import AdminShell from '../../../components/AdminShell';
import LeaderboardView from '../../../components/LeaderboardView';

export const dynamic = 'force-dynamic';

export default async function AdminLeaderboardPage({ searchParams }) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const options = recentMonths(6).map((k) => ({ key: k, label: monthLabel(k) }));
  const selectedKey = options.some((o) => o.key === searchParams?.month) ? searchParams.month : monthKey(new Date());

  const [allMembers, allHistory] = await Promise.all([
    prisma.member.findMany(),
    prisma.weeklyHistory.findMany(),
  ]);
  const historiesByMember = {};
  for (const h of allHistory) (historiesByMember[h.memberId] ||= []).push(h);

  const rows = buildLeaderboard(allMembers, historiesByMember, selectedKey).map((r) => ({
    id: r.member.id, nama: r.member.nama, nicknameML: r.member.nicknameML,
    roleSquad: r.member.roleSquad, mainRole: r.member.mainRole, subRole: r.member.subRole, avatarUrl: r.member.avatarUrl, total: r.total, rank: r.rank,
  }));

  return (
    <AdminShell>
      <LeaderboardView
        rows={rows}
        monthOptions={options}
        selectedKey={selectedKey}
        monthLabel={monthLabel(selectedKey)}
        basePath="/admin/leaderboard"
        profileBase="/member/profile"
      />
    </AdminShell>
  );
}
