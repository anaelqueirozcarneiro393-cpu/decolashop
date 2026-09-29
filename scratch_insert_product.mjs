import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mxukkgweuanemcgwvwdk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A";

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertProduct() {
  const newProduct = {
    name: "Bandeira do Brasil Copa do Mundo 2026 150x105cm",
    price: 39.90,
    url: "https://shopee.com.br/Bandeira-do-Brasil-Copa-do-Mundo-2026-150x105cm-i.101234.56789",
    image_url: "/images/bandeira_brasil_2026.png",
    hype_score: 9.8,
    description: "Prepare-se para o Hexa com a bandeira oficial do Brasil para a Copa do Mundo de 2026. Sendo um dos maiores virais e tendências de venda da Shopee, este produto oferece alta margem de lucro e forte apelo emocional. Fabricada em poliéster premium leve e resistente, com cores vivas e costura dupla reforçada de alta qualidade."
  };

  console.log("Inserting product into Supabase:", newProduct);

  const { data, error } = await supabase
    .from('Product')
    .insert([newProduct])
    .select();

  if (error) {
    console.error("Error inserting product:", error);
  } else {
    console.log("Successfully inserted product!", JSON.stringify(data, null, 2));
  }
}

insertProduct();
