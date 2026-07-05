import { redirect } from 'next/navigation';
import { getSession } from '../../../lib/session';
import { prisma } from '../../../lib/prisma';
import { sortHighrank } from '../../../lib/highrank';
import AdminShell from '../../../components/AdminShell';
import HighrankManager from '../../../components/HighrankManager';

export const dynamic = 'force-dynamic';

export default async function AdminHighrankPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const [rawEntries, members] = await Promise.all([
    prisma.highrankEntry.findMany({
      include: { member: { select: { id: true, nama: true, nicknameML: true, avatarUrl: true, mainRole: true, subRole: true, roleSquad: true } } },
    }),
    prisma.member.findMany({
      orderBy: { nama: 'asc' },
      select: { id: true, nama: true, nicknameML: true, avatarUrl: true, mainRole: true, subRole: true, roleSquad: true },
    }),
  ]);
  const entries = sortHighrank(rawEntries);

  return (
    <AdminShell>
      <HighrankManager entries={entries} members={members} />
    </AdminShell>
  );
}
