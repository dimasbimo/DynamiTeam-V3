const { prisma } = require('../../../../../lib/prisma');
const { requireAdmin } = require('../../../../../lib/session');
const { clamp, getStatus, MAX_NYAWA } = require('../../../../../lib/rules');

async function POST(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const delta = Number(body.delta);

  if (![1, -1].includes(delta)) {
    return Response.json(
      { error: 'Aksi nyawa tidak valid.' },
      { status: 400 }
    );
  }

  const member = await prisma.member.findUnique({
    where: { id: params.id },
  });

  if (!member) {
    return Response.json(
      { error: 'Member tidak ditemukan.' },
      { status: 404 }
    );
  }

  if (delta === 1 && member.nyawaCurrent >= MAX_NYAWA) {
    return Response.json(
      { error: 'Nyawa member sudah maksimal.' },
      { status: 400 }
    );
  }

  if (delta === -1 && member.nyawaCurrent <= 0) {
    return Response.json(
      { error: 'Nyawa member sudah 0.' },
      { status: 400 }
    );
  }

  const nyawaBefore = member.nyawaCurrent;
  const nyawaAfter = clamp(nyawaBefore + delta, 0, MAX_NYAWA);
  const statusAfter = getStatus(nyawaAfter);

  const lastWeek = await prisma.weeklyHistory.aggregate({
    _max: { mingguKe: true },
  });

  const mingguKe = lastWeek._max.mingguKe || 1;

  const note =
    delta === 1
      ? 'Nyawa ditambah manual oleh admin sebagai bonus.'
      : 'Nyawa dikurangi manual oleh admin sebagai hukuman.';

  const [, updated] = await prisma.$transaction([
    prisma.weeklyHistory.create({
      data: {
        memberId: member.id,
        mingguKe,
        activityPoint: 0,
        nyawaBefore,
        delta,
        nyawaAfter,
        statusAkhir: statusAfter,
        note,
      },
    }),
    prisma.member.update({
      where: { id: member.id },
      data: {
        nyawaCurrent: nyawaAfter,
        status: statusAfter,
      },
    }),
  ]);

  return Response.json({ member: updated });
}

module.exports = { POST };