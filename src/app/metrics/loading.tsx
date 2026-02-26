import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { LoadingShell } from '@/components/shared/loading-shell';

export default function MetricsLoading() {
  return (
    <LoadingShell>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="shimmer h-6 w-28 rounded mb-1" />
          <div className="shimmer h-4 w-48 rounded" />
        </div>
        <div className="shimmer h-8 w-32 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} className="h-[240px]" />
        ))}
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6">
          <CardSkeleton className="h-[400px]" />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <CardSkeleton className="h-[400px]" />
        </div>
      </div>
    </div>
    </LoadingShell>
  );
}
