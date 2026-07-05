import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import { monthKey, monthlyTotalFor, buildLeaderboard, rankOf } from '../../lib/monthly';
import MemberShell from '../../components/MemberShell';
import MemberDashboard from './MemberDashboard';

export const dynamic = 'force-dynamic';

export default async function MemberPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const isAdmin = session.user.role === 'ADMIN';

  if (!user?.memberId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-400 text-sm px-6 text-center premium-bg">
        {isAdmin ? (
          <>
            <p>Akun admin kamu belum tertaut ke data member.</p>
            <p>Buka dashboard admin, klik &quot;Tambah Member&quot;, lalu centang opsi <span className="text-slate-200">&quot;Ini data saya sendiri (admin)&quot;</span>.</p>
            <Link href="/admin" className="btn-primary mt-2">Ke Dashboard Admin</Link>
          </>
        ) : (
          <p>Akun ini belum terhubung ke data member. Hubungi admin squad.</p>
        )}
      </div>
    );
  }

  const member = await prisma.member.findUnique({ where: { id: user.memberId } });
  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm premium-bg">
        Data member tidak ditemukan. Hubungi admin squad.
      </div>
    );
  }

  const [allMembers, allHistory] = await Promise.all([
    prisma.member.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.weeklyHistory.findMany({ orderBy: [{ mingguKe: 'desc' }, { createdAt: 'desc' }] }),
  ]);

  const historiesByMember = {};
  for (const h of allHistory) {
    (historiesByMember[h.memberId] ||= []).push(h);
  }
  const myHistory = historiesByMember[member.id] || [];

  const curKey = monthKey(new Date());
  const leaderboard = buildLeaderboard(allMembers, historiesByMember, curKey);
  const monthlyTotal = monthlyTotalFor(member, myHistory, curKey);
  const myRank = rankOf(member.id, leaderboard);

  // Delta activity dibanding minggu sebelumnya (dari 2 history terbaru).
  let prevDelta = null;
  if (myHistory.length >= 2) {
    prevDelta = (myHistory[0].activityPoint || 0) - (myHistory[1].activityPoint || 0);
  }

  // Kirim hanya field yang dibutuhkan preview leaderboard (ringkas & serializable).
  const leaderboardPreview = leaderboard.slice(0, 5).map((r) => ({
    id: r.member.id,
    nama: r.member.nama,
    nicknameML: r.member.nicknameML,
    roleSquad: r.member.roleSquad,
    avatarUrl: r.member.avatarUrl,
    total: r.total,
    rank: r.rank,
  }));

  return (
    <MemberShell isAdmin={isAdmin}>
      <MemberDashboard
        member={member}
        history={myHistory}
        monthlyTotal={monthlyTotal}
        myRank={myRank}
        prevDelta={prevDelta}
        leaderboardPreview={leaderboardPreview}
        totalMembers={allMembers.filter((m) => m.status !== 'KICK').length}
      />
    </MemberShell>
  );
}
