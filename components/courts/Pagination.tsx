'use client';

import { cn } from '@/lib/utils';

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex items-center justify-center gap-1.5">
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
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
