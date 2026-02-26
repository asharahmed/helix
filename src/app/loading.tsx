import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { LoadingShell } from '@/components/shared/loading-shell';

export default function Loading() {
  return (
    <LoadingShell>
      <div className="space-y-4">
        <div>
          <div className="shimmer h-6 w-48 rounded mb-1" />
          <div className="shimmer h-4 w-36 rounded" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glow-card p-3 space-y-2">
              <div className="shimmer h-3 w-16 rounded" />
              <div className="shimmer h-8 w-12 rounded" />
              <div className="shimmer h-3 w-20 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7">
            <CardSkeleton className="h-[450px]" />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <CardSkeleton className="h-[450px]" />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-6">
            <CardSkeleton className="h-[300px]" />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <CardSkeleton className="h-[300px]" />
          </div>
        </div>
      </div>
    </LoadingShell>
  );
}
