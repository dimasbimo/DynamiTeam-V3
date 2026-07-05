'use client';

import Link from 'next/link';
import { LayoutDashboard, Activity, Trophy, Settings, User } from 'lucide-react';
import { AppShell } from './ui';

const ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/activity', label: 'Activity Bulanan', icon: Activity, badge: 'Baru' },
  { href: '/admin/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
];

export default function AdminShell({ children }) {
  const headerRight = (
    <Link href="/member" className="inline-flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/[0.06]">
      <User className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard Member Saya</span>
    </Link>
  );
  return (
    <AppShell items={ITEMS} brandSub="Admin Panel" headerRight={headerRight}>
      {children}
    </AppShell>
  );
}
