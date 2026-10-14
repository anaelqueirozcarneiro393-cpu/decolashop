export interface DivulgadoCampaign {
  id: string;
  productId: string;
  name: string;
  image_url: string;
  category: string;
  price: string | number;
  commission?: string;
  currency?: 'BRL' | 'USD';
  origin?: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  networks: string[];
  impressions: number;
  clicks: number;
  salesCount: number;
  revenue: number;
  roas: number;
  conversionRate: number;
  channel?: 'mercadolivre' | 'shopee' | 'tiktok' | 'amazon' | 'shopify' | 'geral';
  channelLabel?: string;
  supplierCost?: number;
  sellerMargin?: number;
  sellerMarginPercent?: number;
  marketplaceFee?: number;
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
  timeStr: string;
  isCompleted: boolean;
  isCurrent: boolean;
  location: string;
  iconType: 'order' | 'box' | 'truck' | 'local' | 'delivered';
}

export interface ShippingTrackingInfo {
  trackingCode: string;
  carrier: string;
  serviceType: string;
  status: 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered';
  statusLabel: string;
  statusColor: 'emerald' | 'amber' | 'blue' | 'indigo' | 'cyan';
  elapsedDays: number;
  totalDays: number; // 7
  daysRemaining: number;
  progressPercentage: number; // 0 a 100
  estimatedDeliveryDate: string;
  dispatchDate: string;
  deliveredDate?: string;
  recipientCity: string;
  recipientName: string;
  recipientAddress: string;
  originHub: string;
  originCountry: string;
  destinationCountry: string;
  courierName: string;
  courierVehicle: string;
  steps: ShippingTrackingStep[];
  isDelivered: boolean;
  deliveryProtocol?: string;
  digitalSignature?: string;
  currency: 'BRL' | 'USD';
  shareUrl: string;
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
    currency: 'BRL',
    origin: 'São Paulo - SP (Hub Nacional)',
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
    currency: 'BRL',
    origin: 'São Paulo - SP (Hub Nacional)',
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
    id: 'camp-seed-int-1',
    productId: 'int-1',
    name: 'Pro 4K Pocket Projector HDR 1080p Support Native',
    image_url: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&q=80&w=800',
    category: 'Eletrônicos & Tech',
    price: 129.00,
    commission: 'US$ 42,00',
    currency: 'USD',
    origin: 'East Brunswick, New Jersey, NJ - EUA',
    status: 'active',
    // Criado há 3 dias
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    networks: ['TikTok Shop US', 'Meta Ads USA & CA', 'Google Shopping US', 'Shopify Global Ads'],
    impressions: 4890,
    clicks: 340,
    salesCount: 8,
    revenue: 1032.00,
    roas: 5.1,
    conversionRate: 4.1,
    targeting: {
      audience: 'Home Cinema, Smart Tech & Gadgets Enthusiasts (USA / CA / UK)',
      ageRange: '22 - 50 years',
      location: 'United States & Canada (Express Air Delivery)',
      interests: ['Home Theater', 'Portable Projectors', 'Tech Gadgets', 'Netflix Setups']
    },
    sampleCopy: {
      headline: '🎬 Turn Any Bedroom Ceiling Into an IMAX Screen with 4K Support!',
      body: 'Compact, 360 rotation and pre-installed Android. Over 5,000 units sold globally.',
      cta: '🔥 GET YOURS NOW - FREE 7-DAY EXPRESS SHIPPING'
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
    currency: 'BRL',
    origin: 'São Paulo - SP (Hub Nacional)',
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
    currency: 'BRL',
    origin: 'São Paulo - SP (Hub Nacional)',
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
  const daysRemaining = Math.max(0, Math.ceil(7 - elapsedDaysExact));

  const isUsd = campaign.currency === 'USD' || 
    (typeof campaign.price === 'string' && campaign.price.includes('$') && !campaign.price.includes('R$')) ||
    (campaign.origin && (campaign.origin.includes('EUA') || campaign.origin.includes('Europa')));

  // Gerador determinístico de código de rastreio e destinatário
  const hash = Math.abs(
    campaign.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + 
    (campaign.productId ? parseInt(campaign.productId.replace(/\D/g, '') || '7', 10) : 7)
  );

  const trackingSuffix = isUsd ? 'US' : 'BR';
  const trackingPrefix = isUsd ? 'FX' : 'DC';
  const trackingNumber = (91000000 + (hash * 7891) % 8999999).toString();
  const trackingCode = `${trackingPrefix}${trackingNumber}${trackingSuffix}`;

  const nationalRecipients = [
    { name: 'Lucas F. de Oliveira', city: 'Campinas - SP', address: 'Rua Barão de Jaguara, 1420 - Centro' },
    { name: 'Camila R. Santos', city: 'Belo Horizonte - MG', address: 'Av. Afonso Pena, 2300 - Funcionários' },
    { name: 'Rodrigo M. Silva', city: 'Curitiba - PR', address: 'Rua XV de Novembro, 890 - Batel' },
    { name: 'Beatriz L. Souza', city: 'Rio de Janeiro - RJ', address: 'Av. Atlântica, 1850 - Copacabana' },
    { name: 'Matheus K. Lima', city: 'Porto Alegre - RS', address: 'Rua dos Andradas, 620 - Moinhos' },
    { name: 'Juliana P. Almeida', city: 'Goiânia - GO', address: 'Av. 85, 1140 - Setor Sul' },
    { name: 'Felipe A. Moreira', city: 'Salvador - BA', address: 'Av. Sete de Setembro, 980 - Barra' },
    { name: 'Mariana C. Rezende', city: 'Florianópolis - SC', address: 'Rua Bocaiúva, 450 - Centro' },
  ];

  const internationalRecipients = [
    { name: 'Michael B. Davis', city: 'Austin, TX - USA', address: '2400 Congress Ave, Suite 300' },
    { name: 'Sarah Jenkins', city: 'Miami, FL - USA', address: '1100 Brickell Ave, Apt 14B' },
    { name: 'David Miller', city: 'Los Angeles, CA - USA', address: '750 Figueroa St, Downtown' },
    { name: 'Emma Wilson', city: 'Chicago, IL - USA', address: '400 Michigan Ave, River North' },
    { name: 'James Taylor', city: 'Toronto, ON - Canada', address: '120 Bay Street, Financial District' },
    { name: 'Sophie Laurent', city: 'Berlin - Germany', address: 'Friedrichstraße 185, Mitte' },
    { name: 'Liam O’Connor', city: 'London - UK', address: '88 Kingsway, Holborn' },
  ];

  const recipientList = isUsd ? internationalRecipients : nationalRecipients;
  const recipient = recipientList[hash % recipientList.length];

  const courierList = isUsd ? [
    { name: 'FedEx Express Courier #4029', vehicle: 'FedEx Custom Delivery Van' },
    { name: 'DHL Express Driver Marcus H.', vehicle: 'DHL Express Electric Van' },
    { name: 'USPS Priority Carrier James P.', vehicle: 'USPS LLV Mail Truck' }
  ] : [
    { name: 'Marcelo T. (Identificador #4821)', vehicle: 'Furgão Utilitário Decola Express' },
    { name: 'Carlos Eduardo N. (ID #3192)', vehicle: 'Motocicleta Loggi Express Especial' },
    { name: 'Felipe Bastos (ID #5201)', vehicle: 'Van de Carga Rápida Decola' }
  ];
  const courier = courierList[hash % courierList.length];

  const formatDateStep = (dayOffset: number, hour: number, min: number) => {
    const d = new Date(createdDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    d.setHours(hour, min, 0, 0);
    return {
      dateStr: d.toLocaleDateString('pt-BR'),
      timeStr: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    };
  };

  const deliveryDateObj = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const estimatedDeliveryDate = deliveryDateObj.toLocaleDateString('pt-BR');
  const dispatchDate = new Date(createdDate.getTime() + 1.2 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
  const deliveredDate = isDelivered ? deliveryDateObj.toLocaleDateString('pt-BR') : undefined;

  let status: ShippingTrackingInfo['status'] = 'processing';
  let statusLabel = isUsd ? 'Order Confirmed & Processing' : 'Pedido Confirmado';
  let statusColor: ShippingTrackingInfo['statusColor'] = 'amber';
  let progressPercentage = 20;

  if (isDelivered) {
    status = 'delivered';
    statusLabel = isUsd ? 'Delivered to Customer' : 'Entregue ao Cliente';
    statusColor = 'emerald';
    progressPercentage = 100;
  } else if (elapsedDaysExact >= 5.5) {
    status = 'out_for_delivery';
    statusLabel = isUsd ? 'Out for Local Delivery' : 'Saiu para Entrega';
    statusColor = 'cyan';
    progressPercentage = 80;
  } else if (elapsedDaysExact >= 3) {
    status = 'in_transit';
    statusLabel = isUsd ? 'In Transit / Air Freight' : 'Em Trânsito Regional';
    statusColor = 'blue';
    progressPercentage = 60;
  } else if (elapsedDaysExact >= 1.2) {
    status = 'shipped';
    statusLabel = isUsd ? 'Dispatched / In Route' : 'Despachado / Em Rota';
    statusColor = 'indigo';
    progressPercentage = 40;
  }

  const originHub = isUsd 
    ? (campaign.origin || 'East Brunswick, New Jersey, NJ - EUA')
    : (campaign.origin || 'Centro de Distribuição Nacional (São Paulo - SP)');

  const s1Time = formatDateStep(0, 9, 30);
  const s2Time = formatDateStep(1.2, 14, 15);
  const s3Time = formatDateStep(3, 8, 40);
  const s4Time = formatDateStep(5.5, 7, 50);
  const s5Time = formatDateStep(7, 15, 20);

  const steps: ShippingTrackingStep[] = isUsd ? [
    {
      step: 1,
      title: 'Order Confirmed & Label Generated',
      description: 'International fulfillment center received and allocated stock for priority shipment.',
      dateStr: s1Time.dateStr,
      timeStr: s1Time.timeStr,
      isCompleted: true,
      isCurrent: status === 'processing',
      location: originHub,
      iconType: 'order',
    },
    {
      step: 2,
      title: 'Dispatched & Custom Packing Cleared',
      description: 'Package securely packed with tamper-proof seal and dispatched to International Airport Gateway.',
      dateStr: s2Time.dateStr,
      timeStr: s2Time.timeStr,
      isCompleted: elapsedDaysExact >= 1.2,
      isCurrent: status === 'shipped',
      location: 'JFK International Airport Air Cargo Center (New York, NY)',
      iconType: 'box',
    },
    {
      step: 3,
      title: 'International Air Transit',
      description: 'Cargo loaded onto priority freight flight en route to destination distribution facility.',
      dateStr: s3Time.dateStr,
      timeStr: s3Time.timeStr,
      isCompleted: elapsedDaysExact >= 3,
      isCurrent: status === 'in_transit',
      location: 'Regional Sorting & Logistics Terminal Hub',
      iconType: 'truck',
    },
    {
      step: 4,
      title: 'Out for Final Delivery',
      description: `Courier ${courier.name} received parcel and is out for delivery to buyer address.`,
      dateStr: s4Time.dateStr,
      timeStr: s4Time.timeStr,
      isCompleted: elapsedDaysExact >= 5.5,
      isCurrent: status === 'out_for_delivery',
      location: `Local Express Station (${recipient.city})`,
      iconType: 'local',
    },
    {
      step: 5,
      title: 'Delivered to Recipient',
      description: `Package successfully delivered to ${recipient.name}. Strict 7-day delivery deadline fulfilled.`,
      dateStr: s5Time.dateStr,
      timeStr: s5Time.timeStr,
      isCompleted: isDelivered,
      isCurrent: status === 'delivered',
      location: `${recipient.address}, ${recipient.city}`,
      iconType: 'delivered',
    },
  ] : [
    {
      step: 1,
      title: 'Pedido Confirmado & NF-e Emitida',
      description: 'Pagamento aprovado. Fornecedor nacional parceiro reservou e faturou a mercadoria.',
      dateStr: s1Time.dateStr,
      timeStr: s1Time.timeStr,
      isCompleted: true,
      isCurrent: status === 'processing',
      location: 'Centro de Distribuição Nacional (São Paulo - SP)',
      iconType: 'order',
    },
    {
      step: 2,
      title: 'Despacho & Embalagem Lacrada',
      description: 'Produto lacrado com proteção reforçada e etiquetado para coleta pela transportadora.',
      dateStr: s2Time.dateStr,
      timeStr: s2Time.timeStr,
      isCompleted: elapsedDaysExact >= 1.2,
      isCurrent: status === 'shipped',
      location: 'Hub Central Decola Express (Barueri - SP)',
      iconType: 'box',
    },
    {
      step: 3,
      title: 'Em Trânsito Interestadual Prioritário',
      description: 'Carga em transporte rodoviário expresso rumo ao centro de distribuição de destino.',
      dateStr: s3Time.dateStr,
      timeStr: s3Time.timeStr,
      isCompleted: elapsedDaysExact >= 3,
      isCurrent: status === 'in_transit',
      location: 'Unidade de Tratamento Interestadual (Cajamar - SP)',
      iconType: 'truck',
    },
    {
      step: 4,
      title: 'Saiu para Rota de Entrega Local',
      description: `Objeto com o entregador parceiro ${courier.name} em rota até o endereço final.`,
      dateStr: s4Time.dateStr,
      timeStr: s4Time.timeStr,
      isCompleted: elapsedDaysExact >= 5.5,
      isCurrent: status === 'out_for_delivery',
      location: `Base Operacional Regional (${recipient.city})`,
      iconType: 'local',
    },
    {
      step: 5,
      title: 'Entregue ao Destinatário',
      description: `Pacote entregue e recebido com sucesso por ${recipient.name}. Prazo de 7 dias rigorosamente cumprido.`,
      dateStr: s5Time.dateStr,
      timeStr: s5Time.timeStr,
      isCompleted: isDelivered,
      isCurrent: status === 'delivered',
      location: `${recipient.address}, ${recipient.city}`,
      iconType: 'delivered',
    },
  ];

  const deliveryProtocol = `DEC-${hash.toString().slice(0, 5).padStart(5, '0')}-${new Date(createdDate.getTime() + 7 * 86400000).getFullYear()}`;

  return {
    trackingCode,
    carrier: isUsd ? 'FedEx Express Global / DHL International' : 'Decola Express / Loggi Express',
    serviceType: isUsd ? 'Priority Air Fulfillment (7 Days Delivery Guarantee)' : 'Entrega Expressa Porta a Porta (Garantia de 7 Dias)',
    status,
    statusLabel,
    statusColor,
    elapsedDays: Math.min(7, Math.max(1, elapsedDays)),
    totalDays: 7,
    daysRemaining,
    progressPercentage,
    estimatedDeliveryDate,
    dispatchDate,
    deliveredDate,
    recipientCity: recipient.city,
    recipientName: recipient.name,
    recipientAddress: recipient.address,
    originHub,
    originCountry: isUsd ? 'Estados Unidos / Europa' : 'Brasil',
    destinationCountry: isUsd ? 'Internacional' : 'Brasil',
    courierName: courier.name,
    courierVehicle: courier.vehicle,
    steps,
    isDelivered,
    deliveryProtocol,
    digitalSignature: isDelivered ? recipient.name : undefined,
    currency: isUsd ? 'USD' : 'BRL',
    shareUrl: `https://decolashop.com/rastreio?code=${trackingCode}`,
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
  if (typeof window === 'undefined') return INITIAL_DIVULGADOS;
  try {
    const key = getDivulgadosStorageKey(email);
    let raw = localStorage.getItem(key);
    
    // Fallback para chave geral caso a específica do email ainda não exista
    if (!raw) {
      raw = localStorage.getItem(STORAGE_KEY);
    }

    if (!raw) {
      localStorage.setItem(key, JSON.stringify(INITIAL_DIVULGADOS));
      return INITIAL_DIVULGADOS;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(key, JSON.stringify(INITIAL_DIVULGADOS));
      return INITIAL_DIVULGADOS;
    }
    return parsed;
  } catch (e) {
    console.error('Erro ao ler produtos divulgados do localStorage:', e);
    return INITIAL_DIVULGADOS;
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
