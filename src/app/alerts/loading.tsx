import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { LoadingShell } from '@/components/shared/loading-shell';

export default function AlertsLoading() {
  return (
    <LoadingShell>
    <div className="space-y-4">
      <div>
        <div className="shimmer h-6 w-24 rounded mb-1" />
        <div className="shimmer h-4 w-52 rounded" />
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <div className="glow-card p-4 space-y-3 h-[600px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="shimmer h-9 flex-1 rounded" />
              <div className="shimmer h-9 w-32 rounded" />
              <div className="shimmer h-9 w-32 rounded" />
            </div>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="shimmer h-10 rounded" />
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CardSkeleton className="h-[600px]" />
        </div>
      </div>
    </div>
    </LoadingShell>
  );
}
