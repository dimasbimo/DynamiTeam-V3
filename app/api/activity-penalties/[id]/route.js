const { prisma } = require('../../../../lib/prisma');
const { requireAdmin } = require('../../../../lib/session');

async function DELETE(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const penalty = await prisma.activityPenalty.findUnique({
    where: { id: params.id },
  });

  if (!penalty) {
    return Response.json({ error: 'Data hukuman tidak ditemukan.' }, { status: 404 });
  }

  const updated = await prisma.activityPenalty.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return Response.json({ penalty: updated });
}

module.exports = { DELETE };
