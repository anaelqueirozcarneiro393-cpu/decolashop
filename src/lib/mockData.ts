export type ProductSource = 'YouTube' | 'Google' | 'Comunidades';
export type ProductStatus = 'ALTA' | 'ESTÁVEL' | 'CAINDO';

export interface Product {
  id: string;
  name: string;
  price: string | number;
  image_url: string;
  hype_score: number;
  url: string;
  description?: string;
  
  // Legacy fields (optional for backward compatibility)
  title?: string;
  score?: number;
  status?: ProductStatus;
  category?: string;
  savedAt?: string;
  commission?: string;
  evidence?: {
    google: {
      growth: string;
      interest: number;
      label: string;
    };
    youtube: {
      videos: number;
      views: string;
      growth: string;
      topVideos: { title: string; views: string }[];
    };
    communities: {
      groups: number;
      engagement: string;
      examples: string[];
    };
  };
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Mini Projetor Portátil 4K Cinema Pro',
    title: 'Mini Projetor Portátil 4K Cinema Pro',
    price: 'R$ 299,00',
    image_url: 'https://images.unsplash.com/photo-1535016120720-40c646bebbdc?auto=format&fit=crop&q=80&w=800',
    hype_score: 95,
    score: 95,
    url: 'https://shopee.com.br',
    status: 'ALTA',
    category: 'Eletrônicos',
    commission: 'R$ 45,00',
    evidence: {
      google: {
        growth: '+250%',
        interest: 92,
        label: 'SUBINDO'
      },
      youtube: {
        videos: 50,
        views: '500.000+',
        growth: '8% ao dia',
        topVideos: [
          { title: 'Mini Projetor 4K IMPRESSIONANTE', views: '50k' },
          { title: 'Você PRECISA disso no seu quarto', views: '30k' },
          { title: 'Unboxing Projetor Cinema em Casa', views: '25k' }
        ]
      },
      communities: {
        groups: 12,
        engagement: 'ALTO',
        examples: [
          'Shopee Sellers: "Alguém vende isso?"',
          'Afiliados BR: "Produto viral agora"',
          'Discord Empreendedores: "Oportunidade"'
        ]
      }
    }
  },
  {
    id: '2',
    name: 'Escova Alisadora 3 em 1 Ionizada',
    title: 'Escova Alisadora 3 em 1 Ionizada',
    price: 'R$ 147,00',
    image_url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=800',
    hype_score: 87,
    score: 87,
    url: 'https://shopee.com.br',
    status: 'ALTA',
    category: 'Beleza',
    commission: 'R$ 32,00',
    evidence: {
      google: {
        growth: '+180%',
        interest: 85,
        label: 'SUBINDO'
      },
      youtube: {
        videos: 35,
        views: '300.000+',
        growth: '5% ao dia',
        topVideos: [
          { title: 'Testei a escova viral da Shopee', views: '40k' },
          { title: 'Melhor compra de beleza do ano', views: '22k' }
        ]
      },
      communities: {
        groups: 8,
        engagement: 'MÉDIO',
        examples: [
          'Dicas de Beleza: "Funciona mesmo?"',
          'Achadinhos Shopee: "Estoque voando"'
        ]
      }
    }
  },
  {
    id: '3',
    name: 'Lâmpada de Monitor Barra LED RGB',
    title: 'Lâmpada de Monitor Barra LED RGB',
    price: 'R$ 89,00',
    image_url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=800',
    hype_score: 72,
    score: 72,
    url: 'https://shopee.com.br',
    status: 'ESTÁVEL',
    category: 'Setup Gamer',
    commission: 'R$ 18,00',
    evidence: {
      google: {
        growth: '+45%',
        interest: 60,
        label: 'ESTÁVEL'
      },
      youtube: {
        videos: 20,
        views: '120.000+',
        growth: '2% ao dia',
        topVideos: [
          { title: 'Setup minimalista com Screenbar', views: '15k' }
        ]
      },
      communities: {
        groups: 5,
        engagement: 'BAIXO',
        examples: [
          'Setup BR: "Qual a melhor marca?"'
        ]
      }
    }
  }
];

export const tips = [
  "Produtos que estão em trend por 3+ dias têm chance maior de estabilizar. Olhe para o Score >80.",
  "O YouTube é o melhor termômetro para produtos de 'impulso'. Se tem muitos unboxings, a demanda é real.",
  "Google Trends em alta significa que as pessoas já estão na fase de 'decisão de compra'.",
  "Sempre teste 2 variações de anúncio: uma focada em Urgência e outra em Prova Social."
];
