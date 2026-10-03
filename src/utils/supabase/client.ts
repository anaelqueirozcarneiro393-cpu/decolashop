import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  "https://mxukkgweuanemcgwvwdk.supabase.co";

const supabaseKey = 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MDQ0NTgsImV4cCI6MjA5MzI4MDQ1OH0.cNxOVqS4lpbEcVsBxjZC-qNXasJ9hbZ1AqwE5GU8QsM";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
