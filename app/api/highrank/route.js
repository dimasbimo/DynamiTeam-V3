const { getSession, requireAdmin } = require('../../../lib/session');
const { prisma } = require('../../../lib/prisma');
const { sortHighrank, rankFromStars } = require('../../../lib/highrank');

const MEMBER_SELECT = {
  id: true, nama: true, nicknameML: true, avatarUrl: true,
  mainRole: true, subRole: true, roleSquad: true,
};

// GET: daftar highrank (semua user login boleh lihat), urut by bintang terbanyak.
async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Tidak diizinkan' }, { status: 403 });
  const entries = await prisma.highrankEntry.findMany({ include: { member: { select: MEMBER_SELECT } } });
  return Response.json({ entries: sortHighrank(entries) });
}

// POST: tambah entry highrank (admin). memberId @unique -> cegah dobel.
async function POST(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const memberId = String(body.memberId || '').trim();
  if (!memberId) {
    return Response.json({ error: 'Member wajib dipilih.' }, { status: 400 });
  }
  const point = Number.isFinite(+body.point) ? Math.max(0, Math.trunc(+body.point)) : 0;
  const rankName = rankFromStars(point); // rank OTOMATIS dari bintang

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return Response.json({ error: 'Member tidak ditemukan.' }, { status: 404 });

  const exists = await prisma.highrankEntry.findUnique({ where: { memberId } });
  if (exists) return Response.json({ error: 'Member ini sudah ada di leaderboard highrank.' }, { status: 409 });

  const entry = await prisma.highrankEntry.create({
    data: {
      memberId,
      rankName,
      point,
      season: body.season ? String(body.season).trim() : null,
      note: body.note ? String(body.note).trim() : null,
      order: Number.isFinite(+body.order) ? Math.trunc(+body.order) : 0,
    },
  });
  return Response.json({ entry });
}

module.exports = { GET, POST };
