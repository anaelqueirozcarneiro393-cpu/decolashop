import { loadVerificationToken, saveVerificationToken } from '@/lib/supabaseAdmin';

export type GatewayType = 'sigilopay' | 'cnpay' | 'vpay';

export interface SigiloPayConfig {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
}

export interface CNPayConfig {
  publicKey?: string;
  apiKey?: string;
  secretKey: string;
  baseUrl: string;
}

export interface VPayConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

export interface GatewaySystemConfig {
  activeGateway: GatewayType;
  smartFailover: boolean;
  fallbackGateway: GatewayType;
  lastSwitchedAt: string;
  switchedBy: string;
  gateways: {
    sigilopay: SigiloPayConfig;
    cnpay: CNPayConfig;
    vpay: VPayConfig;
  };
}

const DEFAULT_CONFIG: GatewaySystemConfig = {
  activeGateway: 'sigilopay',
  smartFailover: true,
  fallbackGateway: 'cnpay',
  lastSwitchedAt: new Date().toISOString(),
  switchedBy: 'Sistema',
  gateways: {
    sigilopay: {
      publicKey: process.env.SIGILOPAY_PUBLIC_KEY || 'kaiofredy2908_1cmq6fd3bmq2s24u',
      secretKey: process.env.SIGILOPAY_SECRET_KEY || 'tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze',
      baseUrl: process.env.SIGILOPAY_BASE_URL || 'https://app.sigilopay.com.br',
    },
    cnpay: {
      publicKey: process.env.CNPAY_PUBLIC_KEY || 'iamironman2001m_fo5jmrxbcscjli5u',
      apiKey: process.env.CNPAY_API_KEY || 'iamironman2001m_fo5jmrxbcscjli5u',
      secretKey: process.env.CNPAY_SECRET_KEY || 'wucvyumqql79c74kl08a94ezjeep8bbkg3a81ti3je2girowkxdvqby6czfz0j6n',
      baseUrl: process.env.CNPAY_BASE_URL || 'https://painel.appcnpay.com/api/v1',
    },
    vpay: {
      clientId: process.env.VPAY_CLIENT_ID || '',
      clientSecret: process.env.VPAY_CLIENT_SECRET || '',
      baseUrl: process.env.VPAY_BASE_URL || 'https://api.vpay.com.br',
    },
  },
};

const TOKEN_IDENTIFIER = 'system:gateway_config';
let memoryCache: { config: GatewaySystemConfig; timestamp: number } | null = null;
const CACHE_TTL_MS = 10_000; // 10 segundos de cache para ultra-performance

/**
 * Carrega as configurações ativas do gateway do Supabase (com cache em memória e fallback)
 */
export async function getGatewayConfig(): Promise<GatewaySystemConfig> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.config;
  }

  try {
    const raw = await loadVerificationToken(TOKEN_IDENTIFIER);
    if (raw) {
      const parsed = JSON.parse(raw);
      const validGateways: GatewayType[] = ['sigilopay', 'cnpay', 'vpay'];
      const activeGateway: GatewayType = validGateways.includes(parsed.activeGateway) 
        ? parsed.activeGateway 
        : 'sigilopay';
      const fallbackGateway: GatewayType = validGateways.includes(parsed.fallbackGateway)
        ? parsed.fallbackGateway
        : 'cnpay';

      const merged: GatewaySystemConfig = {
        ...DEFAULT_CONFIG,
        ...parsed,
        activeGateway,
        fallbackGateway,
        gateways: {
          sigilopay: {
            ...DEFAULT_CONFIG.gateways.sigilopay,
            ...(parsed.gateways?.sigilopay || {}),
          },
          cnpay: {
            ...DEFAULT_CONFIG.gateways.cnpay,
            ...(parsed.gateways?.cnpay || {}),
          },
          vpay: {
            ...DEFAULT_CONFIG.gateways.vpay,
            ...(parsed.gateways?.vpay || {}),
          },
        },
      };

      memoryCache = { config: merged, timestamp: now };
      return merged;
    }
  } catch (err) {
    console.warn('[GATEWAY CONFIG] Falha ao ler configuração do Supabase, usando padrão:', err);
  }

  memoryCache = { config: DEFAULT_CONFIG, timestamp: now };
  return DEFAULT_CONFIG;
}

/**
 * Salva e persiste a nova configuração de gateway no Supabase
 */
export async function saveGatewayConfig(
  newConfig: Partial<GatewaySystemConfig>,
  userEmail: string = 'gerente@decolashop.com'
): Promise<GatewaySystemConfig> {
  const current = await getGatewayConfig();
  const validGateways: GatewayType[] = ['sigilopay', 'cnpay', 'vpay'];
  
  const activeGateway = newConfig.activeGateway && validGateways.includes(newConfig.activeGateway)
    ? newConfig.activeGateway
    : current.activeGateway;

  const fallbackGateway = newConfig.fallbackGateway && validGateways.includes(newConfig.fallbackGateway)
    ? newConfig.fallbackGateway
    : current.fallbackGateway;

  const updated: GatewaySystemConfig = {
    ...current,
    ...newConfig,
    activeGateway,
    fallbackGateway,
    lastSwitchedAt: new Date().toISOString(),
    switchedBy: userEmail,
    gateways: {
      sigilopay: {
        ...current.gateways.sigilopay,
        ...(newConfig.gateways?.sigilopay || {}),
      },
      cnpay: {
        ...current.gateways.cnpay,
        ...(newConfig.gateways?.cnpay || {}),
      },
      vpay: {
        ...current.gateways.vpay,
        ...(newConfig.gateways?.vpay || {}),
      },
    },
  };

  try {
    await saveVerificationToken(TOKEN_IDENTIFIER, JSON.stringify(updated));
    memoryCache = { config: updated, timestamp: Date.now() };
    console.log(`[GATEWAY CONFIG] Gateway ativo alterado para [${updated.activeGateway}] por ${userEmail}`);
  } catch (err) {
    console.error('[GATEWAY CONFIG] Erro ao persistir configuração no Supabase:', err);
  }

  return updated;
}

/**
 * Limpa o cache em memória (útil após atualizações)
 */
export function invalidateGatewayCache(): void {
  memoryCache = null;
}
