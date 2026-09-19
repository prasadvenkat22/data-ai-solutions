/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
  },
  async rewrites() {
    const backend = process.env.API_BACKEND_URL || 'http://localhost:8000';
    return [
      { source: '/CRUD/:path*',        destination: `${backend}/CRUD/:path*` },
      { source: '/static/:path*',      destination: `${backend}/static/:path*` },
      { source: '/images/:path*',      destination: `${backend}/images/:path*` },
      { source: '/FileUploads/:path*', destination: `${backend}/FileUploads/:path*` },
      { source: '/auth/:path*',        destination: `${backend}/auth/:path*` },
      { source: '/trading/:path*',     destination: `${backend}/trading/:path*` },
      { source: '/api/genai/:path*',   destination: `${backend}/api/genai/:path*` },
    ];
  },
};

module.exports = nextConfig;
