import { CourtsNav } from '@/components/layout/CourtsNav';
import { CourtsBrowser } from '@/components/courts/CourtsBrowser';
import { getActiveCourts } from '@/lib/supabase/queries';
import { todayISO } from '@/lib/utils';

export default async function CourtsPage() {
  const courts = await getActiveCourts();
  const today = new Date(`${todayISO()}T00:00:00Z`).toLocaleDateString('en-PK', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Karachi',
  });

  return (
    <div className="flex min-h-screen flex-col">
      <CourtsNav />
      <CourtsBrowser courts={courts} today={today} />
    </div>
  );
}
