import { Badge } from '@/components/ui/Badge';
import { formatDateLabel, formatPKR, formatTime, addHours } from '@/lib/utils';
import type { BookingStatus, PaymentMethod } from '@/types/database.types';

export interface BookingRow {
  id: string;
  courtName: string;
  playerName: string;
  phone: string | null;
  date: string;
  startTime: string;
  durationHours: number;
  courtPortion: 'full' | 'half';
  amount: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
}

const statusTone: Record<BookingStatus, 'green' | 'yellow' | 'red'> = {
  confirmed: 'green',
  pending: 'yellow',
  cancelled: 'red',
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  jazzcash: 'JazzCash',
  easypaisa: 'Easypaisa',
  cash: 'Cash',
};

const AVATAR_GRADIENTS = [
  ['#1A4A2E', '#0A2218', '#4ADE80'],
  ['#1A1A3E', '#0A0A20', '#818CF8'],
  ['#2E1A0A', '#180A03', '#FB923C'],
  ['#1A1A1A', '#0A0A0A', '#94A3B8'],
] as const;

export function BookingsTable({ bookings }: { bookings: BookingRow[] }) {
  if (bookings.length === 0) {
    return <p className="py-8 text-center text-sm text-muted">No bookings yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-surface-3">
            <Th>Player</Th>
            <Th>Court</Th>
            <Th>Slot</Th>
            <Th>Amount</Th>
            <Th>Payment</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, i) => {
            const [bg1, bg2, ink] = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
            const initials = b.playerName
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();
            const endTime = addHours(b.startTime, b.durationHours);

            return (
              <tr key={b.id} className="border-t border-border-subtle">
                <td className="py-[11px] pl-5 pr-3">
                  <div className="flex items-center gap-[9px]">
                    <span
                      className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full font-heading text-[9px] font-bold"
                      style={{ background: `linear-gradient(135deg, ${bg1}, ${bg2})`, color: ink }}
                    >
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-fg">{b.playerName}</div>
                      {b.phone && <div className="truncate text-[10px] text-faint">{b.phone}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-[11px] text-xs text-fg">{b.courtName}</td>
                <td className="px-3 py-[11px] text-xs text-secondary">
                  {formatDateLabel(b.date)} · {formatTime(b.startTime)}–{formatTime(endTime)}
                  {b.courtPortion === 'half' && <span className="ml-1.5 text-[10px] text-faint">(half court)</span>}
                </td>
                <td className="px-3 py-[11px] font-heading text-[13px] font-semibold text-fg">{formatPKR(b.amount)}</td>
                <td className="px-3 py-[11px] text-xs text-muted">{PAYMENT_LABELS[b.paymentMethod]}</td>
                <td className="px-3 py-[11px]">
                  <Badge tone={statusTone[b.status]}>{b.status}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-[9px] text-[10px] font-bold uppercase tracking-wide text-muted first:pl-5">{children}</th>
  );
}
