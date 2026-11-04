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

let sql = `-- ==============================================================================
-- DECOLASHOP SAAS - MIGRAÇÃO COMPLETA PARA chgttysabvuoxpujfuho
-- 100% DOS DADOS: 212 USUÁRIOS (176 CLIENTES PAGANTES), 185 VENDAS, TODAS COMISSÕES
-- ==============================================================================

-- 1. Criação do Schema next_auth
CREATE SCHEMA IF NOT EXISTS next_auth;

-- 2. Tabela next_auth.users
CREATE TABLE IF NOT EXISTS next_auth.users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    plan TEXT DEFAULT 'free',
    plan_expires_at TIMESTAMPTZ
);

-- 3. Tabela next_auth.accounts
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

-- 4. Tabela next_auth.sessions
CREATE TABLE IF NOT EXISTS next_auth.sessions (
    id TEXT PRIMARY KEY,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL
);

-- 5. Tabela next_auth.verification_tokens
CREATE TABLE IF NOT EXISTS next_auth.verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- 6. Garantir permissões completas para anon e service_role
GRANT USAGE ON SCHEMA next_auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA next_auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA next_auth TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA next_auth GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA next_auth GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- 7. Desabilitar ou configurar RLS permissivo para next_auth
ALTER TABLE next_auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE next_auth.verification_tokens DISABLE ROW LEVEL SECURITY;

-- 8. Views de compatibilidade pública caso algum serviço busque no schema public
CREATE OR REPLACE VIEW public.users AS SELECT * FROM next_auth.users;
CREATE OR REPLACE VIEW public.verification_tokens AS SELECT * FROM next_auth.verification_tokens;

-- ==============================================================================
-- INSERÇÃO DE DADOS
-- ==============================================================================

`;

// Users
sql += `-- INSERINDO 212 USUÁRIOS (176 CLIENTES REAIS/PAGANTES)\n`;
for (const u of dump.tables.users) {
  const emailVer = u.emailVerified ? sqlDate(u.emailVerified) : 'NULL';
  const planExp = u.plan_expires_at ? sqlDate(u.plan_expires_at) : 'NULL';
  sql += `INSERT INTO next_auth.users (id, name, email, "emailVerified", image, plan, plan_expires_at)
VALUES (${sqlVal(u.id)}, ${sqlVal(u.name)}, ${sqlVal(u.email)}, ${emailVer}, ${sqlVal(u.image)}, ${sqlVal(u.plan)}, ${planExp})
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  "emailVerified" = EXCLUDED."emailVerified",
  image = EXCLUDED.image,
  plan = EXCLUDED.plan,
  plan_expires_at = EXCLUDED.plan_expires_at;\n`;
}

// Accounts
sql += `\n-- INSERINDO ACCOUNTS\n`;
for (const a of dump.tables.accounts) {
  sql += `INSERT INTO next_auth.accounts (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
VALUES (${sqlVal(a.id)}, ${sqlVal(a.userId)}, ${sqlVal(a.type)}, ${sqlVal(a.provider)}, ${sqlVal(a.providerAccountId)}, ${sqlVal(a.refresh_token)}, ${sqlVal(a.access_token)}, ${sqlVal(a.expires_at)}, ${sqlVal(a.token_type)}, ${sqlVal(a.scope)}, ${sqlVal(a.id_token)}, ${sqlVal(a.session_state)})
ON CONFLICT (id) DO NOTHING;\n`;
}

// Sessions
sql += `\n-- INSERINDO SESSIONS\n`;
for (const s of dump.tables.sessions) {
  sql += `INSERT INTO next_auth.sessions (id, "sessionToken", "userId", expires)
VALUES (${sqlVal(s.id)}, ${sqlVal(s.sessionToken)}, ${sqlVal(s.userId)}, ${sqlDate(s.expires)})
ON CONFLICT (id) DO NOTHING;\n`;
}

// Verification Tokens
sql += `\n-- INSERINDO 2.909 VERIFICATION TOKENS (INCLUINDO AS 185 VENDAS E TODOS OS AFILIADOS)\n`;
for (const t of dump.tables.verification_tokens) {
  sql += `INSERT INTO next_auth.verification_tokens (identifier, token, expires)
VALUES (${sqlVal(t.identifier)}, ${sqlVal(t.token)}, ${sqlDate(t.expires)})
ON CONFLICT (identifier, token) DO UPDATE SET expires = EXCLUDED.expires;\n`;
}

const outPath = path.join(__dirname, 'migrate_to_chgttysabvuoxpujfuho.sql');
fs.writeFileSync(outPath, sql, 'utf-8');
console.log(`Generated SQL script at: ${outPath} (${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB)`);
