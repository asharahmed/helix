/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  env: {
    GRAFANA_URL: process.env.GRAFANA_URL || '',
  },
  experimental: {
    serverComponentsExternalPackages: ['lru-cache'],
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;
