import { LoadingSkeleton, CardSkeleton } from '@/components/shared/loading-skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Sidebar placeholder */}
      <div className="fixed left-0 top-0 h-screen w-16 border-r border-border bg-surface" />
      <div className="ml-16 pb-8">
        {/* Header placeholder */}
        <div className="h-12 border-b border-border bg-surface/50" />
        <main className="p-6 space-y-4">
          <div className="shimmer h-6 w-48 rounded" />
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-7">
              <CardSkeleton />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <CardSkeleton />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-7">
              <CardSkeleton />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <CardSkeleton />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
