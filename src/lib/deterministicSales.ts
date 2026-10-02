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
  lastSavedDate?: string;
}

/**
 * Maracutaia Genial de Semente Temporal:
 * Gera um estado de vendas determinístico, hiper-realista e cronologicamente perfeito
 * baseado unicamente no e-mail do usuário e no relógio atual.
 * 
 * Se o usuário abrir no PC, no iPhone, no Android ou em Aba Anônima com o mesmo e-mail,
 * o resultado gerado será EXATAMENTE O MESMO em todos os aparelhos!
 */
export function isGerenteAccount(email: string): boolean {
  const clean = (email || '').toLowerCase().trim();
  return (
    clean === 'gerente@decolashop.com' || 
    clean === 'admin@decolashop.com' || 
    clean === 'admin' || 
    clean === 'gerente' ||
    clean.includes('gerente') ||
    clean.includes('admin')
  );
}

/**
 * Maracutaia Genial de Semente Temporal:
 * Gera um estado de vendas determinístico, hiper-realista e cronologicamente perfeito
 * baseado unicamente no e-mail do usuário e no relógio atual.
 * 
 * Se o usuário for Gerente/Admin:
 * Gera 1 semana completa de vendas registradas com faturamento diário consistente entre R$ 3.000 e R$ 5.000!
 * 
 * Se o usuário abrir no PC, no iPhone, no Android ou em Aba Anônima com o mesmo e-mail,
 * o resultado gerado será EXATAMENTE O MESMO em todos os aparelhos!
 */
export function getDeterministicBaseline(email: string, nowMs: number = Date.now()): DeterministicState {
  const isGerente = isGerenteAccount(email);
  const seed = hashEmail(email);
  const rand = mulberry32(seed);

  const catalog = mockProducts.length > 0 ? mockProducts : [
    {
      id: '1',
      name: 'Smartwatch W9 Pro Ultra Series 9 Tela Infinita',
      price: 149.90,
      image_url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '2',
      name: 'Fone Bluetooth TWS Gamer Lenovo GM2 Pro',
      price: 79.90,
      image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '3',
      name: 'Câmera Lâmpada de Segurança 360 Wifi',
      price: 89.90,
      image_url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '4',
      name: 'Mini Projetor Portátil 4K Android 11',
      price: 249.90,
      image_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '5',
      name: 'Carregador Magnético por Indução 3 em 1',
      price: 119.90,
      image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800'
    }
  ];

  // Helper para obter preço numérico de qualquer produto
  const getProductPrice = (prod: any): number => {
    let rawPrice = 149.90;
    if (typeof prod.price === 'number') {
      rawPrice = prod.price;
    } else if (typeof prod.price === 'string') {
      const cleanStr = prod.price.replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.').trim();
      rawPrice = parseFloat(cleanStr) || 149.90;
    }
    return rawPrice;
  };

  // =========================================================================
  // CENÁRIO 1: CONTA GERENTE (1 Semana Completa entre R$ 3k e 5k por dia!)
  // =========================================================================
  if (isGerente) {
    const yesterdayHourlyTemplate: Record<string, number> = {
      '00': 149.90,
      '02': 79.90,
      '04': 0.00,
      '06': 159.80,
      '08': 299.70,
      '10': 489.50,
      '12': 560.00,
      '14': 680.20,
      '16': 720.00,
      '18': 640.00,
      '20': 450.00,
      '22': 151.00,
    }; // Total Ontem = R$ 4.380,00

    const todayHourlyTemplate: Record<string, number> = {
      '00': 149.90,
      '02': 79.90,
      '04': 0.00,
      '06': 229.80,
      '08': 399.60,
      '10': 549.70,
      '12': 480.00,
      '14': 590.00,
      '16': 650.00,
      '18': 580.00,
      '20': 420.00,
      '22': 250.00,
    };

    const currentHour = new Date(nowMs).getHours();
    const currentBracket = Math.floor(currentHour / 2) * 2;

    const hourlyData: ChartHour[] = [
      '00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'
    ].map(h => {
      const hNum = parseInt(h, 10);
      const valOntem = yesterdayHourlyTemplate[h] || 0;
      const valHoje = hNum <= currentBracket ? (todayHourlyTemplate[h] || 0) : 0;
      return { hour: h, valHoje, valOntem };
    });

    const todaySalesSum = hourlyData.reduce((acc, h) => acc + (h.valHoje || 0), 0);

    // Faturamento acumulado dos 6 dias anteriores (entre 3k e 5k por dia):
    // D-6: 3.480,00
    // D-5: 4.250,00
    // D-4: 3.790,00
    // D-3: 4.890,00
    // D-2: 3.620,00
    // D-1 (Ontem): 4.380,00
    // Soma dias anteriores = R$ 24.410,00
    const pastDaysGross = 24410.00;
    const totalGross = Math.round((pastDaysGross + todaySalesSum) * 100) / 100;
    const totalCommission = Math.round(totalGross * 0.32 * 100) / 100;

    // Pedidos: ~162 pedidos nos dias anteriores + pedidos de hoje
    const todayOrders = Math.max(1, Math.round(todaySalesSum / 150));
    const totalOrders = 162 + todayOrders;
    const totalVisits = Math.round(totalOrders * 15.5);
    const totalClicks = Math.round(totalOrders * 31.2);
    const totalUnits = totalOrders + 8;

    // Gerar lista rica de ~50 transações reais nos últimos 7 dias
    const recentSales: SaleItem[] = [];

    // Helper para gerar vendas de um determinado dia
    const addSalesForDay = (daysAgo: number, count: number, startHour: number, endHour: number) => {
      const dayDate = new Date(nowMs - daysAgo * 86400000);
      const isToday = daysAgo === 0;
      const isYesterday = daysAgo === 1;

      for (let s = 0; s < count; s++) {
        const prod = catalog[Math.floor(rand() * catalog.length)];
        const rawPrice = getProductPrice(prod);
        const comm = Math.round(rawPrice * 0.32 * 100) / 100;

        let saleHour = startHour + Math.floor(rand() * (endHour - startHour + 1));
        let saleMinute = Math.floor(rand() * 59);

        // Se for hoje, a venda não pode ser no futuro em relação ao relógio atual
        if (isToday) {
          if (saleHour > currentHour) {
            saleHour = Math.max(0, currentHour - 1);
          }
          if (saleHour === currentHour) {
            const currentMin = new Date(nowMs).getMinutes();
            saleMinute = Math.max(0, Math.min(saleMinute, Math.max(0, currentMin - 4)));
          }
        }

        const saleTimestamp = new Date(
          dayDate.getFullYear(),
          dayDate.getMonth(),
          dayDate.getDate(),
          saleHour,
          saleMinute
        ).getTime();

        const hh = String(saleHour).padStart(2, '0');
        const mm = String(saleMinute).padStart(2, '0');

        let formattedTime = '';
        if (isToday) {
          formattedTime = `Hoje, ${hh}:${mm}`;
        } else if (isYesterday) {
          formattedTime = `Ontem, ${hh}:${mm}`;
        } else {
          const dd = String(dayDate.getDate()).padStart(2, '0');
          const mo = String(dayDate.getMonth() + 1).padStart(2, '0');
          formattedTime = `${dd}/${mo}, ${hh}:${mm}`;
        }

        const txSeed = Math.floor(1000 + rand() * 8999);
        recentSales.push({
          id: `TX-${txSeed}`,
          product: prod.name || (prod as any).title || 'Produto DecolaShop',
          value: rawPrice,
          commission: comm,
          time: formattedTime,
          timestamp: saleTimestamp,
          image: prod.image_url,
        });
      }
    };

    // Hoje: Vendas acumuladas nas horas já decorridas
    const todaySalesCount = Math.max(2, Math.min(10, Math.floor(currentHour / 2) + 2));
    addSalesForDay(0, todaySalesCount, 0, Math.min(currentHour, 22));

    // Ontem: 11 vendas
    addSalesForDay(1, 11, 7, 22);

    // 2 dias atrás: 8 vendas
    addSalesForDay(2, 8, 8, 22);

    // 3 dias atrás: 9 vendas
    addSalesForDay(3, 9, 8, 22);

    // 4 dias atrás: 7 vendas
    addSalesForDay(4, 7, 8, 21);

    // 5 dias atrás: 8 vendas
    addSalesForDay(5, 8, 8, 22);

    // 6 dias atrás: 7 vendas
    addSalesForDay(6, 7, 9, 21);

    // Ordena do mais recente para o mais antigo
    recentSales.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    return {
      vendasTotais: totalGross,
      saldoDisponivel: totalCommission,
      visitas: totalVisits,
      cliques: totalClicks,
      pedidos: totalOrders,
      unidades: totalUnits,
      hourlyData,
      recentSales,
      lastActiveTimestamp: nowMs,
      lastSavedDate: new Date(nowMs).toDateString(),
    };
  }

  // =========================================================================
  // CENÁRIO 2: CONTAS DE MEMBROS / USUÁRIOS REAIS (Começam 100% Zeradas!)
  // =========================================================================
  // Somente a conta de Gerente possui histórico demonstrativo pré-populado.
  // Contas de membros e novos usuários iniciam com seu histórico REAL:
  // zero vendas, zero pedidos, zero comissões e lista de transações limpa.
  // Elas acumulam dados apenas a partir do momento em que o usuário utiliza a plataforma.
  const cleanHourly: ChartHour[] = [
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

  return {
    vendasTotais: 0,
    saldoDisponivel: 0,
    visitas: 0,
    cliques: 0,
    pedidos: 0,
    unidades: 0,
    hourlyData: cleanHourly,
    recentSales: [],
    lastActiveTimestamp: nowMs,
    lastSavedDate: new Date(nowMs).toDateString(),
  };
}
