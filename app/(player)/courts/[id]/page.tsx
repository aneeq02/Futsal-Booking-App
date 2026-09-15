import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, Users, Layers, Star } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PhotoPlaceholder } from '@/components/courts/PhotoPlaceholder';
import { ButtonLink } from '@/components/ui/Button';
import { getCourtById } from '@/lib/supabase/queries';
import { formatPKR, getCourtPhotoUrl } from '@/lib/utils';

const SURFACE_LABELS: Record<string, string> = {
  artificial_turf: 'Artificial Turf',
  wooden: 'Wooden',
  concrete: 'Concrete',
  rubber: 'Rubber',
};

export default async function CourtDetailPage({ params }: { params: { id: string } }) {
  const court = await getCourtById(params.id);
  if (!court) notFound();

  const photoUrl = court.primaryPhoto ? getCourtPhotoUrl(court.primaryPhoto.storage_path) : null;

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
        <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-96">
          {photoUrl ? (
            <Image src={photoUrl} alt={court.name} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" priority />
          ) : (
            <PhotoPlaceholder className="h-full w-full" />
          )}
        </div>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold text-fg">{court.name}</h1>
              {court.rating !== null && (
                <span className="flex items-center gap-1">
                  <Star size={16} className="fill-gold text-gold" />
                  <span className="font-heading text-base font-semibold text-fg">{court.rating.toFixed(1)}</span>
                </span>
              )}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
              <MapPin size={16} />
              {court.area} — {court.address}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <Layers size={16} />
                {SURFACE_LABELS[court.surface_type] ?? court.surface_type}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={16} />
                Up to {court.capacity} players
              </span>
            </div>

            {court.tagline && <p className="mt-4 text-sm italic text-faint">&ldquo;{court.tagline}&rdquo;</p>}
            {court.description && <p className="mt-5 max-w-xl text-sm leading-relaxed text-fg">{court.description}</p>}
          </div>

          <div className="shrink-0 rounded-2xl border border-border-card bg-surface p-5 sm:w-56">
            <p className="font-heading text-2xl font-bold text-fg">
              {formatPKR(court.price_per_hour)}
              <span className="text-sm font-normal text-muted">/hr</span>
            </p>
            <ButtonLink href={`/courts/${court.id}/book`} className="mt-4 w-full">
              Book Slot
            </ButtonLink>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
