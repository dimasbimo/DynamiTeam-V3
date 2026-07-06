const { prisma } = require('./prisma');

const DEFAULT_ACTIVITY_RULE = {
  safePoint: 1500,
  bonusPoint: 3000,
};

function normalizeRule(rule) {
  return {
    safePoint: Number(rule?.safePoint ?? DEFAULT_ACTIVITY_RULE.safePoint),
    bonusPoint: Number(rule?.bonusPoint ?? DEFAULT_ACTIVITY_RULE.bonusPoint),
  };
}

async function getActiveActivityRule() {
  let rule = await prisma.activityRule.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
  });

  if (!rule) {
    rule = await prisma.activityRule.create({
      data: DEFAULT_ACTIVITY_RULE,
    });
  }

  return rule;
}

function validateActivityRuleInput({ safePoint, bonusPoint }) {
  const safe = Number(safePoint);
  const bonus = Number(bonusPoint);

  if (!Number.isInteger(safe) || !Number.isInteger(bonus)) {
    return { error: 'Batas activity harus berupa angka bulat.' };
  }

  if (safe < 0 || bonus < 0) {
    return { error: 'Batas activity tidak boleh kurang dari 0.' };
  }

  if (bonus <= safe) {
    return { error: 'Batas tambah nyawa harus lebih besar dari batas aman.' };
  }

  return { safePoint: safe, bonusPoint: bonus };
}

function getEffectiveActivityRule(rule, extraPoint = 0) {
  const base = normalizeRule(rule);
  const extra = Math.max(0, Number(extraPoint) || 0);

  return {
    safePoint: base.safePoint + extra,
    bonusPoint: base.bonusPoint + extra,
    extraPoint: extra,
  };
}

function getDeltaByRule(activityPoint, rule) {
  const r = normalizeRule(rule);
  const point = Number(activityPoint) || 0;

  if (point < r.safePoint) return -1;
  if (point < r.bonusPoint) return 0;
  return 1;
}

async function getActivePenaltyMap() {
  const penalties = await prisma.activityPenalty.findMany({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
  });

  const map = {};
  for (const p of penalties) {
    map[p.memberId] = (map[p.memberId] || 0) + (p.extraPoint || 0);
  }

  return map;
}

function toPlainRule(rule) {
  const r = normalizeRule(rule);
  return { safePoint: r.safePoint, bonusPoint: r.bonusPoint };
}

module.exports = {
  DEFAULT_ACTIVITY_RULE,
  normalizeRule,
  getActiveActivityRule,
  validateActivityRuleInput,
  getEffectiveActivityRule,
  getDeltaByRule,
  getActivePenaltyMap,
  toPlainRule,
};
