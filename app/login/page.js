'use client';

import { useState, useMemo } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

// Partikel ember dekoratif (CSS murni). Posisi/durasi acak sekali render.
function Embers({ count = 16 }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        duration: 6 + Math.random() * 7,
        delay: -Math.random() * 10,
        drift: (Math.random() * 2 - 1) * 20,
      })),
    [count]
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {embers.map((e, i) => (
        <span
          key={i}
          className="ember"
          style={{
            left: `${e.left}%`,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
            ['--drift']: `${e.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotHint, setForgotHint] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signIn('credentials', { username, password, redirect: false });

    setLoading(false);
    if (res?.error) {
      setError('ID login atau password salah.');
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden login-bg">
      {/* Glow dekoratif */}
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-24 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-25 anim-glow-drift"
        style={{ background: 'radial-gradient(circle, #f5c451, transparent 65%)' }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -right-24 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-20 anim-glow-drift"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 65%)', animationDelay: '-4.5s' }} />
      <Embers />

      <div className="w-full max-w-md relative anim-scale">
        <form onSubmit={handleSubmit} className="glass-panel px-6 sm:px-8 py-8 anim-slide-up">
          {/* Logo + wordmark */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-3 mb-1">
              <img src="/logo-icon.png" alt="DynamiTeam" className="w-14 h-14 object-contain drop-shadow-[0_0_18px_rgba(245,196,81,0.4)]" />
              <div className="text-left">
                <div className="font-display text-3xl font-bold text-white leading-none tracking-wide">Dynami Team</div>
                <div className="text-[11px] tracking-[0.35em] text-slate-400 mt-1">ACTIVITY SYSTEM</div>
              </div>
            </div>
          </div>

          {/* Welcome */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold">
              <span className="gold-text">Welcome Back,</span> <span className="text-white">Dynami Team</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">Login untuk menlihat activity, nyawa, dan leaderboard</p>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Username / Nickname / ID ML
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text" required value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input input-iconized"
                placeholder="Masukkan username, nickname, atau ID ML"
                autoCapitalize="none" autoCorrect="off"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPw ? 'text' : 'password'} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-iconized input-iconized-r"
                placeholder="Masukkan password"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-rose-400 mt-2">{error}</p>}

          {/* Tombol login */}
          <button type="submit" disabled={loading}
            className="gold-button w-full flex items-center justify-center gap-2 text-base py-3 mt-5">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {loading ? 'Memproses...' : 'Login'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>

          {/* Lupa password (tanpa link "Hubungi Admin") */}
          <div className="text-center mt-4">
            <button type="button" onClick={() => setForgotHint((v) => !v)}
              className="text-sm text-amber-400/90 hover:text-amber-300">
              Lupa password?
            </button>
            {forgotHint && (
              <p className="text-[11px] text-slate-500 mt-1.5">Reset password dilakukan oleh admin squad kamu.</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
