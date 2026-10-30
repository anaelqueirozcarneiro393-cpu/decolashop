import { createClient } from '@supabase/supabase-js';

function extractUrlFromDatabaseUrl(dbUrl?: string): string | null {
  if (!dbUrl) return null;
  // Matches postgresql://postgres:pass@db.[ref].supabase.co:5432/postgres
  const match = dbUrl.match(/@db\.([a-z0-9]+)\.supabase\.co/i);
  if (match && match[1]) {
    return `https://${match[1]}.supabase.co`;
  }
  return null;
}

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  extractUrlFromDatabaseUrl(process.env.DATABASE_URL) ||
  'https://chgttysabvuoxpujfuho.supabase.co';

const supabaseKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_MK3ImGrf9HccrQgGTKVhzQ_-BiCjb-_';

export const supabase = createClient(supabaseUrl, supabaseKey);
