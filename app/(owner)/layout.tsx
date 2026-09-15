import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { getCurrentProfile } from '@/lib/auth';
import { getOwnerCourts, getOwnerStats } from '@/lib/supabase/owner-queries';

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) redirect('/login?redirect=/dashboard');
  if (profile.role !== 'owner') redirect('/');

  const [courts, stats] = await Promise.all([getOwnerCourts(profile.id), getOwnerStats(profile.id)]);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar profile={profile} primaryCourt={courts[0] ?? null} pendingCount={stats.pendingRequests} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
