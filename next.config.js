/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'dev.avidexplorers.in'],
  },
  // Ensure static files are served properly
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig;