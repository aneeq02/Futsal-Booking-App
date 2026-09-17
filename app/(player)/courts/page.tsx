import { CourtsNav } from '@/components/layout/CourtsNav';
import { CourtsBrowser } from '@/components/courts/CourtsBrowser';
import { getActiveCourts } from '@/lib/supabase/queries';

export default async function CourtsPage() {
  const courts = await getActiveCourts();
  const today = new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });

  return (
    <div className="flex min-h-screen flex-col">
      <CourtsNav />
      <CourtsBrowser courts={courts} today={today} />
    </div>
  );
}
