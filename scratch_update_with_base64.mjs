import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = "https://mxukkgweuanemcgwvwdk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    const filePath = 'public/images/bandeira_brasil_2026.png';
    console.log(`Reading local file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`File read successfully, size: ${fileBuffer.length} bytes.`);
    
    // Check magic bytes for correct mime type
    let detectedMime = 'image/jpeg';
    if (fileBuffer.length >= 4 && fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47) {
      detectedMime = 'image/png';
    }
    
    console.log(`Detected Mime-Type: ${detectedMime}`);
    
    const base64String = fileBuffer.toString('base64');
    const dataUrl = `data:${detectedMime};base64,${base64String}`;
    
    console.log(`Base64 Data URL created. Length: ${dataUrl.length} characters.`);
    console.log(`Data URL starts with: ${dataUrl.substring(0, 50)}...`);
    
    console.log("Updating Supabase database for Product ID 75...");
    const { data, error } = await supabase
      .from('Product')
      .update({ image_url: dataUrl })
      .eq('ID', 75)
      .select();
      
    if (error) {
      throw error;
    }
    
    console.log("SUCCESS! Database updated successfully!");
    console.log("Updated row details:");
    console.log(`ID: ${data[0].ID}`);
    console.log(`Name: ${data[0].name}`);
    console.log(`Image URL length in DB: ${data[0].image_url.length}`);
    console.log(`Image URL starts with in DB: ${data[0].image_url.substring(0, 50)}...`);
    
  } catch (err) {
    console.error("Error occurred:", err);
  }
}

main();
