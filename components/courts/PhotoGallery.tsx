'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PhotoPlaceholder } from '@/components/courts/PhotoPlaceholder';
import { cn, getCourtPhotoUrl } from '@/lib/utils';
import type { CourtPhoto } from '@/types/database.types';

export function PhotoGallery({ photos, courtName }: { photos: CourtPhoto[]; courtName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = photos[activeIndex];

  return (
    <div>
      <div className="relative h-64 w-full overflow-hidden rounded-2xl sm:h-96">
        {active ? (
          <Image
            src={getCourtPhotoUrl(active.storage_path)}
            alt={courtName}
            fill
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <PhotoPlaceholder className="h-full w-full" />
        )}
      </div>

      {photos.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                i === activeIndex ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <Image src={getCourtPhotoUrl(photo.storage_path)} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
