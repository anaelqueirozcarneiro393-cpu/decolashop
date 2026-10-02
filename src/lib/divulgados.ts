export interface DivulgadoCampaign {
  id: string;
  productId: string;
  name: string;
  image_url: string;
  category: string;
  price: string | number;
  commission?: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  networks: string[];
  impressions: number;
  clicks: number;
  salesCount: number;
  revenue: number;
  roas: number;
  conversionRate: number;
  targeting?: {
    audience: string;
    ageRange: string;
    location: string;
    interests: string[];
  };
  sampleCopy?: {
    headline: string;
    body: string;
    cta: string;
  };
}

export const INITIAL_DIVULGADOS: DivulgadoCampaign[] = [
  {
    id: 'camp-seed-1',
    productId: '1',
    name: 'Smartwatch W9 Pro Ultra Series 9 Tela Infinita AMOLED',
    image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800',
    category: 'Eletrônicos',
    price: 149.90,
    commission: 'R$ 47,90',
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    networks: ['Meta Ads (Instagram & Facebook)', 'TikTok Shop Ads', 'Google Shopping', 'WhatsApp Grupos VIP'],
    impressions: 48920,
    clicks: 3140,
    salesCount: 84,
    revenue: 12591.60,
    roas: 5.2,
    conversionRate: 4.1,
    targeting: {
      audience: 'Interesse em Tecnologia, Wearables e Fitness',
      ageRange: '20 - 45 anos',
      location: 'Brasil (Todo o Território Nacional)',
      interests: ['Smartwatches', 'Apple Watch Fans', 'Fitness Tech', 'Gadgets']
    },
    sampleCopy: {
      headline: '🔥 O Smartwatch Mais Desejado do Brasil com Frete Grátis!',
      body: 'Tela AMOLED infinita com medição cardíaca, chamadas bluetooth e bateria de 7 dias.',
      cta: '👉 COMPRAR COM 50% OFF HOJE'
    }
  },
  {
    id: 'camp-seed-2',
    productId: '2',
    name: 'Fone Bluetooth TWS Gamer Lenovo GM2 Pro Baixa Latência',
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
    category: 'Eletrônicos',
    price: 79.90,
    commission: 'R$ 25,50',
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    networks: ['TikTok Shop Ads', 'Kwai Ads', 'Meta Ads (Instagram)', 'WhatsApp Grupos VIP'],
    impressions: 36410,
    clicks: 2450,
    salesCount: 62,
    revenue: 4953.80,
    roas: 4.8,
    conversionRate: 3.9,
    targeting: {
      audience: 'Gamers Mobile, Fãs de Jogos e Música',
      ageRange: '16 - 32 anos',
      location: 'Brasil (Principais Capitais)',
      interests: ['Free Fire', 'Call of Duty Mobile', 'Lenovo', 'Fones TWS']
    },
    sampleCopy: {
      headline: '🎧 Zero Delay em Jogos e Graves Potentes!',
      body: 'Chegou o Lenovo GM2 Pro original. Bateria duradoura e cancelamento de ruído.',
      cta: '⚡ GARANTIR O MEU COM FRETE GRÁTIS'
    }
  },
  {
    id: 'camp-seed-3',
    productId: '3',
    name: 'Câmera Lâmpada de Segurança 360 Wifi Espiã com Visão Noturna',
    image_url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800',
    category: 'Segurança',
    price: 89.90,
    commission: 'R$ 28,70',
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    networks: ['Google Shopping', 'Facebook Ads', 'WhatsApp Grupos VIP'],
    impressions: 29800,
    clicks: 1890,
    salesCount: 41,
    revenue: 3685.90,
    roas: 4.4,
    conversionRate: 3.5,
    targeting: {
      audience: 'Proprietários de Imóveis, Famílias e Pequenos Comércios',
      ageRange: '28 - 60 anos',
      location: 'Brasil',
      interests: ['Segurança Residencial', 'Monitoramento', 'Câmeras Wifi']
    },
    sampleCopy: {
      headline: '🛡️ Proteja Sua Casa Sem Gastar com Mensalidades',
      body: 'Rosqueie no bocal comum e veja tudo pelo celular em tempo real com áudio bidirecional.',
      cta: '📦 PEDIR AGORA COM DESCONTO'
    }
  },
  {
    id: 'camp-seed-4',
    productId: '4',
    name: 'Mini Selador Térmico Portátil de Embalagens e Sacos Plásticos',
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    category: 'Utilidades',
    price: 39.90,
    commission: 'R$ 15,20',
    status: 'paused',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    networks: ['TikTok Shop Ads', 'Instagram Reels Ads', 'WhatsApp Grupos VIP'],
    impressions: 21300,
    clicks: 1280,
    salesCount: 35,
    revenue: 1396.50,
    roas: 5.6,
    conversionRate: 4.6,
    targeting: {
      audience: 'Donas de Casa, Organização de Cozinha e Alimentos',
      ageRange: '25 - 55 anos',
      location: 'Brasil',
      interests: ['Culinária', 'Conservação de Alimentos', 'Utilidades Domésticas']
    },
    sampleCopy: {
      headline: '🥗 Mantenha Seus Alimentos Crocantes por Muito Mais Tempo',
      body: 'Sele saquinhos de biscoito, salgadinho e legumes em 3 segundos com calor imediato.',
      cta: '🛒 COMPRE 1 LEVE 2'
    }
  }
];

const STORAGE_KEY = 'decolashop_divulgados';

export function getDivulgados(): DivulgadoCampaign[] {
  if (typeof window === 'undefined') return INITIAL_DIVULGADOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DIVULGADOS));
      return INITIAL_DIVULGADOS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DIVULGADOS));
      return INITIAL_DIVULGADOS;
    }
    return parsed;
  } catch (e) {
    console.error('Erro ao ler produtos divulgados do localStorage:', e);
    return INITIAL_DIVULGADOS;
  }
}

export function saveDivulgados(campaigns: DivulgadoCampaign[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    window.dispatchEvent(new Event('decolashop_divulgados_updated'));
  } catch (e) {
    console.error('Erro ao salvar produtos divulgados:', e);
  }
}

export const MAX_ACTIVE_CAMPAIGNS = 15;

export function addDivulgado(newEntry: Omit<DivulgadoCampaign, 'id' | 'createdAt'>): DivulgadoCampaign {
  const current = getDivulgados();
  const activeCount = current.filter(c => c.status === 'active').length;
  
  // Limite de no máximo 15 campanhas ativas
  let initialStatus = newEntry.status || 'active';
  if (initialStatus === 'active' && activeCount >= MAX_ACTIVE_CAMPAIGNS) {
    initialStatus = 'paused';
  }

  const created: DivulgadoCampaign = {
    ...newEntry,
    status: initialStatus,
    id: `camp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [created, ...current.filter(c => c.productId !== created.productId)];
  saveDivulgados(updated);
  return created;
}

export function toggleDivulgadoStatus(id: string): { updated: DivulgadoCampaign[]; error?: string } {
  const current = getDivulgados();
  const target = current.find(c => c.id === id);
  if (!target) return { updated: current };

  // Ao despausar/ativar, valida se já não atingiu o limite de 15 ativas
  if (target.status === 'paused') {
    const activeCount = current.filter(c => c.status === 'active').length;
    if (activeCount >= MAX_ACTIVE_CAMPAIGNS) {
      return {
        updated: current,
        error: `Limite atingido: você já possui ${MAX_ACTIVE_CAMPAIGNS} campanhas ativas! Pause uma campanha antes de ativar outra.`
      };
    }
  }

  const updated = current.map(c => {
    if (c.id === id) {
      return {
        ...c,
        status: (c.status === 'active' ? 'paused' : 'active') as 'active' | 'paused'
      };
    }
    return c;
  });
  saveDivulgados(updated);
  return { updated };
}

export function removeDivulgado(id: string): DivulgadoCampaign[] {
  const current = getDivulgados();
  const updated = current.filter(c => c.id !== id);
  saveDivulgados(updated);
  return updated;
}

export function registerSaleForCampaign(productIdOrName: string, saleValue: number): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getDivulgados();
    const cleanSearch = (productIdOrName || '').toLowerCase().trim();
    let matched = false;
    const updated = current.map(c => {
      const isMatch = c.productId === productIdOrName || 
                      c.id === productIdOrName ||
                      c.name.toLowerCase().includes(cleanSearch) || 
                      cleanSearch.includes(c.name.toLowerCase());
      if (isMatch && !matched) {
        matched = true;
        return {
          ...c,
          salesCount: (c.salesCount || 0) + 1,
          revenue: Math.round(((c.revenue || 0) + saleValue) * 100) / 100
        };
      }
      return c;
    });
    if (matched) {
      saveDivulgados(updated);
    }
  } catch {}
}

export function getDivulgadosStats(campaigns: DivulgadoCampaign[]) {
  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const totalImpressions = campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
  const totalSales = campaigns.reduce((acc, c) => acc + (c.salesCount || 0), 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);
  const avgRoas = campaigns.length > 0 
    ? (campaigns.reduce((acc, c) => acc + (c.roas || 0), 0) / campaigns.length).toFixed(1)
    : '4.8';

  return {
    activeCount,
    totalCampaigns: campaigns.length,
    totalImpressions,
    totalClicks,
    totalSales,
    totalRevenue,
    avgRoas,
  };
}
