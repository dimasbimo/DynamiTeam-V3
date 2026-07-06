// =====================================================================
// Agregasi "bulanan" untuk leaderboard, profil, dan activity admin.
//
// Catatan:
// WeeklyHistory berisi 2 jenis data:
// 1. Riwayat proses activity mingguan asli
// 2. Riwayat manual admin, seperti tambah nyawa, kurangi nyawa, reset nyawa
//
// Untuk total dan rata-rata activity, yang dihitung hanya riwayat activity asli.
// Riwayat manual tetap ditampilkan di tabel/riwayat, tapi tidak ikut hitungan activity.
// =====================================================================

function monthKey(date) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${m}`;
}

function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

function recentMonths(count = 6) {
  const out = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(monthKey(d));
  }

  return out;
}

// History semua jenis, termasuk manual bonus/hukuman/reset.
function historyInMonth(history, key) {
  return history
    .filter((h) => monthKey(h.tanggal) === key)
    .sort((a, b) => a.mingguKe - b.mingguKe);
}

// Riwayat activity asli adalah riwayat yang tidak punya note.
// Proses mingguan normal dari /api/process-week tidak mengisi note.
// Aksi manual admin seperti reset/tambah/kurangi nyawa mengisi note.
function isActivityHistory(h) {
  return !h.note;
}

function activityHistoryInMonth(history, key) {
  return historyInMonth(history, key).filter(isActivityHistory);
}

function monthlyTotalFor(member, history, key) {
  const rows = activityHistoryInMonth(history, key);

  if (rows.length > 0) {
    return rows.reduce((sum, h) => sum + (h.activityPoint || 0), 0);
  }

  if (key === monthKey(new Date())) {
    return member.activityPoint || 0;
  }

  return 0;
}

function weeklyAverageFor(member, history, key) {
  const rows = activityHistoryInMonth(history, key);

  if (rows.length === 0) {
    return member ? member.activityPoint || 0 : 0;
  }

  const sum = rows.reduce((s, h) => s + (h.activityPoint || 0), 0);
  return Math.round(sum / rows.length);
}

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

function rankOf(memberId, leaderboard) {
  const row = leaderboard.find((r) => r.member.id === memberId);
  return row ? row.rank : null;
}

module.exports = {
  monthKey,
  monthLabel,
  recentMonths,
  historyInMonth,
  activityHistoryInMonth,
  isActivityHistory,
  monthlyTotalFor,
  weeklyAverageFor,
  buildLeaderboard,
  rankOf,
};