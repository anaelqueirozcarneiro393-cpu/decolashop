import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = "https://mxukkgweuanemcgwvwdk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A";

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    const bucketName = 'products';
    
    console.log(`Checking if bucket "${bucketName}" exists...`);
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;
    
    let bucketExists = buckets.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket "${bucketName}" does not exist. Creating it...`);
      const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });
      if (createError) throw createError;
      console.log(`Bucket "${bucketName}" created successfully!`);
    } else {
      console.log(`Bucket "${bucketName}" already exists.`);
    }
    
    // Read the local file
    const filePath = 'public/images/bandeira_brasil_2026.png';
    const fileBuffer = fs.readFileSync(filePath);
    
    console.log(`Uploading "${filePath}" to bucket "${bucketName}"...`);
    const { data: uploadData, error: uploadError } = await supabase.storage.from(bucketName).upload(
      'bandeira_brasil_2026.png',
      fileBuffer,
      {
        contentType: 'image/png',
        upsert: true
      }
    );
    
    if (uploadError) throw uploadError;
    console.log("Upload successful! Data:", uploadData);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl('bandeira_brasil_2026.png');
    console.log("Public URL:", publicUrl);
    
    // Now update the product with ID 75 in the database!
    console.log("Updating product ID 75 with the new image URL...");
    const { data: updateData, error: updateError } = await supabase
      .from('Product')
      .update({ image_url: publicUrl })
      .eq('ID', 75)
      .select();
      
    if (updateError) throw updateError;
    console.log("Successfully updated product in DB!", JSON.stringify(updateData, null, 2));
    
  } catch (err) {
    console.error("Error occurred:", err);
  }
}

main();
