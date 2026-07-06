import { redirect } from 'next/navigation';
import { getSession } from '../../../lib/session';
import { prisma } from '../../../lib/prisma';
import AdminShell from '../../../components/AdminShell';
import ActivityRulesManager from '../../../components/ActivityRulesManager';
import { getActiveActivityRule, toPlainRule } from '../../../lib/activityRules';

export const dynamic = 'force-dynamic';

export default async function AdminRulesPage() {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN') redirect('/login');

  const [rule, members, penalties] = await Promise.all([
    getActiveActivityRule(),
    prisma.member.findMany({
      where: { status: { not: 'KICK' } },
      orderBy: { nama: 'asc' },
    }),
    prisma.activityPenalty.findMany({
      where: { isActive: true },
      include: { member: true },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const plainMembers = members.map((m) => ({
    id: m.id,
    nama: m.nama,
    nicknameML: m.nicknameML,
    status: m.status,
  }));

  const plainPenalties = penalties.map((p) => ({
    id: p.id,
    memberId: p.memberId,
    extraPoint: p.extraPoint,
    reason: p.reason,
    isActive: p.isActive,
    member: p.member ? {
      id: p.member.id,
      nama: p.member.nama,
      nicknameML: p.member.nicknameML,
    } : null,
  }));

  return (
    <AdminShell>
      <ActivityRulesManager
        initialRule={toPlainRule(rule)}
        members={plainMembers}
        initialPenalties={plainPenalties}
      />
    </AdminShell>
  );
}
