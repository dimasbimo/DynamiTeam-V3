import { redirect } from 'next/navigation';
import { getSession } from '../../lib/session';
import { prisma } from '../../lib/prisma';
import AdminShell from '../../components/AdminShell';
import AdminDashboard from './AdminDashboard';
import { getActiveActivityRule, getActivePenaltyMap, toPlainRule } from '../../lib/activityRules';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const [members, lastWeek, activityRule, penaltyMap] = await Promise.all([
    prisma.member.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.weeklyHistory.aggregate({ _max: { mingguKe: true } }),
    getActiveActivityRule(),
    getActivePenaltyMap(),
  ]);

  const weekNumber = (lastWeek._max.mingguKe || 0) + 1;

  return (
    <AdminShell>
      <AdminDashboard
        initialMembers={members}
        initialWeekNumber={weekNumber}
        activityRule={toPlainRule(activityRule)}
        penaltyMap={penaltyMap}
      />
    </AdminShell>
  );
}
