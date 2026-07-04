import { redirect } from 'next/navigation';
import { getSession } from '../../../lib/session';
import AdminShell from '../../../components/AdminShell';
import SettingsPanel from '../../../components/SettingsPanel';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');
  return (
    <AdminShell>
      <SettingsPanel />
    </AdminShell>
  );
}
