'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CourtCard } from '@/components/courts/CourtCard';
import { FilterSidebar } from '@/components/courts/FilterSidebar';
import { SortBar } from '@/components/courts/SortBar';
import { Pagination } from '@/components/courts/Pagination';
import type { CourtWithPrimaryPhoto } from '@/lib/supabase/queries';

const PAGE_SIZE = 10;
const PRICE_MIN = 1500;
const PRICE_MAX = 6000;

interface Filters {
  query: string;
  areas: string[];
  minPrice: number;
  maxPrice: number;
  minRating?: number;
  sort: string;
  page: number;
}

function parseFilters(searchParams: URLSearchParams): Filters {
  return {
    query: searchParams.get('q') ?? '',
    areas: searchParams.get('areas')?.split(',').filter(Boolean) ?? [],
    minPrice: Number(searchParams.get('minPrice') ?? PRICE_MIN),
    maxPrice: Number(searchParams.get('maxPrice') ?? PRICE_MAX),
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    sort: searchParams.get('sort') ?? '',
    page: Math.max(1, Number(searchParams.get('page') ?? 1)),
  };
}

export function CourtsBrowser({ courts, today }: { courts: CourtWithPrimaryPhoto[]; today: string }) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() => parseFilters(searchParams));

  const areaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const court of courts) counts[court.area] = (counts[court.area] ?? 0) + 1;
    return counts;
  }, [courts]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return courts.filter((court) => {
      if (q && !court.name.toLowerCase().includes(q) && !court.area.toLowerCase().includes(q)) return false;
      if (filters.areas.length > 0 && !filters.areas.includes(court.area)) return false;
      // Only apply price bounds once the slider has actually moved off its
      // default extremes — otherwise courts priced outside the slider's
      // fixed [PRICE_MIN, PRICE_MAX] range would be hidden by default.
      if (filters.minPrice > PRICE_MIN && court.price_per_hour < filters.minPrice) return false;
      if (filters.maxPrice < PRICE_MAX && court.price_per_hour > filters.maxPrice) return false;
      if (filters.minRating !== undefined && (court.rating ?? 0) < filters.minRating) return false;
      return true;
    });
  }, [courts, filters.query, filters.areas, filters.minPrice, filters.maxPrice, filters.minRating]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (filters.sort === 'price') return copy.sort((a, b) => a.price_per_hour - b.price_per_hour);
    if (filters.sort === 'rating') return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return copy;
  }, [filtered, filters.sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const pageCourts = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Filters are applied entirely in-browser (no server round-trip), so we only
  // need to mirror state into the URL for shareable/bookmarkable links.
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.areas.length > 0) params.set('areas', filters.areas.join(','));
    if (filters.minPrice !== PRICE_MIN) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== PRICE_MAX) params.set('maxPrice', String(filters.maxPrice));
    if (filters.minRating !== undefined) params.set('minRating', String(filters.minRating));
    if (filters.sort) params.set('sort', filters.sort);
    if (page !== 1) params.set('page', String(page));
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `/courts?${qs}` : '/courts');
  }, [filters, page]);

  function updateFilters(mutate: (next: Filters) => Filters) {
    setFilters((prev) => ({ ...mutate({ ...prev, page: 1 }) }));
  }

  return (
    <div className="flex flex-1 flex-col sm:flex-row">
      <FilterSidebar
        areaCounts={areaCounts}
        total={sorted.length}
        selectedAreas={filters.areas}
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        minRating={filters.minRating}
        onToggleArea={(area) =>
          updateFilters((f) => ({
            ...f,
            areas: f.areas.includes(area) ? f.areas.filter((a) => a !== area) : [...f.areas, area],
          }))
        }
        onClearAreas={() => updateFilters((f) => ({ ...f, areas: [] }))}
        onSetPrice={(key, value) => updateFilters((f) => ({ ...f, [key]: value }))}
        onSetRating={(value) => updateFilters((f) => ({ ...f, minRating: value }))}
      />

      <div className="flex-1 bg-bg px-6 py-6 sm:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[13px] text-muted">
            <strong className="text-fg">
              {sorted.length} court{sorted.length === 1 ? '' : 's'}
            </strong>{' '}
            · {today}, tonight
          </div>
          <SortBar value={filters.sort} onChange={(value) => setFilters((f) => ({ ...f, sort: value, page: 1 }))} />
        </div>

        {pageCourts.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">No courts match your filters yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {pageCourts.map((court, i) => (
              <CourtCard
                key={court.id}
                court={court}
                primaryPhoto={court.primaryPhoto}
                variant="horizontal"
                seed={i}
                priority={i < 2}
              />
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
      </div>
    </div>
  );
}
