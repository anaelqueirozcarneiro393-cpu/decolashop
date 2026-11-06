import { loadVerificationToken, saveVerificationToken } from '@/lib/supabaseAdmin';

export type GatewayType = 'sigilopay' | 'mercadopago' | 'asaas' | 'efipay' | 'pix_direto';

export interface SigiloPayConfig {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
}

export interface MercadoPagoConfig {
  accessToken: string;
  publicKey?: string;
}

export interface AsaasConfig {
  apiKey: string;
  environment: 'production' | 'sandbox';
}

export interface EfiPayConfig {
  clientId: string;
  clientSecret: string;
  pixKey: string;
}

export interface PixDiretoConfig {
  chavePix: string;
  tipoChave: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  nomeTitular: string;
  cidade: string;
}

export interface GatewaySystemConfig {
  activeGateway: GatewayType;
  smartFailover: boolean;
  fallbackGateway: GatewayType;
  lastSwitchedAt: string;
  switchedBy: string;
  gateways: {
    sigilopay: SigiloPayConfig;
    mercadopago: MercadoPagoConfig;
    asaas: AsaasConfig;
    efipay: EfiPayConfig;
    pix_direto: PixDiretoConfig;
  };
}

const DEFAULT_CONFIG: GatewaySystemConfig = {
  activeGateway: 'sigilopay',
  smartFailover: true,
  fallbackGateway: 'pix_direto',
  lastSwitchedAt: new Date().toISOString(),
  switchedBy: 'Sistema',
  gateways: {
    sigilopay: {
      publicKey: process.env.SIGILOPAY_PUBLIC_KEY || 'kaiofredy2908_1cmq6fd3bmq2s24u',
      secretKey: process.env.SIGILOPAY_SECRET_KEY || 'tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze',
      baseUrl: process.env.SIGILOPAY_BASE_URL || 'https://app.sigilopay.com.br',
    },
    mercadopago: {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
    },
    asaas: {
      apiKey: process.env.ASAAS_API_KEY || '',
      environment: 'production',
    },
    efipay: {
      clientId: process.env.EFIPAY_CLIENT_ID || '',
      clientSecret: process.env.EFIPAY_CLIENT_SECRET || '',
      pixKey: process.env.EFIPAY_PIX_KEY || '',
    },
    pix_direto: {
      chavePix: process.env.PIX_EMERGENCIA_CHAVE || 'financeiro@decolashop.com',
      tipoChave: 'email',
      nomeTitular: 'DECOLASHOP TECNOLOGIA LTDA',
      cidade: 'SAO PAULO',
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
      const merged: GatewaySystemConfig = {
        ...DEFAULT_CONFIG,
        ...parsed,
        gateways: {
          ...DEFAULT_CONFIG.gateways,
          ...(parsed.gateways || {}),
          sigilopay: {
            ...DEFAULT_CONFIG.gateways.sigilopay,
            ...(parsed.gateways?.sigilopay || {}),
          },
          mercadopago: {
            ...DEFAULT_CONFIG.gateways.mercadopago,
            ...(parsed.gateways?.mercadopago || {}),
          },
          asaas: {
            ...DEFAULT_CONFIG.gateways.asaas,
            ...(parsed.gateways?.asaas || {}),
          },
          efipay: {
            ...DEFAULT_CONFIG.gateways.efipay,
            ...(parsed.gateways?.efipay || {}),
          },
          pix_direto: {
            ...DEFAULT_CONFIG.gateways.pix_direto,
            ...(parsed.gateways?.pix_direto || {}),
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
  const updated: GatewaySystemConfig = {
    ...current,
    ...newConfig,
    lastSwitchedAt: new Date().toISOString(),
    switchedBy: userEmail,
    gateways: {
      ...current.gateways,
      ...(newConfig.gateways || {}),
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

// =========================================================================
// GERADOR NATIVO DE PIX EMV (PADRÃO BANCO CENTRAL DO BRASIL / BACEN)
// =========================================================================

/**
 * Calcula CRC16 CCITT padrão Pix BACEN
 */
function crc16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function emvField(id: string, value: string): string {
  const length = String(value.length).padStart(2, '0');
  return `${id}${length}${value}`;
}

/**
 * Gera Payload Pix Copia e Cola Oficial (BR Code padrão BACEN)
 */
export function generateBacemPixPayload({
  chavePix,
  nomeTitular,
  cidade,
  valor,
  transactionId,
}: {
  chavePix: string;
  nomeTitular: string;
  cidade: string;
  valor: number;
  transactionId: string;
}): string {
  const cleanKey = chavePix.trim();
  const cleanName = (nomeTitular || 'DECOLASHOP')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 25);
  const cleanCity = (cidade || 'SAO PAULO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 15);
  const cleanTxId = (transactionId || 'DECOLA')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 25);
  const formattedAmount = valor.toFixed(2);

  // Payload Format Indicator
  let payload = emvField('00', '01');

  // Point of Initiation Method: 12 = Dinâmico, 11 = Estático
  payload += emvField('01', '12');

  // Merchant Account Information (GUI + Chave)
  const gui = emvField('00', 'BR.GOV.BCB.PIX');
  const key = emvField('01', cleanKey);
  payload += emvField('26', `${gui}${key}`);

  // Merchant Category Code: 0000 (Geral)
  payload += emvField('52', '0000');

  // Transaction Currency: 986 = BRL
  payload += emvField('53', '986');

  // Transaction Amount
  payload += emvField('54', formattedAmount);

  // Country Code: BR
  payload += emvField('58', 'BR');

  // Merchant Name
  payload += emvField('59', cleanName);

  // Merchant City
  payload += emvField('60', cleanCity);

  // Additional Data Field Template (TxId)
  const txIdField = emvField('05', cleanTxId);
  payload += emvField('62', txIdField);

  // CRC16 inicializador
  const withoutCrc = `${payload}6304`;
  const checksum = crc16(withoutCrc);

  return `${withoutCrc}${checksum}`;
}
