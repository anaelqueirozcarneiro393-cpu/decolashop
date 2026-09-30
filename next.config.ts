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
      { source: '/dashboard', destination: '/' },
      { source: '/financeiro', destination: '/' },
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
