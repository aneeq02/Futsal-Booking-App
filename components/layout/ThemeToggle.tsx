'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className, fullWidth = false }: { className?: string; fullWidth?: boolean }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        'flex items-center gap-[6px] rounded-full border border-border bg-surface-2 px-[13px] py-[6px] transition-colors',
        fullWidth && 'w-full justify-center',
        className
      )}
    >
      {isDark ? <Moon size={14} className="text-secondary" /> : <Sun size={14} className="text-muted" />}
      <span className="text-xs font-medium text-secondary">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
