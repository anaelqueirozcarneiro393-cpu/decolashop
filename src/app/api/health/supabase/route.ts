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

  // Vendas: colunas usadas pelo checkout, teste de gravação e contagem de registros
  const db = createClient(SUPABASE_URL, adminKey, { auth: { persistSession: false } });
  const sales: Record<string, unknown> = {};

  const { error: colsErr } = await db.from('users').select('plan, plan_expires_at').limit(1);
  sales.usersPlanColumns = colsErr ? { ok: false, error: `${colsErr.code ?? ''} ${colsErr.message}`.trim() } : { ok: true };

  const { count: paidUsers, error: paidErr } = await db
    .from('users').select('email', { count: 'exact', head: true }).in('plan', ['monthly', 'lifetime']);
  sales.paidUsers = paidErr ? `erro: ${paidErr.message}` : paidUsers;

  const testId = `healthcheck:${Date.now()}`;
  const { error: insErr } = await db.from('verification_tokens')
    .insert({ identifier: testId, token: 'ok', expires: new Date(Date.now() + 60000).toISOString() });
  const { error: delErr } = await db.from('verification_tokens').delete().eq('identifier', testId);
  sales.writeTest = insErr || delErr
    ? { ok: false, error: `${(insErr || delErr)!.code ?? ''} ${(insErr || delErr)!.message}`.trim() }
    : { ok: true };

  // Mesmo upsert usado pelo checkout, com um e-mail de teste que é apagado em seguida
  const testEmail = `healthcheck-${Date.now()}@example.invalid`;
  const { error: upErr } = await db.from('users').upsert(
    { email: testEmail, name: 'healthcheck', plan: 'free', plan_expires_at: new Date().toISOString(), image: '{}' },
    { onConflict: 'email' }
  );
  await db.from('users').delete().eq('email', testEmail);
  sales.usersUpsertTest = upErr
    ? { ok: false, error: `${upErr.code ?? ''} ${upErr.message}`.trim(), details: upErr.details, hint: upErr.hint }
    : { ok: true };

  for (const prefix of ['affiliate', 'affiliate_sale', 'pending_pix', 'lead_affiliate']) {
    const { count, error } = await db.from('verification_tokens')
      .select('identifier', { count: 'exact', head: true }).like('identifier', `${prefix}:%`);
    sales[prefix] = error ? `erro: ${error.message}` : count;
  }

  const { data: lastHook } = await db.from('verification_tokens')
    .select('token').eq('identifier', 'system:last_sigilopay_webhook').maybeSingle();
  sales.lastWebhook = lastHook?.token ? JSON.parse(lastHook.token) : 'nenhum webhook recebido desde este deploy';

  const adminKeyType = describeKey(adminKey);
  const warnings: string[] = [];
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) warnings.push('SUPABASE_SERVICE_ROLE_KEY não definida no ambiente');
  if (adminKey.startsWith('sb_publishable_') || adminKey === publicKey) {
    warnings.push('Cliente admin está usando a chave PÚBLICA — gravações no servidor serão bloqueadas pelo RLS');
  }
  if (!(sales.usersPlanColumns as { ok: boolean }).ok) warnings.push('Tabela users sem colunas plan/plan_expires_at — clientes pagos não são salvos');
  if (!(sales.usersUpsertTest as { ok: boolean }).ok) warnings.push('Falha ao gravar cliente em users — pagamentos aprovados não viram clientes');
  if (!(sales.writeTest as { ok: boolean }).ok) warnings.push('Falha ao gravar em verification_tokens — vendas e afiliados não são salvos');
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
    sales,
    warnings,
    healthy: warnings.length === 0 && Object.values(admin).every((r) => (r as { ok: boolean }).ok),
  });
}
