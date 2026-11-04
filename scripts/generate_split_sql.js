const fs = require('fs');
const path = require('path');

const dump = JSON.parse(fs.readFileSync(path.join(__dirname, 'full_db_dump.json'), 'utf-8'));

function sqlVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  const str = String(v).replace(/'/g, "''");
  return `'${str}'`;
}

function sqlDate(v) {
  if (v === null || v === undefined) return 'NULL';
  return `'${new Date(v).toISOString()}'`;
}

function getHeader() {
  return `-- ==============================================================================
-- DECOLASHOP SAAS - SCHEMA E PERMISSÕES (SUPABASE: chgttysabvuoxpujfuho)
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS next_auth;

CREATE TABLE IF NOT EXISTS next_auth.users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    plan TEXT DEFAULT 'free',
    plan_expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS next_auth.accounts (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT
);

CREATE TABLE IF NOT EXISTS next_auth.sessions (
    id TEXT PRIMARY KEY,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

GRANT USAGE ON SCHEMA next_auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA next_auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA next_auth TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA next_auth GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA next_auth GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

ALTER TABLE next_auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.verification_tokens DISABLE ROW LEVEL SECURITY;

CREATE OR REPLACE VIEW public.users AS SELECT * FROM next_auth.users;
CREATE OR REPLACE VIEW public.verification_tokens AS SELECT * FROM next_auth.verification_tokens;

`;
}

// 1. Core Part (Parte 1: Schemas + Users + Accounts + Sessions + 185 Sales + Leads + Affiliates)
let p1 = getHeader();

p1 += `-- -----------------------------------------------------------------------------\n`;
p1 += `-- 212 USUÁRIOS (176 CLIENTES PAGANTES REAIS COM SENHAS E PLANOS PRESERVADOS)\n`;
p1 += `-- -----------------------------------------------------------------------------\n`;
for (const u of dump.tables.users) {
  const emailVer = u.emailVerified ? sqlDate(u.emailVerified) : 'NULL';
  const planExp = u.plan_expires_at ? sqlDate(u.plan_expires_at) : 'NULL';
  p1 += `INSERT INTO next_auth.users (id, name, email, "emailVerified", image, plan, plan_expires_at)
VALUES (${sqlVal(u.id)}, ${sqlVal(u.name)}, ${sqlVal(u.email)}, ${emailVer}, ${sqlVal(u.image)}, ${sqlVal(u.plan)}, ${planExp})
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  "emailVerified" = EXCLUDED."emailVerified",
  image = EXCLUDED.image,
  plan = EXCLUDED.plan,
  plan_expires_at = EXCLUDED.plan_expires_at;\n`;
}

p1 += `\n-- -----------------------------------------------------------------------------\n`;
p1 += `-- ACCOUNTS E SESSIONS\n`;
p1 += `-- -----------------------------------------------------------------------------\n`;
for (const a of dump.tables.accounts) {
  p1 += `INSERT INTO next_auth.accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
VALUES (${sqlVal(a.id)}, ${sqlVal(a.userId)}, ${sqlVal(a.type)}, ${sqlVal(a.provider)}, ${sqlVal(a.providerAccountId)}, ${sqlVal(a.refresh_token)}, ${sqlVal(a.access_token)}, ${sqlVal(a.expires_at)}, ${sqlVal(a.token_type)}, ${sqlVal(a.scope)}, ${sqlVal(a.id_token)}, ${sqlVal(a.session_state)})
ON CONFLICT (id) DO NOTHING;\n`;
}
for (const s of dump.tables.sessions) {
  p1 += `INSERT INTO next_auth.sessions (id, "sessionToken", "userId", expires)
VALUES (${sqlVal(s.id)}, ${sqlVal(s.sessionToken)}, ${sqlVal(s.userId)}, ${sqlDate(s.expires)})
ON CONFLICT (id) DO NOTHING;\n`;
}

const criticalTokenPrefixes = ['affiliate_sale:', 'lead_affiliate:', 'affiliate:', 'system:', 'sync_state:', 'account_created:', 'divulgados:'];

const criticalTokens = [];
const otherTokens = [];

for (const t of dump.tables.verification_tokens) {
  const id = t.identifier || '';
  if (criticalTokenPrefixes.some(p => id.startsWith(p))) {
    criticalTokens.push(t);
  } else {
    otherTokens.push(t);
  }
}

p1 += `\n-- -----------------------------------------------------------------------------\n`;
p1 += `-- TOKENS CRÍTICOS: TODAS AS 185 VENDAS DE AFILIADOS, LEADS, AFILIADOS E SISTEMA (${criticalTokens.length} registros)\n`;
p1 += `-- -----------------------------------------------------------------------------\n`;
for (const t of criticalTokens) {
  p1 += `INSERT INTO next_auth.verification_tokens (identifier, token, expires)
VALUES (${sqlVal(t.identifier)}, ${sqlVal(t.token)}, ${sqlDate(t.expires)})
ON CONFLICT (identifier, token) DO UPDATE SET expires = EXCLUDED.expires;\n`;
}

const p1Path = path.join(__dirname, 'PARTE_1_ESSENCIAL_MIGRACAO.sql');
fs.writeFileSync(p1Path, p1, 'utf-8');
console.log(`Parte 1 gerada com sucesso: ${p1Path} (${(fs.statSync(p1Path).size / 1024).toFixed(1)} KB)`);

// 2. Parte 2: Pending Pix & claims
let p2 = `-- ==============================================================================
-- DECOLASHOP SAAS - PARTE 2: HISTÓRICO DE PIX PENDENTES (${otherTokens.length} registros)
-- Execute este arquivo após executar a Parte 1
-- ==============================================================================

`;

for (const t of otherTokens) {
  p2 += `INSERT INTO next_auth.verification_tokens (identifier, token, expires)
VALUES (${sqlVal(t.identifier)}, ${sqlVal(t.token)}, ${sqlDate(t.expires)})
ON CONFLICT (identifier, token) DO UPDATE SET expires = EXCLUDED.expires;\n`;
}

const p2Path = path.join(__dirname, 'PARTE_2_PIX_PENDENTES.sql');
fs.writeFileSync(p2Path, p2, 'utf-8');
console.log(`Parte 2 gerada com sucesso: ${p2Path} (${(fs.statSync(p2Path).size / 1024 / 1024).toFixed(2)} MB)`);
