const { prisma } = require('../../../../lib/prisma');
const { requireAdmin, getSession } = require('../../../../lib/session');

async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Tidak diizinkan' }, { status: 403 });
  // admin boleh lihat siapa saja, member cuma boleh lihat dirinya sendiri
  if (session.user.role !== 'ADMIN' && session.user.memberId !== params.id) {
    return Response.json({ error: 'Tidak diizinkan' }, { status: 403 });
  }
  const member = await prisma.member.findUnique({ where: { id: params.id } });
  if (!member) return Response.json({ error: 'Member tidak ditemukan' }, { status: 404 });
  return Response.json({ member });
}

// Admin boleh mengubah profil siapa saja. Member HANYA boleh mengubah
// profil miliknya sendiri, dan HANYA field nickname/role/idML.
//
// KEAMANAN: endpoint ini tidak pernah menerima activityPoint / nyawa /
// status dari siapa pun (termasuk admin). Perubahan angka nyawa/activity
// hanya lewat /activity, /reset, dan /process-week yang khusus admin.
// Whitelist inilah yang mencegah member "menyuntik" activity point sendiri.
async function PATCH(req, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Tidak diizinkan' }, { status: 403 });

  const isAdmin = session.user.role === 'ADMIN';
  const isOwner = !!session.user.memberId && session.user.memberId === params.id;
  if (!isAdmin && !isOwner) {
    return Response.json({ error: 'Tidak diizinkan' }, { status: 403 });
  }

  const body = await req.json();
  const data = {};

  // Nama penuh hanya boleh diubah admin (form member tidak memuatnya).
  if (isAdmin && body.nama !== undefined) data.nama = String(body.nama).trim();
  if (body.nicknameML !== undefined) data.nicknameML = String(body.nicknameML).trim();
  if (body.idML !== undefined) data.idML = String(body.idML).trim();
  if (body.roleSquad !== undefined) data.roleSquad = String(body.roleSquad).trim();

  // Member tidak boleh mengosongkan field wajib.
  if (!isAdmin && (data.nicknameML === '' || data.roleSquad === '' || data.idML === '')) {
    return Response.json({ error: 'Nickname, role, dan ID ML wajib diisi.' }, { status: 400 });
  }

  if (Object.keys(data).length === 0) {
    return Response.json({ error: 'Tidak ada perubahan.' }, { status: 400 });
  }

  const member = await prisma.member.update({ where: { id: params.id }, data });
  return Response.json({ member });
}

async function DELETE(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  // PENTING: relasi User->Member pakai onDelete Cascade, artinya menghapus
  // member ikut menghapus akun login yang tertaut. Untuk akun MEMBER itu memang
  // yang diinginkan. Tapi kalau member ini tertaut ke akun ADMIN (fitur admin
  // merangkap member), akun admin harus dilepas dulu supaya tidak ikut terhapus.
  const linkedAdmin = await prisma.user.findFirst({
    where: { memberId: params.id, role: 'ADMIN' },
  });
  if (linkedAdmin) {
    await prisma.user.update({ where: { id: linkedAdmin.id }, data: { memberId: null } });
  }

  await prisma.member.delete({ where: { id: params.id } });
  return Response.json({ ok: true });
}

module.exports = { GET, PATCH, DELETE };
