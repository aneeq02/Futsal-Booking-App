'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn, formatPKR } from '@/lib/utils';
import type { CourtWithPrimaryPhoto } from '@/lib/supabase/queries';

interface Props {
  courts: (CourtWithPrimaryPhoto & { availableSlots: number; totalSlots: number })[];
}

export function FillingUpFast({ courts: initialCourts }: Props) {
  const [courts, setCourts] = useState(initialCourts);

  useEffect(() => {
    if (initialCourts.length === 0) return;

    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    const courtIds = initialCourts.map((c) => c.id);

    const channel = supabase
      .channel('filling-up-fast')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'time_slots', filter: `date=eq.${today}` },
        (payload) => {
          const updated = payload.new as { court_id: string; status: string };
          if (!courtIds.includes(updated.court_id)) return;

          setCourts((prev) =>
            prev.map((court) => {
              if (court.id !== updated.court_id) return court;
              const wasAvailable = payload.old && (payload.old as { status: string }).status === 'available';
              const isAvailable = updated.status === 'available';
              let delta = 0;
              if (wasAvailable && !isAvailable) delta = -1;
              if (!wasAvailable && isAvailable) delta = 1;
              return { ...court, availableSlots: Math.max(0, court.availableSlots + delta) };
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (courts.length === 0) return null;

  return (
    <section className="border-t border-border-subtle px-6 py-14 sm:px-10 lg:px-20">
      <div className="mb-7 flex items-end justify-between">
        <div>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-primary">Live Tonight</div>
          <h2 className="font-heading text-[28px] font-bold tracking-[-0.5px] text-fg">
            Filling up fast in Karachi
          </h2>
        </div>
        <Link href="/courts" className="flex items-center gap-1 pb-1 text-[13px] text-primary no-underline">
          View all courts
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {courts.map((court, i) => {
          const dotClass = i === 0 ? 'bg-primary shadow-[0_0_8px_#22C55E]' : i === 1 ? 'bg-mint shadow-[0_0_6px_#4ADE80]' : 'bg-mint-pale';
          const dotBg = i === 0 ? 'bg-primary/10' : 'bg-primary/[0.07]';

          return (
            <Link
              key={court.id}
              href={`/courts/${court.id}`}
              className="flex items-center gap-4 rounded-2xl border border-border-card bg-surface p-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:shadow-none"
            >
              <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px]', dotBg)}>
                <span className={cn('h-2 w-2 rounded-full', dotClass)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 truncate font-heading text-sm font-semibold text-fg">{court.name}</div>
                <div className="truncate text-xs text-muted">
                  {court.availableSlots} slot{court.availableSlots === 1 ? '' : 's'} left tonight
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-heading text-[13px] font-bold text-primary">{formatPKR(court.price_per_hour)}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
