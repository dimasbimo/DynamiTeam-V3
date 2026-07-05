'use client';

import { useEffect } from 'react';

// Mendaftarkan service worker setelah halaman load. Aman: kalau browser tak
// mendukung, tak melakukan apa-apa.
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const onLoad = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
