import { getCurrentProfile } from '@/lib/auth';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { NavAuth } from '@/components/layout/NavAuth';
import { SearchBar } from '@/components/layout/SearchBar';

export async function CourtsNav() {
  const profile = await getCurrentProfile();

  return (
    <nav className="flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-surface px-6 dark:bg-bg sm:px-10 lg:px-14">
      <Logo size="sm" />
      <SearchBar className="hidden max-w-[420px] flex-1 md:block" />
      <div className="flex shrink-0 items-center gap-2.5">
        <ThemeToggle />
        <NavAuth profile={profile} />
      </div>
    </nav>
  );
}
