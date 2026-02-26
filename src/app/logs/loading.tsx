import { LoadingShell } from '@/components/shared/loading-shell';

export default function LogsLoading() {
  return (
    <LoadingShell>
    <div className="space-y-4">
      <div>
        <div className="shimmer h-6 w-20 rounded mb-1" />
        <div className="shimmer h-4 w-32 rounded" />
      </div>
      <div className="glow-card p-4 space-y-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="shimmer h-9 flex-1 rounded" />
          <div className="shimmer h-9 w-28 rounded" />
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
          <div key={i} className="shimmer h-5 rounded" style={{ width: `${65 + (i * 7) % 35}%` }} />
        ))}
      </div>
    </div>
    </LoadingShell>
  );
}
