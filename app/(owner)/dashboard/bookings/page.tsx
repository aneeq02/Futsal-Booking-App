import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { BookingsTable, type BookingRow } from '@/components/dashboard/BookingsTable';
import { getCurrentProfile } from '@/lib/auth';
import { getOwnerBookings } from '@/lib/supabase/owner-queries';
import type { BookingStatus, PaymentMethod } from '@/types/database.types';

export default async function DashboardBookingsPage() {
  const profile = await getCurrentProfile();
  const bookings = await getOwnerBookings(profile!.id);

  const rows: BookingRow[] = bookings.map((b) => ({
    id: b.id,
    courtName: b.court?.name ?? 'Unknown Court',
    playerName: b.player?.full_name ?? 'Unknown Player',
    phone: b.player?.phone ?? null,
    date: b.slot?.date ?? '',
    startTime: b.slot?.start_time ?? '00:00',
    durationHours: b.duration_hours,
    courtPortion: b.court_portion as 'full' | 'half',
    amount: b.total_amount,
    paymentMethod: b.payment_method as PaymentMethod,
    status: b.status as BookingStatus,
  }));

  return (
    <div>
      <DashboardHeader title="Bookings" subtitle={`All bookings across your courts · ${rows.length} total`} />

      <div className="px-6 py-5 sm:px-8">
        <div className="rounded-xl border border-border-card bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
          <BookingsTable bookings={rows} />
        </div>
      </div>
    </div>
  );
}
