/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    serverComponentsExternalPackages: ['lru-cache'],
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;
