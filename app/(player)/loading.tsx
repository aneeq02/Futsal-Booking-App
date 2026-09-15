import { Skeleton } from '@/components/ui/Skeleton';

export default function LandingLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="h-[68px] border-b border-border/60 px-6 sm:px-10 lg:px-20" />

      <div className="px-6 pb-[72px] pt-16 sm:px-10 sm:pt-20 lg:px-20">
        <Skeleton className="mb-7 h-4 w-40" />
        <Skeleton className="mb-3 h-14 w-full max-w-[500px]" />
        <Skeleton className="mb-6 h-14 w-full max-w-[300px]" />
        <Skeleton className="mb-11 h-5 w-full max-w-[400px]" />
        <Skeleton className="h-16 w-full max-w-[680px] rounded-2xl" />
      </div>

      <div className="px-6 py-14 sm:px-10 lg:px-20">
        <Skeleton className="mb-7 h-8 w-64" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[340px] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
