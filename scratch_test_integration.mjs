import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mxukkgweuanemcgwvwdk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log("Fetching Product ID 75 from Supabase...");
    const { data: products, error } = await supabase
      .from('Product')
      .select('*')
      .eq('ID', 75);
      
    if (error) throw error;
    
    const product = products[0];
    console.log("Successfully fetched product:", product.name);
    console.log("Image URL Length in product:", product.image_url.length);
    
    // Now let's call our local dev server API using this product data!
    // We will start the dev server task first to make sure it's running
    const apiUrl = `http://localhost:3000/api/ad-image?title=${encodeURIComponent(product.name)}&price=${encodeURIComponent(product.price)}&image=${encodeURIComponent(product.image_url)}`;
    
    console.log("Calling API endpoint...");
    const start = Date.now();
    const res = await fetch(apiUrl);
    const duration = Date.now() - start;
    
    console.log("API Response Status:", res.status);
    console.log("API Response Content-Type:", res.headers.get("content-type"));
    console.log(`API call finished in ${duration}ms.`);
    
    if (res.status === 200) {
      console.log("SUCCESS! The API successfully processed the Base64 image and generated the ad!");
    } else {
      console.log("API returned error. Body snippet:", (await res.text()).substring(0, 300));
    }
  } catch (err) {
    console.error("Integration test error:", err);
  }
}

main();
