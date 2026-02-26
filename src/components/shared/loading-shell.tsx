/**
 * Lightweight page shell for loading.tsx files.
 * Mirrors the sidebar + header chrome without client-side hooks.
 */
export function LoadingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="fixed left-0 top-0 h-screen w-16 border-r border-border bg-surface" />
      <div className="ml-16 pb-8">
        <div className="sticky top-0 z-30 h-11 border-b border-border bg-surface/50 backdrop-blur-md" />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
