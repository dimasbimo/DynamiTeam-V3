export default function manifest() {
  return {
    name: 'DynamiTeam Activity System',
    short_name: 'DynamiTeam',
    description: 'Sistem manajemen keaktifan member squad Mobile Legends DynamiTeam',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#070a12',
    theme_color: '#0b0f1c',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Dashboard', short_name: 'Dashboard', url: '/member', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Profile', short_name: 'Profile', url: '/member/profile', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Leaderboard', short_name: 'Leaderboard', url: '/member/leaderboard', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
