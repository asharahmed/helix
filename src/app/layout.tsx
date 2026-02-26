import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles/globals.css';
import '@/styles/palantir-theme.css';

export const metadata: Metadata = {
  title: 'Helix',
  description: 'Unified Monitoring Command Center',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
        <div className="scanline-overlay" />
      </body>
    </html>
  );
}
