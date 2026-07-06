const { prisma } = require('../../../lib/prisma');
const { requireAdmin } = require('../../../lib/session');
const { getStatus, clamp } = require('../../../lib/rules');
const {
  getActiveActivityRule,
  getActivePenaltyMap,
  getEffectiveActivityRule,
  getDeltaByRule,
  toPlainRule,
} = require('../../../lib/activityRules');

// GET -> preview: hitung apa yang AKAN terjadi tanpa menyimpan apa pun.
async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [baseRule, penaltyMap, candidates, skippedCount, kickedLockedCount] = await Promise.all([
    getActiveActivityRule(),
    getActivePenaltyMap(),
    prisma.member.findMany({
      where: { activityInputted: true, status: { not: 'KICK' } },
    }),
    prisma.member.count({
      where: { activityInputted: false, status: { not: 'KICK' } },
    }),
    prisma.member.count({ where: { status: 'KICK' } }),
  ]);

  const preview = candidates.map((m) => {
    const penaltyExtraPoint = penaltyMap[m.id] || 0;
    const rule = getEffectiveActivityRule(baseRule, penaltyExtraPoint);
    const delta = getDeltaByRule(m.activityPoint, rule);
    const nyawaAfter = clamp(m.nyawaCurrent + delta, 0, 4);
    const statusAfter = getStatus(nyawaAfter);

    return {
      id: m.id,
      nama: m.nama,
      activityPoint: m.activityPoint,
      nyawaBefore: m.nyawaCurrent,
      delta,
      nyawaAfter,
      statusBefore: m.status,
      statusAfter,
      safePoint: rule.safePoint,
      bonusPoint: rule.bonusPoint,
      penaltyExtraPoint,
    };
  });

  return Response.json({
    rule: toPlainRule(baseRule),
    preview,
    skippedCount,
    kickedLockedCount,
  });
}

// POST -> eksekusi sungguhan: simpan riwayat + update member, dalam satu transaksi.
async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [baseRule, penaltyMap, candidates] = await Promise.all([
    getActiveActivityRule(),
    getActivePenaltyMap(),
    prisma.member.findMany({
      where: { activityInputted: true, status: { not: 'KICK' } },
    }),
  ]);

  if (candidates.length === 0) {
    return Response.json({ error: 'Tidak ada member dengan activity point yang siap diproses.' }, { status: 400 });
  }

  const lastWeek = await prisma.weeklyHistory.aggregate({ _max: { mingguKe: true } });
  const mingguKe = (lastWeek._max.mingguKe || 0) + 1;

  const ops = [];
  let kicksNow = 0;

  for (const m of candidates) {
    const penaltyExtraPoint = penaltyMap[m.id] || 0;
    const rule = getEffectiveActivityRule(baseRule, penaltyExtraPoint);
    const delta = getDeltaByRule(m.activityPoint, rule);
    const nyawaAfter = clamp(m.nyawaCurrent + delta, 0, 4);
    const statusAfter = getStatus(nyawaAfter);

    if (statusAfter === 'KICK' && m.status !== 'KICK') kicksNow += 1;

    const note = penaltyExtraPoint > 0
      ? `Target minggu ini terkena tambahan +${penaltyExtraPoint.toLocaleString('id-ID')} activity. Batas aman ${rule.safePoint.toLocaleString('id-ID')}, batas tambah nyawa ${rule.bonusPoint.toLocaleString('id-ID')}.`
      : `Aturan minggu ini: aman mulai ${rule.safePoint.toLocaleString('id-ID')}, tambah nyawa mulai ${rule.bonusPoint.toLocaleString('id-ID')}.`;

    ops.push(
      prisma.weeklyHistory.create({
        data: {
          memberId: m.id,
          mingguKe,
          activityPoint: m.activityPoint,
          nyawaBefore: m.nyawaCurrent,
          delta,
          nyawaAfter,
          statusAkhir: statusAfter,
          note,
        },
      })
    );

    ops.push(
      prisma.member.update({
        where: { id: m.id },
        data: {
          nyawaCurrent: nyawaAfter,
          status: statusAfter,
          activityInputted: false,
        },
      })
    );
  }

  await prisma.$transaction(ops);

  return Response.json({ ok: true, mingguKe, processed: candidates.length, kicksNow });
}

module.exports = { GET, POST };
