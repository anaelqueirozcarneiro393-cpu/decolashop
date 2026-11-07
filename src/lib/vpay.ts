/**
 * Cliente Oficial da API VPay
 * Documentação: https://vpay-api.onrender.com/api
 */

let vpayCachedToken: { token: string; expiresAt: number; keyHash: string } | null = null;

/**
 * Obtém o token de acesso Bearer da VPay com cache inteligente em memória (1 hora)
 */
export async function getVPayAccessToken(
  apiKey: string,
  apiSecret: string,
  baseUrl: string = 'https://vpay-api.onrender.com/api'
): Promise<string> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const keyHash = `${apiKey}:${apiSecret}`;
  const now = Date.now();

  // Reutiliza token se ainda tiver pelo menos 2 minutos de validade
  if (vpayCachedToken && vpayCachedToken.keyHash === keyHash && vpayCachedToken.expiresAt > now + 120_000) {
    return vpayCachedToken.token;
  }

  const res = await fetch(`${cleanBase}/v1/auth/token`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'x-api-secret': apiSecret,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Falha de autenticação VPay (HTTP ${res.status}): ${errText || res.statusText}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('VPay não retornou access_token.');
  }

  const expiresInMs = (data.expires_in || 3600) * 1000;
  vpayCachedToken = {
    token: data.access_token,
    expiresAt: now + expiresInMs,
    keyHash
  };

  return data.access_token;
}

/**
 * Consulta saldo da conta VPay
 */
export async function getVPaySaldo(
  apiKey: string,
  apiSecret: string,
  baseUrl: string = 'https://vpay-api.onrender.com/api'
) {
  const token = await getVPayAccessToken(apiKey, apiSecret, baseUrl);
  const cleanBase = baseUrl.replace(/\/+$/, '');

  const res = await fetch(`${cleanBase}/v1/saldo`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Falha ao consultar saldo VPay (HTTP ${res.status}): ${errText}`);
  }

  return await res.json();
}
