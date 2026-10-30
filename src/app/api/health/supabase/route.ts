import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, getValidServiceRoleKey } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// Diagnóstico da conexão com o Supabase. Não expõe chaves nem dados, só status.
function describeKey(key: string | undefined): string {
  if (!key) return 'ausente';
  if (key.startsWith('sb_secret_')) return 'secret (sb_secret_)';
  if (key.startsWith('sb_publishable_')) return 'publishable (sb_publishable_) — SEM privilégio de admin';
  if (key.startsWith('eyJ')) {
    try {
      const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString('utf8'));
      return `JWT role=${payload.role} ref=${payload.ref}`;
    } catch {
      return 'JWT inválido';
    }
  }
  return 'formato desconhecido';
}

async function checkTable(key: string, table: string) {
  const client = createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
  const { data, error } = await client.from(table).select('*').limit(1);
  if (error) return { ok: false, error: `${error.code ?? ''} ${error.message}`.trim() };
  return { ok: true, rowsVisible: (data?.length ?? 0) > 0 };
}

export async function GET() {
  const adminKey = getValidServiceRoleKey();
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';

  const tables = ['users', 'verification_tokens', 'Product'];
  const admin: Record<string, unknown> = {};
  const publicAccess: Record<string, unknown> = {};

  for (const t of tables) {
    try { admin[t] = await checkTable(adminKey, t); } catch (e) { admin[t] = { ok: false, error: String(e) }; }
  }
  // Tabelas sensíveis NÃO deveriam ser legíveis com a chave pública
  for (const t of ['users', 'verification_tokens']) {
    if (!publicKey) break;
    try { publicAccess[t] = await checkTable(publicKey, t); } catch (e) { publicAccess[t] = { ok: false, error: String(e) }; }
  }

  const adminKeyType = describeKey(adminKey);
  const warnings: string[] = [];
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) warnings.push('SUPABASE_SERVICE_ROLE_KEY não definida no ambiente');
  if (adminKey.startsWith('sb_publishable_') || adminKey === publicKey) {
    warnings.push('Cliente admin está usando a chave PÚBLICA — gravações no servidor serão bloqueadas pelo RLS');
  }
  for (const [t, r] of Object.entries(publicAccess)) {
    if ((r as { rowsVisible?: boolean }).rowsVisible) warnings.push(`Tabela "${t}" está legível com a chave pública (vazamento de dados)`);
  }

  return NextResponse.json({
    vercelEnv: process.env.VERCEL_ENV ?? null,
    gitBranch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    // Só os NOMES das variáveis (nunca os valores), pra achar erro de digitação
    supabaseEnvNames: Object.keys(process.env).filter((k) => /SUPABASE|SERVICE/i.test(k)),
    url: SUPABASE_URL,
    adminKeyType,
    publicKeyType: describeKey(publicKey),
    admin,
    publicAccess,
    warnings,
    healthy: warnings.length === 0 && Object.values(admin).every((r) => (r as { ok: boolean }).ok),
  });
}
