const { put, del } = require('@vercel/blob');
const { getSession } = require('../../../../../lib/session');
const { prisma } = require('../../../../../lib/prisma');

const MAX_BYTES = 512 * 1024; // 512KB: cukup untuk JPEG 256px, cukup ketat untuk cegah abuse

// Deteksi tipe gambar dari magic-byte (JANGAN percaya Content-Type dari client).
function detectImage(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return { ext: 'png', mime: 'image/png' };
  if (buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return { ext: 'webp', mime: 'image/webp' };
  return null;
}

// Cek izin: admin boleh siapa saja, member hanya dirinya sendiri.
async function authorize(params) {
  const session = await getSession();
  if (!session) return { error: Response.json({ error: 'Tidak diizinkan' }, { status: 403 }) };
  const isAdmin = session.user.role === 'ADMIN';
  const isOwner = !!session.user.memberId && session.user.memberId === params.id;
  if (!isAdmin && !isOwner) return { error: Response.json({ error: 'Tidak diizinkan' }, { status: 403 }) };
  return { session };
}

async function POST(req, { params }) {
  const { error } = await authorize(params);
  if (error) return error;

  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.length === 0) return Response.json({ error: 'File kosong.' }, { status: 400 });
  if (buf.length > MAX_BYTES) return Response.json({ error: 'Foto terlalu besar setelah kompres.' }, { status: 400 });

  const kind = detectImage(buf);
  if (!kind) return Response.json({ error: 'File bukan gambar yang valid (JPG/PNG/WebP).' }, { status: 400 });

  const member = await prisma.member.findUnique({ where: { id: params.id } });
  if (!member) return Response.json({ error: 'Member tidak ditemukan.' }, { status: 404 });

  // Upload baru dulu (addRandomSuffix agar tak tabrakan & cache-busting).
  const { url } = await put(`avatars/${params.id}.${kind.ext}`, buf, {
    access: 'public',
    contentType: kind.mime,
    addRandomSuffix: true,
  });

  // Baru hapus yang lama supaya kalau upload gagal, foto lama tak keburu hilang.
  if (member.avatarUrl) {
    try { await del(member.avatarUrl); } catch (_) { /* abaikan: file lama mungkin sudah tiada */ }
  }

  await prisma.member.update({ where: { id: params.id }, data: { avatarUrl: url } });
  return Response.json({ url });
}

async function DELETE(req, { params }) {
  const { error } = await authorize(params);
  if (error) return error;

  const member = await prisma.member.findUnique({ where: { id: params.id } });
  if (!member) return Response.json({ error: 'Member tidak ditemukan.' }, { status: 404 });

  if (member.avatarUrl) {
    try { await del(member.avatarUrl); } catch (_) { /* abaikan */ }
    await prisma.member.update({ where: { id: params.id }, data: { avatarUrl: null } });
  }
  return Response.json({ ok: true });
}

module.exports = { POST, DELETE };
