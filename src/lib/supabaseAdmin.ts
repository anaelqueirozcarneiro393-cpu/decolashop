import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://mxukkgweuanemcgwvwdk.supabase.co';

const MASTER_SERVICE_ROLE_KEY = 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A';

export function getValidServiceRoleKey(): string {
  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (envKey && typeof envKey === 'string' && envKey.startsWith('eyJ')) {
    try {
      const parts = envKey.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        if (payload.role === 'service_role') {
          return envKey;
        }
      }
    } catch {}
  }
  return MASTER_SERVICE_ROLE_KEY;
}

/**
 * Returns a Supabase client with guaranteed service_role privileges bypassing RLS
 */
export function getSupabaseAdmin(schema: string = 'next_auth') {
  const serviceKey = getValidServiceRoleKey();
  return createClient(SUPABASE_URL, serviceKey, {
    db: { schema },
    auth: { persistSession: false }
  });
}

/**
 * Robustly saves a system token or lead lock in next_auth.verification_tokens.
 * Deletes any existing rows with the identifier first to ensure single source of truth without conflict errors.
 */
export async function saveVerificationToken(identifier: string, token: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin('next_auth');
    const expires = new Date('2099-01-01T00:00:00Z').toISOString();

    await supabase.from('verification_tokens').delete().eq('identifier', identifier);
    const { error } = await supabase.from('verification_tokens').insert({
      identifier,
      token,
      expires
    });

    if (error) {
      console.error(`[SUPABASE ADMIN] Erro ao salvar token ${identifier}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[SUPABASE ADMIN] Exceção ao salvar token ${identifier}:`, err);
    return false;
  }
}

/**
 * Robustly reads a verification token from next_auth.verification_tokens
 */
export async function loadVerificationToken(identifier: string): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin('next_auth');
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('token')
      .eq('identifier', identifier)
      .maybeSingle();

    if (error) {
      console.warn(`[SUPABASE ADMIN] Aviso ao ler token ${identifier}:`, error);
      return null;
    }
    return data?.token || null;
  } catch (err) {
    console.warn(`[SUPABASE ADMIN] Exceção ao ler token ${identifier}:`, err);
    return null;
  }
}
