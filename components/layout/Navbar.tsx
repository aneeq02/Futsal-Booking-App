import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { NavAuth } from '@/components/layout/NavAuth';

export async function Navbar() {
  const profile = await getCurrentProfile();

  return (
    <nav className="sticky top-0 z-40 flex h-[68px] items-center justify-between border-b border-border/60 bg-bg/95 px-6 backdrop-blur-md sm:px-10 lg:px-20">
      <Logo />

      <div className="hidden items-center gap-8 md:flex">
        <Link href="/courts" className="text-sm font-medium text-muted hover:text-fg">
          Courts
        </Link>
        <Link href="/#how-it-works" className="text-sm font-medium text-muted hover:text-fg">
          How It Works
        </Link>
        {profile?.role === 'owner' && (
          <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-fg">
            For Owners
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        <NavAuth profile={profile} />
      </div>
    </nav>
  );
}
