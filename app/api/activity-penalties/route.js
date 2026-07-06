const { prisma } = require('../../../lib/prisma');
const { requireAdmin } = require('../../../lib/session');

async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const penalties = await prisma.activityPenalty.findMany({
    where: { isActive: true },
    include: { member: true },
    orderBy: { updatedAt: 'desc' },
  });

  return Response.json({ penalties });
}

async function POST(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const memberId = String(body.memberId || '');
  const extraPoint = Number(body.extraPoint);
  const reason = String(body.reason || '').trim();

  if (!memberId) {
    return Response.json({ error: 'Pilih member terlebih dahulu.' }, { status: 400 });
  }

  if (!Number.isInteger(extraPoint) || extraPoint <= 0) {
    return Response.json({ error: 'Tambahan activity harus angka lebih dari 0.' }, { status: 400 });
  }

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) {
    return Response.json({ error: 'Member tidak ditemukan.' }, { status: 404 });
  }

  const existing = await prisma.activityPenalty.findFirst({
    where: { memberId, isActive: true },
  });

  const penalty = existing
    ? await prisma.activityPenalty.update({
        where: { id: existing.id },
        data: { extraPoint, reason: reason || null, isActive: true },
        include: { member: true },
      })
    : await prisma.activityPenalty.create({
        data: { memberId, extraPoint, reason: reason || null },
        include: { member: true },
      });

  return Response.json({ penalty });
}

module.exports = { GET, POST };
