import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles/globals.css';
import '@/styles/palantir-theme.css';

export const metadata: Metadata = {
  title: 'Helix',
  description: 'Unified infrastructure monitoring dashboard for Prometheus, Alertmanager, Loki, Wazuh, and CrowdSec.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Helix',
    description: 'Unified infrastructure monitoring dashboard for Prometheus, Alertmanager, Loki, Wazuh, and CrowdSec.',
    url: 'https://helix.aahmed.ca',
    siteName: 'Helix',
    type: 'website',
  },
  twitter: {
    card: 'summary',
  },
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
