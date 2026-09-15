import { DollarSign, CalendarCheck, Gauge, Clock } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatCard, StatDelta } from '@/components/dashboard/StatCard';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { Timeline } from '@/components/dashboard/Timeline';
import { BookingsTable, type BookingRow } from '@/components/dashboard/BookingsTable';
import { getCurrentProfile } from '@/lib/auth';
import { getOwnerStats, getUpcomingToday, getWeeklyBookingCounts, getOwnerBookings } from '@/lib/supabase/owner-queries';
import { formatPKR } from '@/lib/utils';
import type { BookingStatus, PaymentMethod } from '@/types/database.types';

export default async function DashboardOverviewPage() {
  const profile = await getCurrentProfile();
  const ownerId = profile!.id;

  const [stats, upcoming, weekly, bookings] = await Promise.all([
    getOwnerStats(ownerId),
    getUpcomingToday(ownerId),
    getWeeklyBookingCounts(ownerId),
    getOwnerBookings(ownerId),
  ]);

  const recentBookings: BookingRow[] = bookings.slice(0, 8).map((b) => ({
    id: b.id,
    courtName: b.court?.name ?? 'Unknown Court',
    playerName: b.player?.full_name ?? 'Unknown Player',
    phone: b.player?.phone ?? null,
    date: b.slot?.date ?? '',
    startTime: b.slot?.start_time ?? '00:00',
    durationHours: b.duration_hours,
    amount: b.total_amount,
    paymentMethod: b.payment_method as PaymentMethod,
    status: b.status as BookingStatus,
  }));

  const today = new Date().toLocaleDateString('en-PK', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div>
      <DashboardHeader
        title="Overview"
        subtitle={`${today} · ${stats.pendingRequests} pending request${stats.pendingRequests === 1 ? '' : 's'}`}
      />

      <div className="flex flex-col gap-[18px] px-6 py-5 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Today's Revenue"
            value={formatPKR(stats.todayRevenue)}
            icon={DollarSign}
            tone="primary"
            footer={<StatDelta value="Confirmed bookings today" />}
          />
          <StatCard
            label="Bookings Today"
            value={String(stats.bookingsToday)}
            suffix={`/ ${stats.bookingsToday + stats.pendingRequests}`}
            icon={CalendarCheck}
            footer={<p className="text-[11px] text-muted">{stats.pendingRequests} still pending</p>}
          />
          <StatCard label="Occupancy Rate" value={`${stats.occupancyPct}%`} icon={Gauge} progress={stats.occupancyPct} />
          <StatCard
            label="Pending Requests"
            value={String(stats.pendingRequests)}
            icon={Clock}
            tone="gold"
            footer={<p className="text-[11px] text-gold">{stats.pendingRequests > 0 ? 'Action needed' : 'All clear'}</p>}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-border-card bg-surface p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
            <div className="mb-3.5">
              <div className="font-heading text-sm font-bold text-fg">Weekly Bookings</div>
              <div className="mt-px text-[11px] text-faint">Last 7 days</div>
            </div>
            <WeeklyChart data={weekly} />
          </div>

          <div className="flex flex-col rounded-xl border border-border-card bg-surface p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
            <div className="font-heading text-sm font-bold text-fg">Upcoming Today</div>
            <div className="mb-3.5 mt-px text-[11px] text-faint">{upcoming.filter((u) => u.status === 'live').length} live now</div>
            <Timeline entries={upcoming} />
          </div>
        </div>

        <div className="rounded-xl border border-border-card bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="flex items-center justify-between border-b border-border-card px-5 py-3.5">
            <div className="font-heading text-sm font-bold text-fg">Recent Bookings</div>
            <a href="/dashboard/bookings" className="text-xs font-medium text-primary no-underline">
              View all →
            </a>
          </div>
          <BookingsTable bookings={recentBookings} />
        </div>
      </div>
    </div>
  );
}
