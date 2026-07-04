'use client';

import Link from 'next/link';
import { LayoutDashboard, Activity, Trophy, User, History, Settings, LayoutGrid } from 'lucide-react';
import { AppShell } from './ui';

const ITEMS = [
  { href: '/member', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/member/aktivitas', label: 'Aktivitas Saya', icon: Activity },
  { href: '/member/leaderboard', label: 'Leaderboard', icon: Trophy, badge: 'Baru' },
  { href: '/member/profile', label: 'Profile', icon: User, badge: 'Baru' },
  { href: '/member/riwayat', label: 'Riwayat Mingguan', icon: History },
  { href: '/member/settings', label: 'Pengaturan', icon: Settings },
];

export default function MemberShell({ isAdmin = false, children }) {
  const headerRight = isAdmin ? (
    <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.06]">
      <LayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard Admin</span>
    </Link>
  ) : null;

  return (
    <AppShell items={ITEMS} brandSub="Activity System" headerRight={headerRight}>
      {children}
    </AppShell>
  );
}
