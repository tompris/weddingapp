/** @type {import('next').NextConfig} */
const nextConfig = {
  // No appDir needed for Next.js 14
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 