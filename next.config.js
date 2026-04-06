/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
  },
  async rewrites() {
    const backend = process.env.API_BACKEND_URL || 'http://142.93.177.153:8000';
    return [
      { source: '/CRUD/:path*',        destination: `${backend}/CRUD/:path*` },
      { source: '/static/:path*',      destination: `${backend}/static/:path*` },
      { source: '/images/:path*',      destination: `${backend}/images/:path*` },
      { source: '/FileUploads/:path*', destination: `${backend}/FileUploads/:path*` },
    ];
  },
};

module.exports = nextConfig;
