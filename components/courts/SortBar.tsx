'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: '', label: 'Recommended' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'nearest', label: 'Nearest' },
];

export function SortBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('sort', value);
    else params.delete('sort');
    params.delete('page');
    startTransition(() => {
      router.push(`/courts?${params.toString()}`);
    });
  }

  return (
    <div className={cn('flex items-center gap-2 transition-opacity', isPending && 'opacity-60')}>
      <span className="text-xs text-faint">Sort:</span>
      <select
        defaultValue={searchParams.get('sort') ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        className="cursor-pointer rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-secondary outline-none"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
