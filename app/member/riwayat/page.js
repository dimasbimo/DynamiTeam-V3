import { redirect } from 'next/navigation';
import { getSession } from '../../../lib/session';
import { prisma } from '../../../lib/prisma';
import MemberShell from '../../../components/MemberShell';
import HistoryTable from '../../../components/HistoryTable';

export const dynamic = 'force-dynamic';

export default async function MemberRiwayatPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const isAdmin = session.user.role === 'ADMIN';
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.memberId) redirect('/member');

  const history = await prisma.weeklyHistory.findMany({
    where: { memberId: user.memberId },
    orderBy: [{ mingguKe: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <MemberShell isAdmin={isAdmin}>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Riwayat Mingguan</h1>
        <p className="text-sm text-slate-400 mb-5">Seluruh catatan proses mingguan nyawa &amp; activity kamu.</p>
        <HistoryTable history={history} emptyHint="Riwayat muncul setelah admin menjalankan proses minggu pertama." />
      </div>
    </MemberShell>
  );
}
