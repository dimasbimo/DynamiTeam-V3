const { getSession } = require('../../../../lib/session');
const { prisma } = require('../../../../lib/prisma');

// Profil ringkas untuk header drawer mobile. Selalu diambil fresh (tak di-cache SW).
async function GET() {
  const session = await getSession();
  if (!session?.user?.memberId) return Response.json({ member: null });
  const member = await prisma.member.findUnique({
    where: { id: session.user.memberId },
    select: { id: true, nama: true, nicknameML: true, roleSquad: true, avatarUrl: true },
  });
  return Response.json({ member });
}

module.exports = { GET };
