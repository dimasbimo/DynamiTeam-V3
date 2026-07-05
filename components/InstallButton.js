'use client';

import { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';

export default function InstallButton() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (standalone) { setInstalled(true); return; }

    // iOS Safari tidak pernah memicu beforeinstallprompt — install manual via Share.
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIOS(ios);

    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  // Chromium (Android/desktop): tombol install asli.
  if (deferred) {
    return (
      <button
        onClick={async () => { deferred.prompt(); await deferred.userChoice; setDeferred(null); }}
        className="gold-button inline-flex items-center justify-center gap-2 w-full"
      >
        <Download className="w-4 h-4" /> Install Aplikasi
      </button>
    );
  }

  // iOS: tak ada prompt otomatis — beri instruksi manual.
  if (isIOS) {
    return (
      <p className="text-xs text-slate-400 leading-relaxed">
        Untuk install di iPhone/iPad: ketuk tombol <Share className="inline w-3.5 h-3.5 -mt-0.5" /> (Share) di
        Safari, lalu pilih <span className="text-slate-200">"Add to Home Screen"</span>.
      </p>
    );
  }

  // Browser tak mendukung install / belum siap → jangan tampilkan apa-apa.
  return null;
}
