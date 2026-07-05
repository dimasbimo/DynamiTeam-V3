const { requireAdmin } = require('../../../../lib/session');
const { prisma } = require('../../../../lib/prisma');
const { rankFromStars } = require('../../../../lib/highrank');

// PATCH: ubah data highrank (admin). Tidak menyentuh data member.
async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const data = {};
  // rankName TIDAK diterima dari client — selalu diturunkan dari bintang.
  if (body.point !== undefined) {
    const point = Number.isFinite(+body.point) ? Math.max(0, Math.trunc(+body.point)) : 0;
    data.point = point;
    data.rankName = rankFromStars(point);
  }
  if (body.season !== undefined) data.season = body.season ? String(body.season).trim() : null;
  if (body.note !== undefined) data.note = body.note ? String(body.note).trim() : null;
  if (body.order !== undefined) data.order = Number.isFinite(+body.order) ? Math.trunc(+body.order) : 0;

  if (Object.keys(data).length === 0) return Response.json({ error: 'Tidak ada perubahan.' }, { status: 400 });

  const entry = await prisma.highrankEntry.update({ where: { id: params.id }, data });
  return Response.json({ entry });
}

// DELETE: hapus entry highrank saja. Data member TIDAK ikut terhapus.
async function DELETE(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  await prisma.highrankEntry.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}

module.exports = { PATCH, DELETE };
