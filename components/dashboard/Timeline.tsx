import { formatPKR, formatTime } from '@/lib/utils';
import type { TimelineSlot } from '@/lib/supabase/owner-queries';
import { cn } from '@/lib/utils';

const PAYMENT_LABELS: Record<string, string> = {
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
  cash: 'Cash',
};

export function Timeline({ entries }: { entries: TimelineSlot[] }) {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">Nothing scheduled today yet.</p>;
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      {entries.slice(0, 6).map((entry) => (
        <div key={entry.id} className="flex items-center gap-2">
          <div className="w-8 shrink-0 text-right text-[10px] font-semibold text-muted">
            {formatTime(entry.startTime).replace(':00 ', ' ')}
          </div>
          <div
            className={cn(
              'h-[38px] w-[3px] shrink-0 rounded-sm',
              entry.status === 'live' && 'bg-primary shadow-[0_0_5px_rgba(34,197,94,0.4)]',
              entry.status === 'booked' && 'bg-primary',
              entry.status === 'pending' && 'bg-gold',
              entry.status === 'open' && 'bg-border-card'
            )}
          />
          <div
            className={cn(
              'flex-1 rounded-lg border px-[9px] py-[7px]',
              entry.status === 'live' && 'border-primary/15 bg-primary/[0.07]',
              entry.status === 'booked' && 'border-border-card bg-surface-2',
              entry.status === 'pending' && 'border-gold/15 bg-gold/[0.05]',
              entry.status === 'open' && 'border-dashed border-border-card bg-surface-3'
            )}
          >
            {entry.status === 'open' ? (
              <div className="text-[10px] text-faint">
                Open slot · {formatPKR(entry.price)}
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    'mb-px text-[11px] font-semibold',
                    entry.status === 'live' && 'text-primary',
                    entry.status === 'booked' && 'text-secondary',
                    entry.status === 'pending' && 'text-gold'
                  )}
                >
                  {entry.status === 'live' ? 'LIVE NOW' : entry.status === 'pending' ? 'Pending' : 'Booked'}
                </div>
                <div className="text-[10px] text-muted">
                  {entry.playerName ?? 'Player'}
                  {entry.paymentMethod &&
                    ` · ${PAYMENT_LABELS[entry.paymentMethod] ?? entry.paymentMethod}${entry.status === 'live' ? ' ✓' : ''}`}
                  {entry.status === 'pending' && ' · confirm needed'}
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
