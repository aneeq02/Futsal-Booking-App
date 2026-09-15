import { Skeleton } from '@/components/ui/Skeleton';

export default function CourtsLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-border/50 px-6 sm:px-10 lg:px-14" />

      <div className="flex flex-1 flex-col sm:flex-row">
        <aside className="w-full shrink-0 border-border-subtle px-5 py-6 sm:w-[264px] sm:border-r">
          <Skeleton className="mb-5 h-4 w-40" />
          <Skeleton className="mb-3 h-4 w-16" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </aside>

        <div className="flex-1 bg-bg px-6 py-6 sm:px-8">
          <Skeleton className="mb-5 h-4 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[184px] rounded-[14px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
