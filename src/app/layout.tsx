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
  metadataBase: new URL('https://www.decolashop.com.br'),
  title: {
    default: "DecolaShop | Mineração de Produtos Virais & Fornecedores Nacionais",
    template: "%s | DecolaShop"
  },
  description: "A plataforma inteligente para minerar produtos campeões de vendas no Brasil, conectar com fornecedores nacionais com estoque real e criar anúncios com inteligência artificial.",
  keywords: [
    "dropshipping nacional",
    "fornecedores dropshipping brasil",
    "minerador de produtos",
    "produtos virais",
    "shopee",
    "mercado livre",
    "decolashop",
    "loja virtual",
    "vender sem estoque",
    "atacado brasil",
    "fornecedores nacionais"
  ],
  authors: [{ name: "DecolaShop" }],
  creator: "DecolaShop",
  publisher: "DecolaShop",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'PV9ZKSBDDmnLfcuuyJeczZcZdbNys9RUD5XIF8Yt10I',
  },
  openGraph: {
    title: "DecolaShop | Mineração de Produtos Virais & Fornecedores Nacionais",
    description: "A plataforma inteligente para minerar produtos campeões de vendas no Brasil, conectar com fornecedores nacionais com estoque real e criar anúncios com inteligência artificial.",
    url: 'https://www.decolashop.com.br',
    siteName: 'DecolaShop',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/images/decolashop-logo.jpg',
        width: 1200,
        height: 630,
        alt: 'DecolaShop',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "DecolaShop | Mineração de Produtos Virais & Fornecedores Nacionais",
    description: "A plataforma inteligente para minerar produtos campeões de vendas e conectar com fornecedores nacionais.",
    images: ['/images/decolashop-logo.jpg'],
  },
  alternates: {
    canonical: 'https://www.decolashop.com.br',
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
        {/* Schema Estruturado JSON-LD para o Google reconhecer a entidade e a marca */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "DecolaShop",
              "url": "https://www.decolashop.com.br",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "Plataforma de inteligência para mineração de produtos virais, catálogo de fornecedores nacionais com estoque real e automação de ecommerce.",
              "offers": {
                "@type": "Offer",
                "price": "89.90",
                "priceCurrency": "BRL"
              }
            })
          }}
        />
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
