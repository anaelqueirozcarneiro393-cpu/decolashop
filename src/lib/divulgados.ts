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

export interface ShippingTrackingStep {
  step: number; // 1 a 5
  title: string;
  description: string;
  dateStr: string;
  isCompleted: boolean;
  isCurrent: boolean;
  location: string;
}

export interface ShippingTrackingInfo {
  trackingCode: string;
  carrier: string;
  status: 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered';
  statusLabel: string;
  statusColor: 'emerald' | 'amber' | 'blue' | 'indigo' | 'cyan';
  elapsedDays: number;
  totalDays: number; // 7
  progressPercentage: number; // 0 a 100
  estimatedDeliveryDate: string;
  recipientCity: string;
  recipientName: string;
  steps: ShippingTrackingStep[];
  isDelivered: boolean;
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
    // Criado há 2 dias
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    networks: ['Meta Ads (Instagram & Facebook)', 'TikTok Shop Ads', 'Google Shopping', 'WhatsApp Grupos VIP'],
    impressions: 2420,
    clicks: 165,
    salesCount: 6,
    revenue: 899.40,
    roas: 4.6,
    conversionRate: 3.6,
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
    // Criado há 4 dias
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    networks: ['TikTok Shop Ads', 'Kwai Ads', 'Meta Ads (Instagram)', 'WhatsApp Grupos VIP'],
    impressions: 1840,
    clicks: 122,
    salesCount: 4,
    revenue: 319.60,
    roas: 4.2,
    conversionRate: 3.3,
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
    // Criado há 1 dia
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    networks: ['Google Shopping', 'Facebook Ads', 'WhatsApp Grupos VIP'],
    impressions: 1250,
    clicks: 86,
    salesCount: 3,
    revenue: 269.70,
    roas: 4.1,
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
    status: 'active',
    // Criado há 8 dias (SUPEROU 7 DIAS -> ENTREGUE!)
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    networks: ['TikTok Shop Ads', 'Instagram Reels Ads', 'WhatsApp Grupos VIP'],
    impressions: 980,
    clicks: 64,
    salesCount: 2,
    revenue: 79.80,
    roas: 4.5,
    conversionRate: 3.1,
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

/**
 * Calcula o status de transporte e entrega com base no prazo estrito de 7 dias.
 * Se o produto foi divulgado há 7 dias ou mais, é marcado como ENTREGUE ao cliente!
 */
export function getCampaignShippingInfo(campaign: DivulgadoCampaign): ShippingTrackingInfo {
  const createdDate = new Date(campaign.createdAt);
  const nowMs = Date.now();
  const diffMs = Math.max(0, nowMs - createdDate.getTime());
  const elapsedDaysExact = diffMs / (1000 * 60 * 60 * 24);
  const elapsedDays = Math.floor(elapsedDaysExact);
  const isDelivered = elapsedDaysExact >= 7;

  // Gerador determinístico de código de rastreio e destinatário
  const hash = Math.abs(
    campaign.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + 
    (campaign.productId ? parseInt(campaign.productId, 10) || 0 : 0)
  );
  const trackingNumber = (91000000 + (hash * 7891) % 8999999).toString();
  const trackingCode = `DC${trackingNumber}BR`;

  const recipients = [
    { name: 'Lucas F. de Oliveira', city: 'Campinas - SP' },
    { name: 'Camila R. Santos', city: 'Belo Horizonte - MG' },
    { name: 'Rodrigo M. Silva', city: 'Curitiba - PR' },
    { name: 'Beatriz L. Souza', city: 'Rio de Janeiro - RJ' },
    { name: 'Matheus K. Lima', city: 'Porto Alegre - RS' },
    { name: 'Juliana P. Almeida', city: 'Goiânia - GO' },
    { name: 'Felipe A. Moreira', city: 'Salvador - BA' },
    { name: 'Mariana C. Rezende', city: 'Florianópolis - SC' },
  ];
  const recipient = recipients[hash % recipients.length];

  const formatDateStep = (dayOffset: number, hour: number, min: number) => {
    const d = new Date(createdDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    d.setHours(hour, min, 0, 0);
    return `${d.toLocaleDateString('pt-BR')} às ${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };

  const deliveryDateObj = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const estimatedDeliveryDate = deliveryDateObj.toLocaleDateString('pt-BR');

  let status: ShippingTrackingInfo['status'] = 'processing';
  let statusLabel = 'Pedido Confirmado';
  let statusColor: ShippingTrackingInfo['statusColor'] = 'amber';
  let progressPercentage = 20;

  if (isDelivered) {
    status = 'delivered';
    statusLabel = 'Entregue ao Cliente';
    statusColor = 'emerald';
    progressPercentage = 100;
  } else if (elapsedDaysExact >= 5.5) {
    status = 'out_for_delivery';
    statusLabel = 'Saiu para Entrega';
    statusColor = 'cyan';
    progressPercentage = 80;
  } else if (elapsedDaysExact >= 3) {
    status = 'in_transit';
    statusLabel = 'Em Trânsito Regional';
    statusColor = 'blue';
    progressPercentage = 60;
  } else if (elapsedDaysExact >= 1.2) {
    status = 'shipped';
    statusLabel = 'Despachado / Em Rota';
    statusColor = 'indigo';
    progressPercentage = 40;
  }

  const steps: ShippingTrackingStep[] = [
    {
      step: 1,
      title: 'Pedido Confirmado & NF Gerada',
      description: 'Pagamento aprovado. Fornecedor nacional parceiro reservou e faturou a mercadoria.',
      dateStr: formatDateStep(0, 9, 30),
      isCompleted: true,
      isCurrent: status === 'processing',
      location: 'Centro de Distribuição Nacional (São Paulo - SP)',
    },
    {
      step: 2,
      title: 'Despacho & Embalagem Lacrada',
      description: 'Produto lacrado com proteção reforçada e etiquetado para coleta pela transportadora.',
      dateStr: formatDateStep(1.2, 14, 15),
      isCompleted: elapsedDaysExact >= 1.2,
      isCurrent: status === 'shipped',
      location: 'Hub Central Decola Express (Barueri - SP)',
    },
    {
      step: 3,
      title: 'Em Trânsito entre Unidades',
      description: 'Carga em transporte rodoviário expresso rumo ao centro de distribuição de destino.',
      dateStr: formatDateStep(3, 8, 40),
      isCompleted: elapsedDaysExact >= 3,
      isCurrent: status === 'in_transit',
      location: 'Unidade de Tratamento Interestadual (Cajamar - SP)',
    },
    {
      step: 4,
      title: 'Saiu para Rota de Entrega Local',
      description: 'Objeto no centro operacional mais próximo do destinatário e liberado para entrega.',
      dateStr: formatDateStep(5.5, 7, 50),
      isCompleted: elapsedDaysExact >= 5.5,
      isCurrent: status === 'out_for_delivery',
      location: `Base Operacional Regional (${recipient.city})`,
    },
    {
      step: 5,
      title: 'Entregue ao Destinatário',
      description: `Pacote entregue e recebido com sucesso por ${recipient.name}. Prazo de 7 dias cumprido.`,
      dateStr: formatDateStep(7, 15, 20),
      isCompleted: isDelivered,
      isCurrent: status === 'delivered',
      location: `Endereço de Destino (${recipient.city})`,
    },
  ];

  return {
    trackingCode,
    carrier: 'Decola Express / Loggi Express',
    status,
    statusLabel,
    statusColor,
    elapsedDays: Math.min(7, Math.max(1, elapsedDays)),
    totalDays: 7,
    progressPercentage,
    estimatedDeliveryDate,
    recipientCity: recipient.city,
    recipientName: recipient.name,
    steps,
    isDelivered,
  };
}

const STORAGE_KEY = 'decolashop_divulgados';

export function getActiveUserEmail(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem('decolashop_active_user_email') || '';
  } catch {
    return '';
  }
}

export function isGerenteOrAdminEmail(email?: string): boolean {
  const e = (email || getActiveUserEmail()).toLowerCase().trim();
  return (
    e === 'gerente@decolashop.com' ||
    e === 'admin@decolashop.com' ||
    e === 'admin@newshop.com' ||
    e.includes('gerente') ||
    e.includes('admin')
  );
}

export function getDivulgadosStorageKey(email?: string): string {
  const e = (email || getActiveUserEmail()).toLowerCase().trim();
  if (!e) return STORAGE_KEY;
  const cleanKey = e.replace(/[^a-z0-9]/g, '_');
  return `decolashop_divulgados_${cleanKey}`;
}

export function getDivulgados(email?: string): DivulgadoCampaign[] {
  const isMgr = isGerenteOrAdminEmail(email);
  if (typeof window === 'undefined') return isMgr ? INITIAL_DIVULGADOS : [];
  try {
    const key = getDivulgadosStorageKey(email);
    let raw = localStorage.getItem(key);
    
    // Se for gerente e ainda não tiver a chave nova, lê da chave legada
    if (isMgr && !raw) {
      raw = localStorage.getItem(STORAGE_KEY);
    }

    if (!raw) {
      if (isMgr) {
        localStorage.setItem(key, JSON.stringify(INITIAL_DIVULGADOS));
        return INITIAL_DIVULGADOS;
      }
      // Usuários normais começam 100% ZERADOS, sem campanhas ou vendas preexistentes!
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return isMgr ? INITIAL_DIVULGADOS : [];
    }
    return parsed;
  } catch (e) {
    console.error('Erro ao ler produtos divulgados do localStorage:', e);
    return isMgr ? INITIAL_DIVULGADOS : [];
  }
}

export function saveDivulgados(campaigns: DivulgadoCampaign[], email?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const targetEmail = (email || getActiveUserEmail()).toLowerCase().trim();
    const key = getDivulgadosStorageKey(targetEmail);
    localStorage.setItem(key, JSON.stringify(campaigns));
    if (isGerenteOrAdminEmail(targetEmail)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    }
    window.dispatchEvent(new Event('decolashop_divulgados_updated'));

    // Sincroniza em tempo real com o Supabase na nuvem para manter consistência entre PC e celular
    if (targetEmail) {
      fetch('/api/user/sync-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          state: { divulgados: campaigns }
        })
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Erro ao salvar produtos divulgados:', e);
  }
}

/**
 * Hidrata a lista local de campanhas a partir dos dados retornados da nuvem (Supabase)
 * quando o usuário faz login em um novo dispositivo ou navegador.
 */
export function hydrateDivulgados(campaigns: DivulgadoCampaign[], email?: string): void {
  if (typeof window === 'undefined' || !Array.isArray(campaigns) || campaigns.length === 0) return;
  try {
    const targetEmail = (email || getActiveUserEmail()).toLowerCase().trim();
    const key = getDivulgadosStorageKey(targetEmail);
    const localRaw = localStorage.getItem(key);
    if (!localRaw || JSON.parse(localRaw).length === 0) {
      localStorage.setItem(key, JSON.stringify(campaigns));
      if (isGerenteOrAdminEmail(targetEmail)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
      }
      window.dispatchEvent(new Event('decolashop_divulgados_updated'));
    }
  } catch {}
}


export const MAX_ACTIVE_CAMPAIGNS = 15;

export function addDivulgado(newEntry: Omit<DivulgadoCampaign, 'id' | 'createdAt'>, email?: string): DivulgadoCampaign {
  const current = getDivulgados(email);
  const activeCount = current.filter(c => c.status === 'active').length;
  
  // Limite de no máximo 15 campanhas ativas
  let initialStatus = newEntry.status || 'active';
  if (initialStatus === 'active' && activeCount >= MAX_ACTIVE_CAMPAIGNS) {
    initialStatus = 'paused';
  }

  const created: DivulgadoCampaign = {
    ...newEntry,
    salesCount: 0,
    revenue: 0,
    status: initialStatus,
    id: `camp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [created, ...current.filter(c => c.productId !== created.productId)];
  saveDivulgados(updated, email);
  return created;
}

export function toggleDivulgadoStatus(id: string, email?: string): { updated: DivulgadoCampaign[]; error?: string } {
  const current = getDivulgados(email);
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
  saveDivulgados(updated, email);
  return { updated };
}

export function removeDivulgado(id: string, email?: string): DivulgadoCampaign[] {
  const current = getDivulgados(email);
  const updated = current.filter(c => c.id !== id);
  saveDivulgados(updated, email);
  return updated;
}

export function registerSaleForCampaign(productIdOrName: string, saleValue: number, email?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getDivulgados(email);
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
      saveDivulgados(updated, email);
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
