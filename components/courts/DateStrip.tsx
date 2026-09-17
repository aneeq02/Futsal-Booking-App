'use client';

import { cn } from '@/lib/utils';

interface DateStripProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  days?: number;
}

export function DateStrip({ selectedDate, onSelect, days = 7 }: DateStripProps) {
  const options = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((d) => {
        const value = d.toISOString().slice(0, 10);
        const selected = value === selectedDate;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
              'w-[58px] shrink-0 rounded-[10px] border py-2.5 text-center transition-colors',
              selected ? 'border-primary bg-primary' : 'border-border-card bg-surface hover:border-primary/40'
            )}
          >
            <div
              className={cn(
                'mb-1 text-[10px] font-medium uppercase tracking-wide',
                selected ? 'text-primary-fg/60' : 'text-faint'
              )}
            >
              {d.toLocaleDateString('en-PK', { weekday: 'short' })}
            </div>
            <div className={cn('font-heading text-base font-bold', selected ? 'text-primary-fg' : 'text-fg')}>
              {d.getDate()}
            </div>
          </button>
        );
      })}
    </div>
  );
}
