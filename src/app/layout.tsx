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
      <head>
        {/* Captura instantânea e síncrona de afiliado antes da hidratação do React */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var p = new URLSearchParams(window.location.search);
                  var af = p.get('af') || p.get('ref') || p.get('afiliado') || p.get('affiliate') || p.get('afiliados');
                  if (!af) {
                    var m = window.location.pathname.match(/^\\/(?:af|ref|afiliado)\\/(.+)$/i);
                    if (m && m[1]) af = m[1];
                  }
                  if (af && typeof af === 'string') {
                    var clean = af.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
                    if (clean) {
                      window.__decolashop_af = clean;
                      try { localStorage.setItem('decolashop_affiliate_ref', clean); } catch(e){}
                      try { sessionStorage.setItem('decolashop_affiliate_ref', clean); } catch(e){}
                      var d = 365 * 86400;
                      var exp = new Date(Date.now() + 365 * 864e5).toUTCString();
                      document.cookie = 'decolashop_af=' + clean + '; max-age=' + d + '; expires=' + exp + '; path=/; SameSite=Lax';
                      var host = window.location.hostname;
                      if (host.indexOf('decolashop.com.br') !== -1) {
                        document.cookie = 'decolashop_af=' + clean + '; max-age=' + d + '; expires=' + exp + '; path=/; domain=.decolashop.com.br; SameSite=Lax';
                      } else if (host.indexOf('decolashop.com') !== -1) {
                        document.cookie = 'decolashop_af=' + clean + '; max-age=' + d + '; expires=' + exp + '; path=/; domain=.decolashop.com; SameSite=Lax';
                      }
                    }
                  }
                } catch(err) {}
              })();
            `
          }}
        />
      </head>
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
