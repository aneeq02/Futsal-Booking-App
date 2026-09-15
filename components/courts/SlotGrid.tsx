'use client';

import { cn, formatPKR, formatTime } from '@/lib/utils';
import type { TimeSlot } from '@/types/database.types';

interface SlotGridProps {
  slots: TimeSlot[];
  selectedSlotId: string | null;
  onSelect: (slot: TimeSlot) => void;
  pricePerHour: number;
}

function isMorning(startTime: string) {
  return parseInt(startTime.split(':')[0], 10) < 17;
}

export function SlotGrid({ slots, selectedSlotId, onSelect, pricePerHour }: SlotGridProps) {
  const morning = slots.filter((s) => isMorning(s.start_time));
  const evening = slots.filter((s) => !isMorning(s.start_time));

  if (slots.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No slots for this date yet.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 text-[11px]">
        <LegendDot className="bg-primary" label="Selected" />
        <LegendDot className="border border-border bg-surface" label="Open" />
        <LegendDot className="bg-surface-3 opacity-50" label="Booked" />
      </div>

      <div className="space-y-4">
        {morning.length > 0 && (
          <SlotGroup label="Morning" slots={morning} selectedSlotId={selectedSlotId} onSelect={onSelect} pricePerHour={pricePerHour} />
        )}
        {evening.length > 0 && (
          <SlotGroup label="Evening" slots={evening} selectedSlotId={selectedSlotId} onSelect={onSelect} pricePerHour={pricePerHour} />
        )}
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('h-2.5 w-2.5 rounded-[3px]', className)} />
      <span className="text-muted">{label}</span>
    </div>
  );
}

function SlotGroup({
  label,
  slots,
  selectedSlotId,
  onSelect,
  pricePerHour,
}: {
  label: string;
  slots: TimeSlot[];
  selectedSlotId: string | null;
  onSelect: (slot: TimeSlot) => void;
  pricePerHour: number;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {slots.map((slot) => {
          const disabled = slot.status !== 'available';
          const selected = slot.id === selectedSlotId;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(slot)}
              className={cn(
                'rounded-[9px] border py-[11px] text-center transition-colors',
                disabled && 'cursor-not-allowed border-border-subtle bg-surface-3 opacity-40',
                !disabled && !selected && 'border-border bg-surface hover:border-primary/40',
                selected && 'border-2 border-primary bg-primary/[0.08]'
              )}
            >
              <div className={cn('text-[13px]', selected ? 'font-bold text-primary' : disabled ? 'text-faint' : 'font-medium text-fg')}>
                {formatTime(slot.start_time)}
              </div>
              <div className={cn('mt-0.5 text-[10px]', disabled ? 'text-border' : selected ? 'text-mint' : 'text-muted')}>
                {disabled ? 'Booked' : formatPKR(pricePerHour)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
