import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div>
      <div className="flex h-[60px] items-center justify-between border-b border-border-card bg-surface px-6 sm:px-8">
        <div>
          <Skeleton className="mb-1.5 h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>

      <div className="flex flex-col gap-[18px] px-6 py-5 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px] rounded-xl" />
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-[220px] rounded-xl" />
          <Skeleton className="h-[220px] rounded-xl" />
        </div>
        <Skeleton className="h-[240px] rounded-xl" />
      </div>
    </div>
  );
}
