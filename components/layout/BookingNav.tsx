import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export function BookingNav({ courtName }: { courtName: string }) {
  return (
    <nav className="flex h-[60px] items-center justify-between border-b border-border/50 bg-surface px-6 dark:bg-bg sm:px-10 lg:px-14">
      <Logo size="sm" />

      <div className="hidden items-center gap-[7px] text-[13px] sm:flex">
        <Link href="/courts" className="text-faint no-underline">
          Courts
        </Link>
        <ChevronRight size={12} className="text-faint" />
        <span className="text-muted">{courtName}</span>
        <ChevronRight size={12} className="text-faint" />
        <span className="font-medium text-fg">Book a slot</span>
      </div>

      <ThemeToggle />
    </nav>
  );
}
