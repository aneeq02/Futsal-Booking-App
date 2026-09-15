import { Skeleton } from '@/components/ui/Skeleton';

export default function BookingLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-[60px] border-b border-border/50 px-6 sm:px-10 lg:px-14" />
      <div className="h-14 border-b border-border/40 px-6 sm:px-10 lg:px-14" />

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="flex-1 px-6 py-6 sm:px-10 lg:px-14">
          <Skeleton className="mb-6 h-[84px] rounded-xl" />
          <Skeleton className="mb-3 h-4 w-24" />
          <Skeleton className="mb-6 h-16 w-full rounded-xl" />
          <Skeleton className="mb-3 h-4 w-40" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-[9px]" />
            ))}
          </div>
        </div>
        <div className="w-full shrink-0 border-t border-border-card bg-surface-2 p-6 lg:w-[340px] lg:border-l lg:border-t-0">
          <Skeleton className="mb-5 h-5 w-32" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
