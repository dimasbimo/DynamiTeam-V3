// Aturan inti sistem nyawa. Status nyawa tetap di sini.
// Batas activity mingguan sekarang bisa diatur admin lewat database.

const MAX_NYAWA = 4;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Fallback lama untuk bagian kode yang belum membaca ActivityRule dari database.
// Default: <1500 nyawa berkurang, 1500-2999 aman, 3000+ tambah nyawa.
function getDelta(activityPoint, rule = { safePoint: 1500, bonusPoint: 3000 }) {
  const point = Number(activityPoint) || 0;
  const safePoint = Number(rule?.safePoint ?? 1500);
  const bonusPoint = Number(rule?.bonusPoint ?? 3000);

  if (point < safePoint) return -1;
  if (point < bonusPoint) return 0;
  return 1;
}

function getStatus(nyawa) {
  if (nyawa >= 3) return 'AMAN';
  if (nyawa === 2) return 'WASPADA';
  if (nyawa === 1) return 'TERANCAM_KICK';
  return 'KICK';
}

const STATUS_LABEL = {
  AMAN: 'Aman',
  WASPADA: 'Waspada',
  TERANCAM_KICK: 'Terancam Kick',
  KICK: 'Kick',
};

module.exports = { MAX_NYAWA, clamp, getDelta, getStatus, STATUS_LABEL };
