export interface OrderBumpItem {
  id: string;
  tag: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  originalPrice: number;
  price: number;
  icon: string;
}

export const ORDER_BUMPS_CATALOG: OrderBumpItem[] = [
  {
    id: 'bump_fornecedores',
    tag: '🔥 87% DOS ALUNOS LEVAM',
    title: 'Lista Secreta: 50 Maiores Fornecedores Nacionais (Despacho 24h)',
    shortDesc: 'WhatsApp direto dos importadores do Brás, Santa Ifigênia e SC com estoque no Brasil.',
    fullDesc: 'Acesso imediato à lista secreta e verificada de 50 fornecedores com produtos a preço de fábrica, sem risco de taxas de importação e com despacho em até 24 horas.',
    originalPrice: 97.00,
    price: 19.90,
    icon: 'Truck'
  },
  {
    id: 'bump_criativos',
    tag: '⚡ MAIS VENDIDO',
    title: 'Pack 120+ Vídeos & Criativos Virais do TikTok Shop e Shopee',
    shortDesc: 'Vídeos prontos gravados em alta definição sem marca d\'água prontos para rodar.',
    fullDesc: 'Biblioteca completa com mais de 120 criativos virais validados, sem marca d\'água, com roteiros persuasivos e prontos para publicar nas suas redes ou usar em anúncios.',
    originalPrice: 67.00,
    price: 14.90,
    icon: 'Film'
  },
  {
    id: 'bump_bot_telegram',
    tag: '💎 ALERTA ANTECIPADO',
    title: 'Robô Espião VIP: Alertas de Produtos Minerados no Telegram',
    shortDesc: 'Receba alertas instantâneos no seu celular sempre que um produto começar a viralizar.',
    fullDesc: 'Canal exclusivo no Telegram monitorado 24 horas por robôs com inteligência artificial que detectam tendências em ascensão rápida antes da concorrência.',
    originalPrice: 147.00,
    price: 27.90,
    icon: 'Bot'
  }
];

export const ALL_BUMP_IDS = ORDER_BUMPS_CATALOG.map(b => b.id);

export function getUserUnlockedBumps(session?: any): string[] {
  if (typeof window === 'undefined') return [];

  // Admin always has all order bumps unlocked
  const email = session?.user?.email?.toLowerCase() || '';
  if (email.includes('admin') || email === 'admin@decolashop.com') {
    return ALL_BUMP_IDS;
  }

  const sessionBumps: string[] = session?.user?.order_bumps || [];
  let localBumps: string[] = [];

  try {
    const raw = localStorage.getItem('decolashop_unlocked_bumps');
    if (raw) {
      localBumps = JSON.parse(raw);
    }
  } catch {
    localBumps = [];
  }

  // Combine unique bumps
  const combined = Array.from(new Set([...sessionBumps, ...localBumps]));
  return combined;
}

export function hasOrderBump(bumpId: string, session?: any): boolean {
  const email = session?.user?.email?.toLowerCase() || '';
  if (email.includes('admin') || email === 'admin@decolashop.com') {
    return true;
  }
  const unlocked = getUserUnlockedBumps(session);
  return unlocked.includes(bumpId);
}

export function unlockOrderBumpsLocally(bumpIds: string | string[]): void {
  if (typeof window === 'undefined') return;
  const current = getUserUnlockedBumps();
  const toAdd = Array.isArray(bumpIds) ? bumpIds : [bumpIds];
  const updated = Array.from(new Set([...current, ...toAdd]));
  localStorage.setItem('decolashop_unlocked_bumps', JSON.stringify(updated));
  // Dispatch custom event so all active components react immediately
  window.dispatchEvent(new Event('decolashop_bumps_updated'));
}
