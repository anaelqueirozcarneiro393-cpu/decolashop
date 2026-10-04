export interface OrderBumpItem {
  id: string;
  tag: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  originalPrice: number;
  price: number;
  icon: string;
  image: string;
}

export const ORDER_BUMPS_CATALOG: OrderBumpItem[] = [
  {
    id: 'bump_curso',
    tag: '🎓 20 AULAS PRÁTICAS',
    title: 'Curso Completo',
    shortDesc: 'Curso Completo com 20 aulas explicando de forma bem didática para você aprender absolutamente tudo sobre a ferramenta',
    fullDesc: 'Curso Completo com 20 aulas explicando de forma bem didática para você aprender absolutamente tudo sobre a ferramenta. Domine cada recurso da plataforma.',
    originalPrice: 37.54,
    price: 29.90,
    icon: 'GraduationCap',
    image: '/images/bump-curso-completo.jpg'
  },
  {
    id: 'bump_acompanhamento',
    tag: '⭐ SUPORTE 24H',
    title: 'Acompanhamento - 1 ano',
    shortDesc: 'Acompanhamento Completo por 1 especialista durante 1 ano - 24h',
    fullDesc: 'Acompanhamento Completo por 1 especialista durante 1 ano - 24h. Tire dúvidas diárias e tenha um estrategista guiando suas campanhas.',
    originalPrice: 75.21,
    price: 59.90,
    icon: 'Headphones',
    image: '/images/bump-acompanhamento-1ano.jpg'
  },
  {
    id: 'bump_acelerador',
    tag: '🚀 30 VENDAS EM 48H',
    title: 'Acelerador de Vendas',
    shortDesc: 'Conte com uma IA que acelerará suas vendas garantindo 30 vendas nas primeiras 48h!',
    fullDesc: 'Conte com uma IA que acelerará suas vendas garantindo 30 vendas nas primeiras 48h! Algoritmo proprietário de tráfego e conversão automática.',
    originalPrice: 50.10,
    price: 39.90,
    icon: 'Rocket',
    image: '/images/bump-acelerador-vendas.jpg'
  }
];

export const ALL_BUMP_IDS = ORDER_BUMPS_CATALOG.map(b => b.id);

export const VIDEO_IA_BUMP: OrderBumpItem = {
  id: 'bump_gerador_videos_ia',
  tag: '⚡ ACESSO VITALÍCIO',
  title: 'Gerador de Vídeos com IA (Vitalício)',
  shortDesc: 'Crie vídeos virais de alta conversão para TikTok, Reels e Shorts em segundos com IA.',
  fullDesc: 'Crie vídeos virais de alta conversão para TikTok, Reels e Shorts em segundos com IA. Inclui narração neural ultra-realista em português, legendas automáticas e exportação 1080p 60FPS.',
  originalPrice: 97.00,
  price: 27.90,
  icon: 'Film',
  image: '/images/bump-gerador-ia.jpg'
};

export function getUserUnlockedBumps(session?: any): string[] {
  if (typeof window === 'undefined') return [];

  // Gerente / Admin e especificamente as contas usuario@decolashop.com e Carlos Souza têm todas as ferramentas liberadas
  const email = session?.user?.email?.toLowerCase() || '';
  const role = ((session?.user as any)?.role || '').toLowerCase();
  const isCarlos = email === 'carlos.souza@decolashop.com' || email === 'carlos@decolashop.com';
  if (
    email === 'usuario@decolashop.com' ||
    isCarlos ||
    email.includes('admin') || 
    email.includes('gerente') || 
    role === 'gerente' || 
    role === 'admin'
  ) {
    return [...ALL_BUMP_IDS, 'bump_gerador_videos_ia', 'bump_bot_telegram', 'bump_fornecedores', 'bump_criativos'];
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

  if (localStorage.getItem('decolashop_unlocked_video_ia') === 'true') {
    localBumps.push('bump_gerador_videos_ia');
  }

  // Combine unique bumps
  const combined = Array.from(new Set([...sessionBumps, ...localBumps]));
  return combined;
}

export function hasOrderBump(bumpId: string, session?: any): boolean {
  const email = session?.user?.email?.toLowerCase() || '';
  const role = ((session?.user as any)?.role || '').toLowerCase();
  const isCarlos = email === 'carlos.souza@decolashop.com' || email === 'carlos@decolashop.com';
  if (
    email === 'usuario@decolashop.com' ||
    isCarlos ||
    email.includes('admin') || 
    email.includes('gerente') || 
    role === 'gerente' || 
    role === 'admin'
  ) {
    return true;
  }

  if (bumpId === 'bump_gerador_videos_ia') {
    if (typeof window !== 'undefined' && localStorage.getItem('decolashop_unlocked_video_ia') === 'true') {
      return true;
    }
  }

  const unlocked = getUserUnlockedBumps(session);
  if (unlocked.includes(bumpId)) return true;

  // Legacy mappings for backwards-compatibility:
  if (bumpId === 'bump_bot_telegram' && unlocked.includes('bump_acelerador')) return true;
  if (bumpId === 'bump_fornecedores' && unlocked.includes('bump_acompanhamento')) return true;
  if (bumpId === 'bump_criativos' && (unlocked.includes('bump_acelerador') || unlocked.includes('bump_curso'))) return true;

  return false;
}

export function unlockOrderBumpsLocally(bumpIds: string | string[]): void {
  if (typeof window === 'undefined') return;
  const current = getUserUnlockedBumps();
  const toAdd = Array.isArray(bumpIds) ? bumpIds : [bumpIds];
  const updated = Array.from(new Set([...current, ...toAdd]));
  localStorage.setItem('decolashop_unlocked_bumps', JSON.stringify(updated));
  if (toAdd.includes('bump_gerador_videos_ia')) {
    localStorage.setItem('decolashop_unlocked_video_ia', 'true');
  }
  // Dispatch custom event so all active components react immediately
  window.dispatchEvent(new Event('decolashop_bumps_updated'));
}
