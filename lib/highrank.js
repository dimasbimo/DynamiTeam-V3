// Rank Mobile Legends diturunkan OTOMATIS dari jumlah bintang.
// Ambang (inklusif): Mythic 0-24, Mythic Honor 25-49, Mythic Glory 50-99, Mythic Immortal 100+.
function rankFromStars(stars) {
  const s = Math.max(0, Math.trunc(Number(stars) || 0));
  if (s >= 100) return 'Mythic Immortal';
  if (s >= 50) return 'Mythic Glory';
  if (s >= 25) return 'Mythic Honor';
  return 'Mythic';
}

// Karena rank diturunkan dari bintang (monotonik), urut by bintang terbanyak
// SEKALIGUS mengurutkan tier dengan benar.
function sortHighrank(rows) {
  return [...rows].sort((a, b) => (b.point || 0) - (a.point || 0));
}

// Info highrank seorang member: rank, bintang, dan peringkat (#n) di board.
function highrankInfoFor(memberId, sortedEntries) {
  const idx = sortedEntries.findIndex((e) => e.memberId === memberId);
  if (idx === -1) return null;
  const e = sortedEntries[idx];
  return { rankName: e.rankName, point: e.point, position: idx + 1 };
}

module.exports = { rankFromStars, sortHighrank, highrankInfoFor };
