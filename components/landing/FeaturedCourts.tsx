'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CourtCard } from '@/components/courts/CourtCard';
import { cn } from '@/lib/utils';
import type { CourtWithPrimaryPhoto } from '@/lib/supabase/queries';

const FILTERS = ['All', 'DHA', 'Gulshan', 'Clifton'] as const;

export function FeaturedCourts({ courts }: { courts: CourtWithPrimaryPhoto[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');

  const filtered =
    filter === 'All' ? courts : courts.filter((c) => c.area.toLowerCase().includes(filter.toLowerCase()));

  return (
    <section className="px-6 py-14 sm:px-10 lg:px-20">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">Verified courts</div>
          <h2 className="font-heading text-[28px] font-bold tracking-[-0.5px] text-fg">Courts near you</h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg border px-4 py-[7px] font-heading text-[13px] transition-colors',
                filter === f
                  ? 'border-primary bg-primary font-semibold text-primary-fg'
                  : 'border-border text-muted hover:border-primary/40'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">No courts in this area yet.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((court, i) => (
            <CourtCard key={court.id} court={court} primaryPhoto={court.primaryPhoto} seed={i} priority={i < 3} />
          ))}
        </div>
      )}

      <div className="mt-8 text-center sm:hidden">
        <Link href="/courts" className="text-sm font-medium text-primary">
          View all courts
        </Link>
      </div>
    </section>
  );
}
