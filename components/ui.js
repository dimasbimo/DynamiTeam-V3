  'use client';

  import { useState } from 'react';
  import Link from 'next/link';
  import { usePathname } from 'next/navigation';
  import { signOut } from 'next-auth/react';
  import {
    ShieldCheck, AlertTriangle, Skull, ArrowUp, ArrowDown, Minus, X, Inbox,
    User, Menu, ChevronRight, LogOut, Trophy, Crown, Medal,
  } from 'lucide-react';

  export const MAX_NYAWA = 4;

  export const STATUS_STYLES = {
    AMAN: { label: 'Aman', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: ShieldCheck },
    WASPADA: { label: 'Waspada', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: AlertTriangle },
    TERANCAM_KICK: { label: 'Terancam Kick', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: AlertTriangle },
    KICK: { label: 'Kick', text: 'text-slate-400', bg: 'bg-slate-700/40', border: 'border-slate-600/50', icon: Skull },
  };

  // ---------------------------------------------------------------------
  // Nyawa: shard/diamond 4 slot, terisi = gradient gold/amber
  // ---------------------------------------------------------------------
  export function NyawaShards({ n, size = 'md' }) {
    const dims = size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
    const gap = size === 'lg' ? 'gap-2.5' : 'gap-1.5';
    const critical = n === 1;
    return (
      <div className={`flex items-center ${gap}`}>
        {Array.from({ length: MAX_NYAWA }).map((_, i) => (
          <div
            key={i}
            className={`${dims} rotate-45 rounded-[3px] border ${i < n && critical ? 'anim-pulse-danger' : ''}`}
            style={
              i < n
                ? {
                    background: critical
                      ? 'linear-gradient(135deg, #f59e0b, #f43f5e)'
                      : 'linear-gradient(135deg, #ffdd8a, #f59e0b)',
                    borderColor: 'rgba(245,196,81,0.7)',
                    boxShadow: critical ? '0 0 8px rgba(244,63,94,0.55)' : '0 0 8px rgba(245,158,11,0.5)',
                  }
                : { background: 'rgba(17,23,40,0.85)', borderColor: 'rgba(71,85,105,0.5)' }
            }
          />
        ))}
      </div>
    );
  }

  export function StatusBadge({ status, size = 'md' }) {
    const s = STATUS_STYLES[status] || STATUS_STYLES.WASPADA;
    const Icon = s.icon;
    const pad = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border ${s.bg} ${s.border} ${s.text} ${pad} font-medium whitespace-nowrap`}>
        <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
        {s.label}
      </span>
    );
  }

  export function DeltaTag({ delta }) {
    if (delta > 0) return <span className="inline-flex items-center gap-0.5 text-emerald-400"><ArrowUp className="w-3.5 h-3.5" />+{delta}</span>;
    if (delta < 0) return <span className="inline-flex items-center gap-0.5 text-rose-400"><ArrowDown className="w-3.5 h-3.5" />{delta}</span>;
    return <span className="inline-flex items-center gap-0.5 text-slate-400"><Minus className="w-3.5 h-3.5" />0</span>;
  }

  // Zona activity: <1500 bahaya, 1500-3000 aman, >3000 bonus
  export function getActivityZone(value) {
    if (value < 1500) return { key: 'danger', label: 'Bahaya', text: 'text-rose-400', fill: '#f43f5e' };
    if (value <= 3000) return { key: 'safe', label: 'Aman', text: 'text-emerald-400', fill: '#34d399' };
    return { key: 'bonus', label: 'Bonus nyawa', text: 'text-amber-300', fill: '#f59e0b' };
  }

  // Bar segmented: skala 0..4500, penanda ambang di 1500 dan 3000.
  export function ActivityMeter({ value, showLabel = true }) {
    const zone = getActivityZone(value);
    const pct = Math.min(value / 4500, 1) * 100;
    return (
      <div>
        <div className="relative h-2 rounded-full overflow-hidden" style={{ background: '#151d31' }}>
          <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${pct}%`, background: zone.fill, opacity: 0.9 }} />
          <div className="absolute inset-y-0 w-px bg-slate-500/70" style={{ left: '33.33%' }} />
          <div className="absolute inset-y-0 w-px bg-slate-500/70" style={{ left: '66.66%' }} />
        </div>
        {showLabel && (
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0</span><span>1.500</span><span>3.000</span><span>&gt;</span>
          </div>
        )}
      </div>
    );
  }

  // Latar dekoratif halaman kerja (statis, redup, ringan saat scroll).
  export function PageBackdrop() {
    return (
      <>
        <div aria-hidden className="pointer-events-none fixed -top-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-[0.10] -z-10"
          style={{ background: 'radial-gradient(circle, #f5c451, transparent 65%)' }} />
        <div aria-hidden className="pointer-events-none fixed -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-[0.09] -z-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 65%)' }} />
        <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 h-px -z-10"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(245,196,81,0.4), rgba(139,92,246,0.35), transparent)' }} />
      </>
    );
  }

  export function EmptyState({ title, hint }) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <Inbox className="w-8 h-8 text-slate-600 mb-3" />
        <p className="text-sm text-slate-400">{title}</p>
        {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      </div>
    );
  }

  export function ModalShell({ title, children, onClose, wide }) {
    return (
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 overflow-y-auto overscroll-contain p-4 anim-fade"
        onClick={onClose}
      >

        <div className="flex min-h-full items-start sm:items-center justify-center">
          <div onClick={(e) => e.stopPropagation()}
            className={`dyn-card dyn-card-accent p-5 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} my-4 anim-slide-up`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
              <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  }

  export function Field({ label, children }) {
    return (
      <label className="block">
        <span className="block text-xs text-slate-400 mb-1">{label}</span>
        {children}
      </label>
    );
  }

  export function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // =====================================================================
  //  Komponen premium baru
  // =====================================================================

  // Avatar bulat dengan ring gold + glow. Fallback ke inisial nama.
  export function AvatarRing({ name = '?', src = null, size = 64, danger = false }) {
    const inner = size - 4;
    const initials = (name || '?')
      .split(' ')
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
    return (
      <div
        className="avatar-ring shrink-0"
        style={{ width: size, height: size, background: danger ? 'conic-gradient(from 210deg, #f43f5e, #f59e0b, #f43f5e)' : undefined }}
      >
        <div className="avatar-ring-inner" style={{ width: inner, height: inner }}>
          {src ? (
            <img src={src} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display font-bold text-slate-300" style={{ fontSize: size * 0.34 }}>
              {initials || <User className="w-1/2 h-1/2 text-slate-400" />}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Kartu statistik ringkas (label kecil + angka besar).
  export function StatCard({ label, value, sub, accent = false, icon: Icon }) {
    return (
      <div className={`dyn-card ${accent ? 'dyn-card-accent' : ''} p-3.5`}>
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          <span>{label}</span>
        </div>
        <div className="text-2xl font-display font-bold text-white leading-tight">{value}</div>
        {sub && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
      </div>
    );
  }

  // Section card dengan judul + aksi opsional di kanan atas.
  export function SectionCard({ title, action, children, className = '', accent = false }) {
    return (
      <div className={`dyn-card ${accent ? 'dyn-card-accent' : ''} p-4 sm:p-5 ${className}`}>
        {(title || action) && (
          <div className="flex items-center justify-between gap-2 mb-3">
            {title && <h3 className="font-display text-sm font-semibold text-slate-200 uppercase tracking-wide">{title}</h3>}
            {action}
          </div>
        )}
        {children}
      </div>
    );
  }

  export function PremiumButton({ children, className = '', as = 'button', href, ...rest }) {
    if (as === 'link' && href) {
      return <Link href={href} className={`gold-button inline-flex items-center justify-center gap-2 ${className}`} {...rest}>{children}</Link>;
    }
    return <button className={`gold-button inline-flex items-center justify-center gap-2 ${className}`} {...rest}>{children}</button>;
  }

  // Medali peringkat untuk 3 besar.
  function RankBadge({ rank }) {
    if (rank === 1) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-amber-300" style={{ background: 'rgba(245,196,81,0.16)', border: '1px solid rgba(245,196,81,0.5)' }}><Crown className="w-4 h-4" /></span>;
    if (rank === 2) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-slate-300" style={{ background: 'rgba(148,163,184,0.16)', border: '1px solid rgba(148,163,184,0.5)' }}><Medal className="w-4 h-4" /></span>;
    if (rank === 3) return <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-orange-300" style={{ background: 'rgba(176,141,87,0.18)', border: '1px solid rgba(176,141,87,0.55)' }}><Medal className="w-4 h-4" /></span>;
    return <span className="inline-flex items-center justify-center w-7 h-7 text-slate-400 font-display font-semibold text-sm">{rank}</span>;
  }

  // List leaderboard. rows: [{ member, total, rank }]
  export function LeaderboardList({ rows, hrefFor, highlightId, compact = false }) {
    if (!rows || rows.length === 0) return <EmptyState title="Belum ada data peringkat bulan ini." />;
    return (
      <div className="space-y-2">
        {rows.map(({ member, total, rank }) => {
          const top = rank <= 3;
          const me = highlightId && member.id === highlightId;
          const body = (
            <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-colors ${
              me ? 'border-amber-500/50 bg-amber-500/[0.06]' : top ? 'border-amber-500/25 bg-amber-500/[0.03]' : 'border-transparent hover:bg-white/[0.03]'
            }`}>
              <div className="w-7 flex justify-center shrink-0"><RankBadge rank={rank} /></div>
              <AvatarRing name={member.nama} src={member.avatarUrl} size={compact ? 34 : 40} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-slate-100 truncate text-sm">{member.nicknameML || member.nama}</div>
                <div className="text-[11px] text-slate-500 truncate">{member.roleSquad}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display font-bold text-white leading-none">{total.toLocaleString('id-ID')}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">activity</div>
              </div>
            </div>
          );
          return hrefFor ? (
            <Link key={member.id} href={hrefFor(member)} className="block">{body}</Link>
          ) : (
            <div key={member.id}>{body}</div>
          );
        })}
      </div>
    );
  }

  // Trophy premium CSS/icon (dipakai di sisi kanan leaderboard desktop).
  export function TrophyAward() {
    return (
      <div className="relative flex items-center justify-center py-8">
        <div aria-hidden className="absolute w-40 h-40 rounded-full blur-3xl opacity-40 anim-glow-pulse"
          style={{ background: 'radial-gradient(circle, rgba(245,196,81,0.7), transparent 65%)' }} />
        <div aria-hidden className="absolute bottom-6 w-44 h-44 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.7), transparent 60%)' }} />
        <Trophy className="w-28 h-28 relative trophy-glow" strokeWidth={1.2}
          style={{ color: '#f5c451' }} />
      </div>
    );
  }

  // Pemilih bulan yang mengubah query ?month=YYYY-MM lewat navigasi client.
  export function MonthSelect({ value, options, basePath }) {
    const path = usePathname();
    return (
      <select
        value={value}
        onChange={(e) => {
          const base = basePath || path;
          window.location.href = `${base}?month=${e.target.value}`;
        }}
        className="input !w-auto !py-1.5 !pr-8 text-xs cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>{o.label}</option>
        ))}
      </select>
    );
  }

  // =====================================================================
  //  AppShell: sidebar desktop full-height + bottom nav / drawer mobile
  //  items: [{ href, label, icon, badge? }]
  // =====================================================================
  export function AppShell({ items, footerItems = [], brandSub = 'Activity System', headerRight = null, profile = null, children }) {
    const pathname = usePathname();
    const [drawer, setDrawer] = useState(false);

    const isActive = (href) => pathname === href || (href !== '/member' && href !== '/admin' && pathname.startsWith(href));

    const NavLinks = ({ onNavigate }) => (
      <nav className="space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = isActive(it.href);
          return (
            <Link key={it.href} href={it.href} onClick={onNavigate}
              className={`nav-item ${active ? 'nav-item-active' : ''}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate flex-1">{it.label}</span>
              {it.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">{it.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>
    );

    const Brand = () => (
      <div className="flex items-center gap-2.5 px-1">
        <img src="/logo-icon.png" alt="DynamiTeam" className="w-9 h-9 object-contain shrink-0" />
        <div className="min-w-0">
          <div className="font-display text-lg font-bold leading-none text-white tracking-wide truncate">DynamiTeam</div>
          <div className="text-[10px] text-slate-500 leading-none mt-1 uppercase tracking-widest">{brandSub}</div>
        </div>
      </div>
    );

    const FooterLinks = ({ onNavigate }) => (
      <div className="space-y-1">
        {footerItems.map((it) => {
          const Icon = it.icon;
          if (it.onClick) {
            return (
              <button key={it.label} onClick={() => { onNavigate?.(); it.onClick(); }}
                className={`nav-item w-full text-left ${it.danger ? 'hover:text-rose-400' : ''}`}>
                <Icon className="w-4 h-4 shrink-0" /><span className="truncate">{it.label}</span>
              </button>
            );
          }
          return (
            <Link key={it.label} href={it.href} onClick={onNavigate} className={`nav-item ${isActive(it.href) ? 'nav-item-active' : ''}`}>
              <Icon className="w-4 h-4 shrink-0" /><span className="truncate">{it.label}</span>
            </Link>
          );
        })}
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="nav-item w-full text-left hover:text-rose-400">
          <LogOut className="w-4 h-4 shrink-0" /><span>Logout</span>
        </button>
      </div>
    );

    // Bottom nav mobile: maksimal 5 item utama
    /*const bottomItems = items.slice(0, 5);*/

    return (
      <div className="relative min-h-screen premium-bg bg-grid text-slate-100 font-body">
        <PageBackdrop />

        {/* ===== Sidebar desktop (full height) ===== */}
        <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 sidebar-shell z-30 p-4">
          <div className="mb-6"><Brand /></div>
          <div className="flex-1 overflow-y-auto thin-scroll"><NavLinks /></div>
          <div className="pt-4 mt-4 border-t border-slate-800/70"><FooterLinks /></div>
        </aside>

        {/* ===== Topbar mobile (hamburger di KIRI, ala Roblox) ===== */}
        <header className="lg:hidden sticky top-0 z-30 border-b border-slate-800/70 bg-[#0b0f1c]/85 backdrop-blur">
          <div className="flex items-center justify-between px-3 py-3 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <button onClick={() => setDrawer(true)} className="p-2 -ml-1 rounded-lg text-slate-200 hover:bg-slate-800 active:bg-slate-700 shrink-0" aria-label="Buka menu">
                <Menu className="w-6 h-6" />
              </button>
              <Brand />
            </div>
            {headerRight && <div className="shrink-0">{headerRight}</div>}
          </div>
        </header>

        {/* ===== Drawer mobile ===== */}
        {drawer && (
          <div className="lg:hidden fixed inset-0 z-50 anim-fade" onClick={() => setDrawer(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div onClick={(e) => e.stopPropagation()}
              className="absolute inset-y-0 left-0 w-72 max-w-[80%] sidebar-shell p-4 flex flex-col anim-slide-up">
              <div className="flex items-center justify-between mb-3">
                {profile ? <span className="text-[10px] text-slate-500 uppercase tracking-widest px-1">Menu</span> : <Brand />}
                <button onClick={() => setDrawer(false)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-800" aria-label="Tutup menu"><X className="w-4 h-4" /></button>
              </div>

              {/* Header profil member ala Roblox (hanya muncul untuk member yang punya profil) */}
              {profile && (
                <Link href="/member/profile" onClick={() => setDrawer(false)}
                  className="flex items-center gap-3 p-2.5 mb-3 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-white/[0.04] to-transparent hover:from-white/[0.07] transition-colors">
                  <AvatarRing name={profile.nama} src={profile.avatarUrl} size={50} />
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-white truncate leading-tight">{profile.nama || 'Member'}</div>
                    <div className="text-xs text-amber-400/90 truncate">{profile.roleSquad || (profile.nicknameML ? '@' + profile.nicknameML : 'Member')}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                </Link>
              )}

              <div className="flex-1 overflow-y-auto thin-scroll"><NavLinks onNavigate={() => setDrawer(false)} /></div>
              <div className="pt-4 mt-4 border-t border-slate-800/70"><FooterLinks onNavigate={() => setDrawer(false)} /></div>
            </div>
          </div>
        )}

        {/* ===== Konten ===== */}
        <div className="lg:pl-60">
          {/* header kanan desktop */}
          {headerRight && (
            <div className="hidden lg:flex justify-end items-center gap-2 px-6 lg:px-8 pt-5">
              {headerRight}
            </div>
          )}
          <main className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-8 lg:pb-10 max-w-6xl mx-auto">
            {children}
          </main>
        </div>

        
      </div>
    );
  }

  // Tombol back kecil konsisten.
  export function BackLink({ href, label = 'Kembali' }) {
    return (
      <Link href={href} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-4">
        <ChevronRight className="w-4 h-4 rotate-180" /> {label}
      </Link>
    );
  }
