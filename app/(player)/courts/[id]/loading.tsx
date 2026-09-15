import { Skeleton } from '@/components/ui/Skeleton';

export default function CourtDetailLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="h-[68px] border-b border-border/60 px-6 sm:px-10 lg:px-20" />

      <div className="mx-auto max-w-4xl px-6 py-10 sm:px-10">
        <Skeleton className="h-64 w-full rounded-2xl sm:h-96" />
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <Skeleton className="mb-3 h-8 w-64" />
            <Skeleton className="mb-4 h-4 w-80" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-32 w-56 shrink-0 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
