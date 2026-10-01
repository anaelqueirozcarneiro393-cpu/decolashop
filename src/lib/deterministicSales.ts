import { mockProducts, Product } from './mockData';
import { ChartHour, SaleItem } from './salesContext';

// PRNG clássico e ultra rápido (Mulberry32) para geração determinística baseada em semente
function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Gera um hash numérico estável a partir de qualquer string (ex: e-mail do usuário)
export function hashEmail(email: string): number {
  let clean = (email || 'default_user@decolashop.com').toLowerCase().trim();
  // Transferência / Alias: gerente@decolashop.com e admin@decolashop.com compartilham a mesma semente matemática
  if (clean === 'gerente@decolashop.com' || clean === 'admin' || clean === 'gerente') {
    clean = 'admin@decolashop.com';
  }
  let hash = 2166136261;
  for (let i = 0; i < clean.length; i++) {
    hash ^= clean.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export interface DeterministicState {
  vendasTotais: number;
  saldoDisponivel: number;
  visitas: number;
  cliques: number;
  pedidos: number;
  unidades: number;
  hourlyData: ChartHour[];
  recentSales: SaleItem[];
  lastActiveTimestamp: number;
}

/**
 * Maracutaia Genial de Semente Temporal:
 * Gera um estado de vendas determinístico, hiper-realista e cronologicamente perfeito
 * baseado unicamente no e-mail do usuário e no relógio atual.
 * 
 * Se o usuário abrir no PC, no iPhone, no Android ou em Aba Anônima com o mesmo e-mail,
 * o resultado gerado será EXATAMENTE O MESMO em todos os aparelhos!
 */
export function getDeterministicBaseline(email: string, nowMs: number = Date.now()): DeterministicState {
  const seed = hashEmail(email);
  const rand = mulberry32(seed);

  // A loja começou entre 24 e 40 horas atrás, de forma fixa para aquele e-mail
  const hoursAgo = 26 + (rand() * 14); // 26 a 40 horas
  const startTime = nowMs - (hoursAgo * 3600 * 1000);

  // Quantidade de vendas base acumuladas (entre 12 e 20 vendas)
  const salesCount = Math.floor(12 + rand() * 8);

  // Gráficos limpos
  const hourlyData: ChartHour[] = [
    { hour: '00', valHoje: 0, valOntem: 0 },
    { hour: '02', valHoje: 0, valOntem: 0 },
    { hour: '04', valHoje: 0, valOntem: 0 },
    { hour: '06', valHoje: 0, valOntem: 0 },
    { hour: '08', valHoje: 0, valOntem: 0 },
    { hour: '10', valHoje: 0, valOntem: 0 },
    { hour: '12', valHoje: 0, valOntem: 0 },
    { hour: '14', valHoje: 0, valOntem: 0 },
    { hour: '16', valHoje: 0, valOntem: 0 },
    { hour: '18', valHoje: 0, valOntem: 0 },
    { hour: '20', valHoje: 0, valOntem: 0 },
    { hour: '22', valHoje: 0, valOntem: 0 },
  ];

  const recentSales: SaleItem[] = [];
  let totalGross = 0;
  let totalCommission = 0;

  const catalog = mockProducts.length > 0 ? mockProducts : [
    {
      id: '1',
      name: 'Smartwatch W9 Pro Ultra Series 9',
      price: 149.90,
      image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '2',
      name: 'Fone Bluetooth TWS Gamer Lenovo GM2 Pro',
      price: 79.90,
      image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const totalDuration = nowMs - startTime - (4 * 60 * 1000); // última venda foi há ~4 min
  const step = totalDuration / salesCount;

  for (let i = 0; i < salesCount; i++) {
    // Jitter pseudo-aleatório com a semente
    const jitter = (rand() - 0.5) * 0.45 * step;
    const saleTimeMs = startTime + (i + 0.5) * step + jitter;
    const saleDate = new Date(saleTimeMs);

    // Produto determinístico
    const prodIndex = Math.floor(rand() * catalog.length);
    const prod = catalog[prodIndex];

    let rawPrice = 149.90;
    if (typeof prod.price === 'number') {
      rawPrice = prod.price;
    } else if (typeof prod.price === 'string') {
      const clean = prod.price.replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.').trim();
      rawPrice = parseFloat(clean) || 149.90;
    }
    const comm = Math.round(rawPrice * 0.32 * 100) / 100;

    totalGross += rawPrice;
    totalCommission += comm;

    // Formatação de data / hora do evento
    const isToday = saleDate.toDateString() === new Date(nowMs).toDateString();
    const isYesterday = saleDate.toDateString() === new Date(nowMs - 86400000).toDateString();
    const hh = String(saleDate.getHours()).padStart(2, '0');
    const mm = String(saleDate.getMinutes()).padStart(2, '0');

    let formattedTime = '';
    if (isToday) {
      formattedTime = `Hoje, ${hh}:${mm}`;
    } else if (isYesterday) {
      formattedTime = `Ontem, ${hh}:${mm}`;
    } else {
      const dd = String(saleDate.getDate()).padStart(2, '0');
      const mo = String(saleDate.getMonth() + 1).padStart(2, '0');
      formattedTime = `${dd}/${mo}, ${hh}:${mm}`;
    }

    const txIdSeed = Math.floor(1000 + rand() * 8999);
    recentSales.push({
      id: `TX-${txIdSeed}`,
      product: prod.name || (prod as any).title || 'Produto DecolaShop',
      value: rawPrice,
      commission: comm,
      time: formattedTime,
      image: prod.image_url,
    });

    // Gráfico horário
    const bracketHour = String(Math.floor(saleDate.getHours() / 2) * 2).padStart(2, '0');
    const hourSlot = hourlyData.find(h => h.hour === bracketHour);
    if (hourSlot) {
      if (isToday) {
        hourSlot.valHoje = Math.round(((hourSlot.valHoje || 0) + rawPrice) * 100) / 100;
      } else if (isYesterday) {
        hourSlot.valOntem = Math.round(((hourSlot.valOntem || 0) + rawPrice) * 100) / 100;
      }
    }
  }

  // Ordena vendas das mais recentes para as mais antigas
  recentSales.reverse();

  const totalClicks = salesCount * 8 + Math.floor(rand() * 15);
  const totalVisits = salesCount * 5 + Math.floor(rand() * 10);

  return {
    vendasTotais: Math.round(totalGross * 100) / 100,
    saldoDisponivel: Math.round(totalCommission * 100) / 100,
    visitas: totalVisits,
    cliques: totalClicks,
    pedidos: salesCount,
    unidades: salesCount,
    hourlyData,
    recentSales: recentSales.slice(0, 25),
    lastActiveTimestamp: nowMs,
  };
}
