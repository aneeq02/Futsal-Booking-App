'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutGrid, CalendarCheck, TrendingUp, Settings, Camera } from 'lucide-react';
import { cn, getCourtPhotoUrl } from '@/lib/utils';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import type { Court, CourtPhoto, Profile } from '@/types/database.types';

interface SidebarProps {
  profile: Profile;
  primaryCourt: (Court & { primaryPhoto: CourtPhoto | null }) | null;
  pendingCount: number;
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { href: '/dashboard/bookings', label: 'Bookings', icon: CalendarCheck, badgeKey: 'pending' as const },
  { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/dashboard/court-settings', label: 'Court Settings', icon: Settings },
];

export function Sidebar({ profile, primaryCourt, pendingCount }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const initials = profile.full_name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col overflow-y-auto border-r border-border-card bg-surface">
      <div className="px-5 pt-5">
        <Logo size="sm" />

        {primaryCourt && (
          <Link
            href="/dashboard/court-settings"
            className="mt-5 block rounded-[10px] border border-primary/15 bg-primary/[0.06] p-3"
          >
            <div className="relative mb-2 h-9 w-9 overflow-hidden rounded-lg bg-gradient-to-br from-[#0A2218] to-[#030A06]">
              {primaryCourt.primaryPhoto ? (
                <Image
                  src={getCourtPhotoUrl(primaryCourt.primaryPhoto.storage_path)}
                  alt=""
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <Camera className="absolute inset-0 m-auto text-white/50" size={14} />
              )}
            </div>
            <div className="truncate font-heading text-xs font-bold text-fg">{primaryCourt.name}</div>
            <div className="text-[10px] font-medium text-primary">
              {primaryCourt.is_active ? 'Active' : 'Inactive'} · {primaryCourt.area}
            </div>
          </Link>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const badge = item.badgeKey === 'pending' && pendingCount > 0 ? pendingCount : null;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-[13px] transition-colors',
                active ? 'bg-primary/10 font-semibold text-primary' : 'text-muted hover:text-fg'
              )}
            >
              <Icon size={16} />
              {item.label}
              {badge !== null && (
                <span className="ml-auto rounded-[5px] bg-primary px-[6px] py-px font-heading text-[10px] font-bold text-primary-fg">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-card p-3">
        <ThemeToggle fullWidth className="mb-2.5 !justify-center" />
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2.5 px-0.5 py-1 text-left disabled:opacity-50"
        >
          <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#15803D] font-heading text-[11px] font-extrabold text-primary-fg">
            {initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold text-fg">{profile.full_name}</span>
            <span className="block text-[10px] text-primary">{loggingOut ? 'Logging out…' : 'Court Owner'}</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
