'use client';

import { addDays, cn, todayISO } from '@/lib/utils';

interface DateStripProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  days?: number;
}

export function DateStrip({ selectedDate, onSelect, days = 7 }: DateStripProps) {
  const today = todayISO();
  const options = Array.from({ length: days }, (_, i) => addDays(today, i));

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((value) => {
        const selected = value === selectedDate;
        // value is always a plain "YYYY-MM-DD" from addDays()/todayISO(),
        // so the day-of-month is read straight off the string and the
        // weekday is formatted against Asia/Karachi explicitly — neither
        // depends on the browser's own timezone the way `new Date(...).
        // getDate()` would.
        const [y, m, d] = value.split('-').map(Number);
        const weekday = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-PK', {
          weekday: 'short',
          timeZone: 'Asia/Karachi',
        });
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
              {weekday}
            </div>
            <div className={cn('font-heading text-base font-bold', selected ? 'text-primary-fg' : 'text-fg')}>{d}</div>
          </button>
        );
      })}
    </div>
  );
}
