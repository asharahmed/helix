import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import '@/styles/globals.css';
import '@/styles/palantir-theme.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

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
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
        <div className="scanline-overlay" />
      </body>
    </html>
  );
}
