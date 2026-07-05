import { redirect } from 'next/navigation';
import { getSession } from '../../../lib/session';
import { prisma } from '../../../lib/prisma';
import { monthKey, monthLabel, recentMonths, buildLeaderboard, monthlyTotalFor, rankOf } from '../../../lib/monthly';
import AdminShell from '../../../components/AdminShell';
import AdminActivityView from '../../../components/AdminActivityView';

export const dynamic = 'force-dynamic';

export default async function AdminActivityPage({ searchParams }) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const options = recentMonths(6).map((k) => ({ key: k, label: monthLabel(k) }));
  const selectedKey = options.some((o) => o.key === searchParams?.month) ? searchParams.month : monthKey(new Date());

  const [members, allHistory] = await Promise.all([
    prisma.member.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.weeklyHistory.findMany(),
  ]);
  const historiesByMember = {};
  for (const h of allHistory) (historiesByMember[h.memberId] ||= []).push(h);

  const leaderboard = buildLeaderboard(members, historiesByMember, selectedKey);

  const rows = members.map((m) => ({
    id: m.id, nama: m.nama, nicknameML: m.nicknameML, idML: m.idML, roleSquad: m.roleSquad, avatarUrl: m.avatarUrl,
    nyawaCurrent: m.nyawaCurrent, status: m.status,
    total: monthlyTotalFor(m, historiesByMember[m.id] || [], selectedKey),
    rank: rankOf(m.id, leaderboard),
  })).sort((a, b) => b.total - a.total);

  return (
    <AdminShell>
      <AdminActivityView rows={rows} monthOptions={options} selectedKey={selectedKey} monthLabel={monthLabel(selectedKey)} />
    </AdminShell>
  );
}
