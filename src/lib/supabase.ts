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
  'https://mxukkgweuanemcgwvwdk.supabase.co';

const supabaseKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDQ0NTgsImV4cCI6MjA5MzI4MDQ1OH0.cNxOVqS4lpbEcVsBxjZC-qNXasJ9hbZ1AqwE5GU8QsM';

export const supabase = createClient(supabaseUrl, supabaseKey);
