import './globals.css';
import Providers from './providers';
import PWARegister from '../components/PWARegister';

export const metadata = {
  title: 'DynamiTeam Activity System',
  description: 'Sistem manajemen keaktifan member squad Mobile Legends DynamiTeam',
  icons: { icon: '/favicon.png', apple: '/icons/icon-192.png' },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'DynamiTeam' },
};

export const viewport = {
  themeColor: '#0b0f1c',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="font-body text-slate-100 min-h-screen" style={{ backgroundColor: '#070a12' }}>
        <Providers>{children}</Providers>
        <PWARegister />
      </body>
    </html>
  );
}
