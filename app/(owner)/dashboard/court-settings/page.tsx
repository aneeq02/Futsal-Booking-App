import Link from 'next/link';
import dynamic from 'next/dynamic';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CourtSettingsForm } from '@/components/dashboard/CourtSettingsForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { getCurrentProfile } from '@/lib/auth';
import { getOwnerCourts } from '@/lib/supabase/owner-queries';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';

const CourtPhotoManager = dynamic(() => import('@/components/dashboard/CourtPhotoManager').then((m) => m.CourtPhotoManager), {
  loading: () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-xl" />
      ))}
    </div>
  ),
});

const SlotManager = dynamic(() => import('@/components/dashboard/SlotManager').then((m) => m.SlotManager), {
  loading: () => (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-[52px] rounded-xl" />
      ))}
    </div>
  ),
});

export default async function CourtSettingsPage({ searchParams }: { searchParams: { courtId?: string } }) {
  const profile = await getCurrentProfile();
  const courts = await getOwnerCourts(profile!.id);

  const activeCourtId = searchParams.courtId ?? courts[0]?.id;
  const activeCourt = courts.find((c) => c.id === activeCourtId) ?? null;

  let photos: Awaited<ReturnType<typeof getPhotos>> = [];
  if (activeCourt) {
    photos = await getPhotos(activeCourt.id);
  }

  return (
    <div>
      <DashboardHeader title="Court Settings" subtitle="Manage your listed courts, photos, and slot availability" />

      <div className="flex flex-col gap-5 px-6 py-5 sm:px-8">
        {courts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {courts.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/court-settings?courtId=${c.id}`}
                className={cn(
                  'rounded-full border px-4 py-1.5 font-heading text-[13px] font-medium transition-colors',
                  c.id === activeCourtId ? 'border-primary bg-primary text-primary-fg' : 'border-border text-muted hover:border-primary/50'
                )}
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/dashboard/court-settings?courtId=new"
              className={cn(
                'rounded-full border border-dashed px-4 py-1.5 text-[13px] font-medium text-muted hover:border-primary/50 hover:text-primary',
                activeCourtId === 'new' && 'border-primary text-primary'
              )}
            >
              + Add Court
            </Link>
          </div>
        )}

        <div className="rounded-xl border border-border-card bg-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
          <h2 className="mb-4 font-heading text-sm font-bold text-fg">{activeCourt ? 'Court Details' : 'Add a New Court'}</h2>
          <CourtSettingsForm ownerId={profile!.id} court={activeCourt} />
        </div>

        {activeCourt && (
          <>
            <div className="rounded-xl border border-border-card bg-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
              <h2 className="mb-4 font-heading text-sm font-bold text-fg">Photos</h2>
              <CourtPhotoManager courtId={activeCourt.id} initialPhotos={photos} />
            </div>

            <div className="rounded-xl border border-border-card bg-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
              <h2 className="mb-4 font-heading text-sm font-bold text-fg">Slot Availability</h2>
              <SlotManager courtId={activeCourt.id} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

async function getPhotos(courtId: string) {
  const supabase = createClient();
  const { data } = await supabase.from('court_photos').select('*').eq('court_id', courtId).order('is_primary', { ascending: false });
  return data ?? [];
}
