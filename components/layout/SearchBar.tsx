'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set('q', value.trim());
    else params.delete('q');
    router.push(`/courts?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex items-center gap-2 rounded-[10px] border border-border bg-surface-2 py-1 pl-3.5 pr-1',
        className
      )}
    >
      <Search size={14} className="shrink-0 text-faint" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search courts..."
        className="w-full min-w-0 bg-transparent px-2 py-1.5 text-[13px] text-fg placeholder:text-faint focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 whitespace-nowrap rounded-[7px] bg-primary px-4 py-[7px] font-heading text-xs font-bold text-primary-fg"
      >
        Search
      </button>
    </form>
  );
}
