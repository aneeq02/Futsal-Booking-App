'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const OPTIONS = [
  { value: '', label: 'Recommended' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'nearest', label: 'Nearest' },
];

export function SortBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set('sort', value);
    else params.delete('sort');
    params.delete('page');
    router.push(`/courts?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
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
