import Link from 'next/link';
import { Radar } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background grid-bg flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="glow-card p-8 text-center space-y-4">
          <Radar className="h-12 w-12 text-muted mx-auto" />
          <h1 className="text-4xl font-mono font-bold text-text-primary">404</h1>
          <p className="text-sm font-mono text-text-secondary">
            Sector not found. No signal detected at this coordinate.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-cyan/30 bg-cyan/10 text-cyan text-sm font-mono hover:bg-cyan/20 transition-colors"
          >
            Return to Helix
          </Link>
        </div>
      </div>
    </div>
  );
}
