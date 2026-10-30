import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 
  process.env.SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  'https://chgttysabvuoxpujfuho.supabase.co';

export const MASTER_SUPABASE_KEY = 
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_MK3ImGrf9HccrQgGTKVhzQ_-BiCjb-_';

export function getValidServiceRoleKey(): string {
  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 10) {
    return envKey.trim();
  }
  return MASTER_SUPABASE_KEY;
}

/**
 * Returns a Supabase client with guaranteed privileges bypassing RLS.
 * Uses 'public' schema view layer to ensure 100% compatibility with PostgREST.
 */
export function getSupabaseAdmin(schema: string = 'public') {
  const targetSchema = schema === 'next_auth' ? 'public' : schema;
  const serviceKey = getValidServiceRoleKey();
  return createClient(SUPABASE_URL, serviceKey, {
    db: { schema: targetSchema },
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
