import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/:path((?!api|_next|static|favicon.png|icon.png|manifest.json|robots.txt).*)',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
