// Trigger redeploy - 2026-05-03 22:15
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Providers } from "@/components/Providers";
import AffiliateTracker from "@/components/AffiliateTracker";
import AntiInspectionShield from "@/components/AntiInspectionShield";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://decolashop.com.br')
  ),
  title: {
    default: "DecolaShop | Mineração de Produtos Virais & Gerador de Anúncios IA",
    template: "%s | DecolaShop"
  },
  description: "A plataforma inteligente para minerar produtos campeões de vendas na Shopee e Mercado Livre com inteligência artificial.",
  openGraph: {
    title: "DecolaShop | Mineração de Produtos Virais & Gerador de Anúncios IA",
    description: "A plataforma inteligente para minerar produtos campeões de vendas na Shopee e Mercado Livre com inteligência artificial.",
    url: 'https://decolashop.com.br',
    siteName: 'DecolaShop',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://decolashop.com.br',
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/images/decolashop-icon.jpg", type: "image/jpeg" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    shortcut: "/images/decolashop-icon.jpg",
    apple: "/images/decolashop-icon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-dark-bg text-foreground antialiased">
        <Providers>
          <AffiliateTracker />
          <AntiInspectionShield />
          {children}
        </Providers>
      </body>
    </html>
  );
}
