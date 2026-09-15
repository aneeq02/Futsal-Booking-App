import { CourtsNav } from '@/components/layout/CourtsNav';
import { CourtCard } from '@/components/courts/CourtCard';
import { FilterSidebar } from '@/components/courts/FilterSidebar';
import { SortBar } from '@/components/courts/SortBar';
import { Pagination } from '@/components/courts/Pagination';
import { searchCourts, getAreaCounts } from '@/lib/supabase/queries';

const PAGE_SIZE = 10;

interface CourtsPageProps {
  searchParams: {
    q?: string;
    areas?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sort?: string;
    page?: string;
  };
}

export default async function CourtsPage({ searchParams }: CourtsPageProps) {
  const [courts, areaCounts] = await Promise.all([
    searchCourts({
      query: searchParams.q,
      areas: searchParams.areas?.split(',').filter(Boolean),
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      minRating: searchParams.minRating ? Number(searchParams.minRating) : undefined,
    }),
    getAreaCounts(),
  ]);

  const sorted = sortCourts(courts, searchParams.sort);
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageCourts = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const today = new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });

  return (
    <div className="flex min-h-screen flex-col">
      <CourtsNav />

      <div className="flex flex-1 flex-col sm:flex-row">
        <FilterSidebar areaCounts={areaCounts} total={courts.length} />

        <div className="flex-1 bg-bg px-6 py-6 sm:px-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[13px] text-muted">
              <strong className="text-fg">
                {sorted.length} court{sorted.length === 1 ? '' : 's'}
              </strong>{' '}
              · {today}, tonight
            </div>
            <SortBar />
          </div>

          {pageCourts.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted">No courts match your filters yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pageCourts.map((court, i) => (
                <CourtCard key={court.id} court={court} primaryPhoto={court.primaryPhoto} variant="horizontal" seed={i} />
              ))}
            </div>
          )}

          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}

function sortCourts<T extends { price_per_hour: number; rating: number | null }>(courts: T[], sort?: string): T[] {
  const copy = [...courts];
  if (sort === 'price') return copy.sort((a, b) => a.price_per_hour - b.price_per_hour);
  if (sort === 'rating') return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return copy;
}
