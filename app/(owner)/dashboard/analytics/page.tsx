import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { StatCard } from '@/components/dashboard/StatCard';
import { getCurrentProfile } from '@/lib/auth';
import { getWeeklyBookingCounts, getOwnerBookings } from '@/lib/supabase/owner-queries';
import { formatPKR } from '@/lib/utils';
import { TrendingUp, DollarSign, Percent } from 'lucide-react';

export default async function DashboardAnalyticsPage() {
  const profile = await getCurrentProfile();
  const [weekly, bookings] = await Promise.all([
    getWeeklyBookingCounts(profile!.id),
    getOwnerBookings(profile!.id),
  ]);

  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const totalRevenue = confirmed.reduce((sum, b) => sum + Number(b.total_amount), 0);
  const cashBookings = confirmed.filter((b) => b.payment_status === 'pending').length;
  const cashSharePct = confirmed.length > 0 ? Math.round((cashBookings / confirmed.length) * 100) : 0;

  return (
    <div>
      <DashboardHeader title="Analytics" subtitle="Performance across all of your courts" />

      <div className="flex flex-col gap-[18px] px-6 py-5 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Revenue" value={formatPKR(totalRevenue)} icon={DollarSign} tone="primary" />
          <StatCard label="Confirmed Bookings" value={String(confirmed.length)} icon={TrendingUp} />
          <StatCard label="Pending Cash Payments" value={`${cashSharePct}%`} icon={Percent} tone="gold" />
        </div>

        <div className="rounded-xl border border-border-card bg-surface p-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="mb-3.5 font-heading text-sm font-bold text-fg">Bookings — Last 7 Days</div>
          <WeeklyChart data={weekly} />
        </div>
      </div>
    </div>
  );
}
