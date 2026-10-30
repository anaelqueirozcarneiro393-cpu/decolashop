import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET || "super_secret_session_key_decolashop_saas_2026",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "super_secret_session_key_decolashop_saas_2026",
    SUPABASE_URL: process.env.SUPABASE_URL || "https://chgttysabvuoxpujfuho.supabase.co",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://chgttysabvuoxpujfuho.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_MK3ImGrf9HccrQgGTKVhzQ_-BiCjb-_",
    SIGILOPAY_PUBLIC_KEY: "kaiofredy2908_1cmq6fd3bmq2s24u",
    SIGILOPAY_SECRET_KEY: "tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze",
    SIGILOPAY_BASE_URL: "https://app.sigilopay.com.br",
  },
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
