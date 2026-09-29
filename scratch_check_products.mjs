import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mxukkgweuanemcgwvwdk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
  try {
    const { data, error } = await supabase
      .from('Product')
      .select('*')
      .order('ID', { ascending: false })
      .limit(5);

    if (error) throw error;

    console.log("=== LATEST PRODUCTS IN DB ===");
    data.forEach((p, idx) => {
      console.log(`\nProduct ${idx + 1}:`);
      console.log(`ID: ${p.id || p.ID}`);
      console.log(`Name: ${p.nome_do_produto || p.name || p.title}`);
      console.log(`URL Imagem: ${p.url_imagem || p.image_url}`);
    });
  } catch (err) {
    console.error("DB error:", err);
  }
}

checkProducts();
