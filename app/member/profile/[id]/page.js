import { redirect, notFound } from 'next/navigation';
import { getSession } from '../../../../lib/session';
import { prisma } from '../../../../lib/prisma';
import { monthKey, monthLabel, monthlyTotalFor, buildLeaderboard, rankOf } from '../../../../lib/monthly';
import { sortHighrank, highrankInfoFor } from '../../../../lib/highrank';
import MemberShell from '../../../../components/MemberShell';
import ProfileView from '../../../../components/ProfileView';

export const dynamic = 'force-dynamic';

export default async function MemberProfilePage({ params }) {
  const session = await getSession();
  if (!session) redirect('/login');
  const isAdmin = session.user.role === 'ADMIN';

  // Buka profil sendiri -> alihkan ke halaman profil pribadi (yang bisa diedit).
  if (session.user.memberId && session.user.memberId === params.id) {
    redirect('/member/profile');
  }

  const member = await prisma.member.findUnique({ where: { id: params.id } });
  if (!member) notFound();

  const [allMembers, allHistory, highrankRaw] = await Promise.all([
    prisma.member.findMany(),
    prisma.weeklyHistory.findMany(),
    prisma.highrankEntry.findMany(),
  ]);
  const highrankInfo = highrankInfoFor(member.id, sortHighrank(highrankRaw));
  const historiesByMember = {};
  for (const h of allHistory) (historiesByMember[h.memberId] ||= []).push(h);

  const key = monthKey(new Date());
  const leaderboard = buildLeaderboard(allMembers, historiesByMember, key);

  return (
    <MemberShell isAdmin={isAdmin}>
      <ProfileView
        member={member}
        monthlyTotal={monthlyTotalFor(member, historiesByMember[member.id] || [], key)}
        rank={rankOf(member.id, leaderboard)}
        highrankInfo={highrankInfo}
        monthLabel={monthLabel(key)}
        canEdit={false}
        backHref="/member/leaderboard"
        backLabel="Kembali ke Leaderboard"
      />
    </MemberShell>
  );
}
