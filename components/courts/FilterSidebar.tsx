'use client';

import { Check } from 'lucide-react';
import { KARACHI_AREAS } from '@/lib/constants';
import { cn, formatPKR } from '@/lib/utils';

const PRICE_MIN = 1500;
const PRICE_MAX = 6000;
const RATING_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: '4+', value: 4 },
  { label: '4.5+', value: 4.5 },
];

interface FilterSidebarProps {
  areaCounts: Record<string, number>;
  total: number;
  selectedAreas: string[];
  minPrice: number;
  maxPrice: number;
  minRating?: number;
  onToggleArea: (area: string) => void;
  onClearAreas: () => void;
  onSetPrice: (key: 'minPrice' | 'maxPrice', value: number) => void;
  onSetRating: (value: number | undefined) => void;
}

export function FilterSidebar({
  areaCounts,
  total,
  selectedAreas,
  minPrice,
  maxPrice,
  minRating,
  onToggleArea,
  onClearAreas,
  onSetPrice,
  onSetRating,
}: FilterSidebarProps) {
  return (
    <aside className="w-full shrink-0 overflow-y-auto border-border-subtle bg-surface-3 px-5 py-6 sm:w-[264px] sm:border-r dark:bg-bg">
      <div className="mb-5 text-xs text-muted">
        Showing <strong className="text-fg">{total} courts</strong> across Karachi
      </div>

      <div className="mb-7">
        <div className="mb-3.5 font-heading text-xs font-bold uppercase tracking-wide text-fg">Area</div>
        <div className="flex flex-col gap-0.5">
          <AreaCheckbox label="All Areas" count={total} active={selectedAreas.length === 0} onClick={onClearAreas} />
          {KARACHI_AREAS.map((area) => (
            <AreaCheckbox
              key={area}
              label={area}
              count={areaCounts[area] ?? 0}
              active={selectedAreas.includes(area)}
              onClick={() => onToggleArea(area)}
            />
          ))}
        </div>
      </div>

      <div className="mb-7">
        <div className="mb-3.5 font-heading text-xs font-bold uppercase tracking-wide text-fg">Price / Hour</div>
        <div className="mb-2.5 flex justify-between">
          <span className="font-heading text-xs font-semibold text-primary">{formatPKR(minPrice)}</span>
          <span className="font-heading text-xs font-semibold text-primary">{formatPKR(maxPrice)}</span>
        </div>
        <div className="relative flex h-[14px] items-center">
          <div className="absolute h-[3px] w-full rounded-full bg-border" />
          <div
            className="absolute h-[3px] rounded-full bg-primary"
            style={{
              left: `${((minPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
              right: `${100 - ((maxPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
            }}
          />
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={100}
            value={minPrice}
            onChange={(e) => onSetPrice('minPrice', Math.min(Number(e.target.value), maxPrice - 100))}
            className="pointer-events-none absolute h-[14px] w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto"
          />
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={100}
            value={maxPrice}
            onChange={(e) => onSetPrice('maxPrice', Math.max(Number(e.target.value), minPrice + 100))}
            className="pointer-events-none absolute h-[14px] w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto"
          />
        </div>
      </div>

      <div>
        <div className="mb-3.5 font-heading text-xs font-bold uppercase tracking-wide text-fg">Min. Rating</div>
        <div className="flex gap-1.5">
          {RATING_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => onSetRating(opt.value)}
              className={cn(
                'flex-1 rounded-lg border px-2 py-[7px] text-xs transition-colors',
                minRating === opt.value
                  ? 'border-primary/15 bg-primary/[0.08] font-heading font-semibold text-primary'
                  : 'border-border text-muted hover:border-primary/40'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function AreaCheckbox({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-between rounded-lg border px-2.5 py-[9px] text-left transition-colors',
        active ? 'border-primary/15 bg-primary/[0.08]' : 'border-transparent hover:border-border'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[4px] border',
            active ? 'border-none bg-primary' : 'border-[1.5px] border-border bg-transparent'
          )}
        >
          {active && <Check size={9} strokeWidth={3} className="text-primary-fg" />}
        </div>
        <span className={cn('text-[13px]', active ? 'text-primary' : 'text-secondary')}>{label}</span>
      </div>
      <span className="text-[11px] text-faint">{count}</span>
    </button>
  );
}
