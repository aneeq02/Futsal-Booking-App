import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { getCurrentProfile } from '@/lib/auth';
import { getOwnerBookings } from '@/lib/supabase/owner-queries';

export default async function DashboardPlayersPage() {
  const profile = await getCurrentProfile();
  const bookings = await getOwnerBookings(profile!.id);

  const players = new Map<string, { name: string; phone: string | null; bookingCount: number }>();
  for (const b of bookings) {
    if (!b.player) continue;
    const key = b.player.full_name + (b.player.phone ?? '');
    const existing = players.get(key);
    if (existing) existing.bookingCount += 1;
    else players.set(key, { name: b.player.full_name, phone: b.player.phone, bookingCount: 1 });
  }

  const rows = Array.from(players.values()).sort((a, b) => b.bookingCount - a.bookingCount);

  return (
    <div>
      <DashboardHeader title="Players" subtitle={`${rows.length} player${rows.length === 1 ? '' : 's'} have booked your courts`} />

      <div className="px-6 py-5 sm:px-8">
        <div className="rounded-xl border border-border-card bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No players yet.</p>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-3">
                  <th className="py-[9px] pl-5 pr-3 text-[10px] font-bold uppercase tracking-wide text-muted">Name</th>
                  <th className="px-3 py-[9px] text-[10px] font-bold uppercase tracking-wide text-muted">Phone</th>
                  <th className="px-3 py-[9px] text-[10px] font-bold uppercase tracking-wide text-muted">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.name + p.phone} className="border-t border-border-subtle">
                    <td className="py-[11px] pl-5 pr-3 text-xs font-medium text-fg">{p.name}</td>
                    <td className="px-3 py-[11px] text-xs text-muted">{p.phone ?? '—'}</td>
                    <td className="px-3 py-[11px] font-heading text-[13px] font-semibold text-fg">{p.bookingCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
