async function main() {
  const image = "https://mxukkgweuanemcgwvwdk.supabase.co/storage/v1/object/public/products/bandeira_brasil_2026.png";
  let fetchUrl = image;
  
  console.log("1. fetchUrl:", fetchUrl);
  
  let imageSrc = null;
  try {
    console.log("2. Launching fetch to:", fetchUrl);
    const fetchPromise = fetch(fetchUrl, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
      }
    });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Fetch timeout')), 9000)
    );
    const imgRes = await Promise.race([fetchPromise, timeoutPromise]);
    
    console.log("3. imgRes.ok:", imgRes.ok, "status:", imgRes.status);
    
    if (imgRes.ok) {
      const contentType = imgRes.headers.get('content-type') || '';
      console.log("4. contentType:", contentType);
      
      if (contentType.includes('webp') || contentType.includes('avif')) {
        console.log("5. WebP/AVIF detected, skipping...");
        imageSrc = null;
      } else {
        console.log("5. Getting arrayBuffer...");
        const buffer = await imgRes.arrayBuffer();
        console.log("6. Buffer obtained, length:", buffer.byteLength);
        
        const bytes = new Uint8Array(buffer);
        let isSupported = false;
        
        // JPEG magic bytes: FF D8 FF
        if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
          isSupported = true;
          console.log("7. JPEG magic bytes matched!");
        }
        // PNG magic bytes: 89 50 4E 47
        else if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
          isSupported = true;
          console.log("7. PNG magic bytes matched!");
        } else {
          console.log("7. Magic bytes did NOT match JPEG or PNG! Bytes:", bytes.slice(0, 4));
        }

        if (!isSupported) {
          console.warn('8. Image is not a valid JPEG/PNG (magic bytes check failed).');
          imageSrc = null;
        } else {
          const base64 = Buffer.from(buffer).toString('base64');
          imageSrc = `data:${contentType || 'image/jpeg'};base64,${base64.substring(0, 100)}...`;
          console.log("8. Success! imageSrc:", imageSrc);
        }
      }
    }
  } catch (e) {
    console.error('Error pre-fetching image for OG:', e);
    imageSrc = null;
  }
}

main();
