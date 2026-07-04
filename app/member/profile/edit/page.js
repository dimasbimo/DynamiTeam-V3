import { redirect } from 'next/navigation';
import { getSession } from '../../../../lib/session';
import { prisma } from '../../../../lib/prisma';
import MemberShell from '../../../../components/MemberShell';
import EditProfileForm from '../../../../components/EditProfileForm';

export const dynamic = 'force-dynamic';

export default async function EditProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const isAdmin = session.user.role === 'ADMIN';

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.memberId) redirect('/member');
  const member = await prisma.member.findUnique({ where: { id: user.memberId } });
  if (!member) redirect('/member');

  return (
    <MemberShell isAdmin={isAdmin}>
      <EditProfileForm member={member} />
    </MemberShell>
  );
}
