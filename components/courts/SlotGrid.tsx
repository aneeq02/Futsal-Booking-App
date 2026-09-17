'use client';

import { cn, formatPKR, formatTime } from '@/lib/utils';
import type { TimeSlot } from '@/types/database.types';

interface SlotGridProps {
  slots: TimeSlot[];
  selectedSlots: TimeSlot[];
  onToggle: (slot: TimeSlot) => void;
  pricePerHour: number;
}

function isMorning(startTime: string) {
  return parseInt(startTime.split(':')[0], 10) < 17;
}

export function SlotGrid({ slots, selectedSlots, onToggle, pricePerHour }: SlotGridProps) {
  const morning = slots.filter((s) => isMorning(s.start_time));
  const evening = slots.filter((s) => !isMorning(s.start_time));

  if (slots.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No open slots for this date.</p>;
  }

  return (
    <div className="space-y-4">
      {morning.length > 0 && (
        <SlotGroup label="Morning" slots={morning} selectedSlots={selectedSlots} onToggle={onToggle} pricePerHour={pricePerHour} />
      )}
      {evening.length > 0 && (
        <SlotGroup label="Evening" slots={evening} selectedSlots={selectedSlots} onToggle={onToggle} pricePerHour={pricePerHour} />
      )}
    </div>
  );
}

function SlotGroup({
  label,
  slots,
  selectedSlots,
  onToggle,
  pricePerHour,
}: {
  label: string;
  slots: TimeSlot[];
  selectedSlots: TimeSlot[];
  onToggle: (slot: TimeSlot) => void;
  pricePerHour: number;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {slots.map((slot) => {
          const selected = selectedSlots.some((s) => s.id === slot.id);
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onToggle(slot)}
              className={cn(
                'rounded-[9px] border py-[11px] text-center transition-colors',
                !selected && 'border-border bg-surface hover:border-primary/40',
                selected && 'border-2 border-primary bg-primary/[0.08]'
              )}
            >
              <div className={cn('text-[13px]', selected ? 'font-bold text-primary' : 'font-medium text-fg')}>
                {formatTime(slot.start_time)}
              </div>
              <div className={cn('mt-0.5 text-[10px]', selected ? 'text-mint' : 'text-muted')}>{formatPKR(pricePerHour)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
