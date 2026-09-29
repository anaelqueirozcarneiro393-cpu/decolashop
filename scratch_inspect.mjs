import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mxukkgweuanemcgwvwdk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A";

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectProduct() {
  const { data, error } = await supabase
    .from('Product')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Product schema:", JSON.stringify(data[0], null, 2));
  }
}

inspectProduct();
