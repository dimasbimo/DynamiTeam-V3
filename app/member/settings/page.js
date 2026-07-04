import { redirect } from 'next/navigation';
import { getSession } from '../../../lib/session';
import MemberShell from '../../../components/MemberShell';
import SettingsPanel from '../../../components/SettingsPanel';

export const dynamic = 'force-dynamic';

export default async function MemberSettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const isAdmin = session.user.role === 'ADMIN';
  return (
    <MemberShell isAdmin={isAdmin}>
      <SettingsPanel />
    </MemberShell>
  );
}
