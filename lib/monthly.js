// =====================================================================
// Agregasi "bulanan" untuk leaderboard, profil, dan activity admin.
//
// CATATAN PENTING (dibaca dulu sebelum mengandalkan angka ini):
// Skema database TIDAK menyimpan total bulanan. `member.activityPoint`
// adalah nilai minggu berjalan yang ditimpa tiap proses mingguan.
// Jadi "total bulanan" di sini adalah REKONSTRUKSI dari snapshot
// WeeklyHistory: menjumlahkan activityPoint tiap minggu yang tanggalnya
// jatuh di bulan terpilih. Kalau belum ada history di bulan itu,
// fallback ke member.activityPoint agar UI tetap terisi.
// Angka ini pendekatan untuk tampilan/pertimbangan, bukan metrik resmi.
// =====================================================================

// 'YYYY-MM' dari sebuah Date/ISO string.
function monthKey(date) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}`;
}

// Label ramah manusia: '2026-07' -> 'Juli 2026'
function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

// Daftar pilihan bulan: dari bulan sekarang mundur `count` bulan.
function recentMonths(count = 6) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(monthKey(d));
  }
  return out;
}

// History satu member yang jatuh pada bulan terpilih (urut minggu naik).
function historyInMonth(history, key) {
  return history
    .filter((h) => monthKey(h.tanggal) === key)
    .sort((a, b) => a.mingguKe - b.mingguKe);
}

// Total activity bulanan satu member (dengan fallback ke nilai berjalan).
function monthlyTotalFor(member, history, key) {
  const rows = historyInMonth(history, key);
  if (rows.length > 0) {
    return rows.reduce((sum, h) => sum + (h.activityPoint || 0), 0);
  }
  // Fallback: hanya masuk akal untuk bulan berjalan.
  if (key === monthKey(new Date())) return member.activityPoint || 0;
  return 0;
}

// Rata-rata activity per minggu untuk satu member di bulan terpilih.
function weeklyAverageFor(member, history, key) {
  const rows = historyInMonth(history, key);
  if (rows.length === 0) return member ? member.activityPoint || 0 : 0;
  const sum = rows.reduce((s, h) => s + (h.activityPoint || 0), 0);
  return Math.round(sum / rows.length);
}

// Papan peringkat bulanan lengkap.
// members: Member[]; historiesByMember: { [memberId]: WeeklyHistory[] }
// -> [{ member, total, rank }] urut total desc, rank 1..n
function buildLeaderboard(members, historiesByMember, key) {
  const rows = members
    .filter((m) => m.status !== 'KICK')
    .map((m) => ({
      member: m,
      total: monthlyTotalFor(m, historiesByMember[m.id] || [], key),
    }))
    .sort((a, b) => b.total - a.total || a.member.nama.localeCompare(b.member.nama));

  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

// Peringkat satu member di bulan terpilih (atau null kalau tidak ada).
function rankOf(memberId, leaderboard) {
  const row = leaderboard.find((r) => r.member.id === memberId);
  return row ? row.rank : null;
}

module.exports = {
  monthKey,
  monthLabel,
  recentMonths,
  historyInMonth,
  monthlyTotalFor,
  weeklyAverageFor,
  buildLeaderboard,
  rankOf,
};
