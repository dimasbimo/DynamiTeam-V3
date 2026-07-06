const { prisma } = require('../../../lib/prisma');
const { requireAdmin } = require('../../../lib/session');
const {
  getActiveActivityRule,
  validateActivityRuleInput,
} = require('../../../lib/activityRules');

async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const rule = await getActiveActivityRule();
  return Response.json({ rule });
}

async function PUT(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const parsed = validateActivityRuleInput(body);

  if (parsed.error) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  const current = await getActiveActivityRule();
  const rule = await prisma.activityRule.update({
    where: { id: current.id },
    data: {
      safePoint: parsed.safePoint,
      bonusPoint: parsed.bonusPoint,
      isActive: true,
    },
  });

  return Response.json({ rule });
}

module.exports = { GET, PUT };
