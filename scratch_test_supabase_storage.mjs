import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = "https://mxukkgweuanemcgwvwdk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log("Checking buckets...");
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError);
      return;
    }
    console.log("Buckets:", buckets);
  } catch (err) {
    console.error("Error in main:", err);
  }
}

main();
