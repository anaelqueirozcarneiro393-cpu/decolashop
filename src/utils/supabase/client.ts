import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  "https://chgttysabvuoxpujfuho.supabase.co";

const supabaseKey = 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "sb_publishable_MK3ImGrf9HccrQgGTKVhzQ_-BiCjb-_";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
