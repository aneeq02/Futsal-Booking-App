'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/courts?${params.toString()}`);
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex items-center justify-center gap-1.5">
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => goTo(page)}
          className={cn(
            'h-8 w-8 rounded-lg text-[13px] transition-colors',
            page === currentPage
              ? 'bg-primary font-heading font-bold text-primary-fg'
              : 'border border-border text-muted hover:border-primary/40'
          )}
        >
          {page}
        </button>
      ))}
    </div>
  );
}
