import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self';" },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/dashboard', destination: '/' },
      { source: '/financeiro', destination: '/' },
      { source: '/afiliados', destination: '/' },
      { source: '/catalogo', destination: '/' },
      { source: '/divulgacao-ia', destination: '/' },
      { source: '/divulgados', destination: '/' },
      { source: '/anuncio', destination: '/' },
      { source: '/video-ia', destination: '/' },
      { source: '/conectar', destination: '/' },
      { source: '/video-aula', destination: '/' },
      { source: '/perfil', destination: '/' },
      { source: '/reembolso', destination: '/' },
      { source: '/minerador', destination: '/' },
      { source: '/detalhe', destination: '/' },
      { source: '/fornecedores', destination: '/' },
      { source: '/calculadora', destination: '/' },
      { source: '/meus-produtos', destination: '/' },
      { source: '/configuracoes', destination: '/' },
    ];
  },
};

export default nextConfig;
