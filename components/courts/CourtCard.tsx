import Image from 'next/image';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import { PhotoPlaceholder } from '@/components/courts/PhotoPlaceholder';
import { ButtonLink } from '@/components/ui/Button';
import { formatPKR, getCourtPhotoUrl } from '@/lib/utils';
import type { Court, CourtPhoto } from '@/types/database.types';

interface CourtCardProps {
  court: Court;
  primaryPhoto?: CourtPhoto | null;
  availableSlots?: number;
  seed?: number;
  variant?: 'grid' | 'horizontal';
}

export function CourtCard({ court, primaryPhoto, availableSlots, seed = 0, variant = 'grid' }: CourtCardProps) {
  const photoUrl = primaryPhoto ? getCourtPhotoUrl(primaryPhoto.storage_path) : null;

  const availabilityBadge =
    availableSlots === undefined ? null : availableSlots === 0 ? (
      <Badge dot="bg-faint" text="Fully booked" textClass="text-faint" />
    ) : availableSlots <= 2 ? (
      <Badge dot="bg-gold" text={`${availableSlots} slots left`} textClass="text-gold-soft" />
    ) : (
      <Badge dot="bg-primary" text="Available tonight" textClass="text-mint-pale" />
    );

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/courts/${court.id}`}
        className="flex overflow-hidden rounded-[14px] border border-border-card bg-surface shadow-[0_3px_14px_rgba(0,0,0,0.06)] dark:shadow-none"
      >
        <div className="relative h-auto w-[160px] shrink-0 sm:w-[180px]">
          {photoUrl ? (
            <Image src={photoUrl} alt={court.name} fill sizes="180px" className="object-cover" />
          ) : (
            <PhotoPlaceholder className="h-full w-full" seed={seed} />
          )}
          {availableSlots !== undefined && (
            <div className="absolute bottom-2.5 left-2.5">{availabilityBadge}</div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-[18px] min-w-0">
          <div>
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="truncate font-heading text-[15px] font-bold leading-tight text-fg">{court.name}</div>
              {court.rating !== null && (
                <div className="flex shrink-0 items-center gap-[3px]">
                  <Star size={11} className="fill-gold text-gold" />
                  <span className="font-heading text-xs font-semibold text-fg">{court.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="mb-3 truncate text-xs text-muted">{court.area}</div>
            <div className="text-xs text-faint">
              {court.format}
              {court.allows_half_court && ' · half-court available'}
            </div>
          </div>
          <div className="mt-3.5 flex items-center justify-between">
            <div>
              <span className="font-heading text-base font-extrabold text-primary">{formatPKR(court.price_per_hour)}</span>
              <span className="ml-0.5 text-[11px] text-faint">/hr</span>
            </div>
            <ButtonLink href={`/courts/${court.id}/book`} size="sm" className="!px-[18px] !py-2 !text-xs">
              Book Slot
            </ButtonLink>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/courts/${court.id}`} className="group block overflow-hidden rounded-2xl border border-border-card bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.07)] dark:shadow-none">
      <div className="relative h-[220px] w-full">
        {photoUrl ? (
          <Image src={photoUrl} alt={court.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform group-hover:scale-105" />
        ) : (
          <PhotoPlaceholder className="h-full w-full" seed={seed} />
        )}

        <div className="absolute left-3.5 top-3.5 rounded-md bg-black/70 px-2.5 py-1 backdrop-blur-sm">
          <span className="font-heading text-[11px] font-semibold text-[#F0FDF4]">{court.area}</span>
        </div>

        {court.rating !== null && (
          <div className="absolute right-3.5 top-3.5 flex items-center gap-1 rounded-md bg-black/70 px-2.5 py-1 backdrop-blur-sm">
            <Star size={11} className="fill-gold text-gold" />
            <span className="font-heading text-[11px] font-semibold text-[#F0FDF4]">{court.rating.toFixed(1)}</span>
          </div>
        )}

        {availableSlots !== undefined && (
          <div className="absolute bottom-3.5 left-3.5 rounded-md bg-black/70 px-2.5 py-1 backdrop-blur-sm">
            {availabilityBadge}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-1 font-heading text-base font-bold text-fg">{court.name}</div>
        <div className="mb-4 text-[13px] text-muted">{court.area}</div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-heading text-[17px] font-bold text-primary">{formatPKR(court.price_per_hour)}</span>
            <span className="ml-0.5 text-xs text-faint">/hr</span>
          </div>
          <span className="flex items-center gap-1 font-heading text-[13px] font-semibold text-primary">
            Book
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function Badge({ dot, text, textClass }: { dot: string; text: string; textClass: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
      <span className={`text-[11px] ${textClass}`}>{text}</span>
    </div>
  );
}
