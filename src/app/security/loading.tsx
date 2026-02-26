import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { LoadingShell } from '@/components/shared/loading-shell';

export default function SecurityLoading() {
  return (
    <LoadingShell>
    <div className="space-y-4">
      <div>
        <div className="shimmer h-6 w-32 rounded mb-1" />
        <div className="shimmer h-4 w-56 rounded" />
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6">
          <CardSkeleton className="h-[400px]" />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <CardSkeleton className="h-[400px]" />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6">
          <CardSkeleton className="h-[350px]" />
        </div>
        <div className="col-span-12 lg:col-span-6">
          <CardSkeleton className="h-[350px]" />
        </div>
      </div>
    </div>
    </LoadingShell>
  );
}
