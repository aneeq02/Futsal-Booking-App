import { redirect, notFound } from 'next/navigation';
import { BookingNav } from '@/components/layout/BookingNav';
import { StepIndicator } from '@/components/courts/StepIndicator';
import { BookingFlow } from '@/components/courts/BookingFlow';
import { getCurrentProfile } from '@/lib/auth';
import { getCourtById } from '@/lib/supabase/queries';

export default async function BookCourtPage({ params }: { params: { id: string } }) {
  const [court, profile] = await Promise.all([getCourtById(params.id), getCurrentProfile()]);

  if (!court) notFound();
  if (!profile) redirect(`/login?redirect=/courts/${params.id}/book`);

  return (
    <div className="flex min-h-screen flex-col">
      <BookingNav courtName={court.name} />
      <StepIndicator current={2} />
      <BookingFlow court={court} primaryPhoto={court.primaryPhoto} profile={profile} />
    </div>
  );
}
