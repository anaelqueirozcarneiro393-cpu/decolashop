import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'apex-finder.vercel.app',
          },
        ],
        destination: 'https://www.apexfinder.com.br/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
