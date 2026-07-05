// Pilihan role (dropdown, bukan ketik manual). Dipakai server & client.
const MAIN_ROLES = ['Roam', 'Jungler', 'Mid Lane', 'Gold Lane', 'EXP Lane'];
const SUB_ROLES = ['Roam', 'Jungler', 'Mid Lane', 'Gold Lane', 'EXP Lane'];

// Label role untuk ditampilkan. Utamakan mainRole+subRole; kalau belum ada,
// fallback ke roleSquad lama supaya data lama tidak hilang / tidak error.
function roleLabel(m) {
  if (!m) return '-';
  if (m.mainRole && m.subRole) return `${m.mainRole} - ${m.subRole}`;
  if (m.mainRole) return m.mainRole;
  if (m.roleSquad && m.roleSquad !== '-') return m.roleSquad;
  return '-';
}

module.exports = { MAIN_ROLES, SUB_ROLES, roleLabel };
