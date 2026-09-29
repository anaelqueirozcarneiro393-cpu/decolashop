// Using built-in fetch

async function testFetch() {
  const url = "https://mxukkgweuanemcgwvwdk.supabase.co/storage/v1/object/public/products/bandeira_brasil_2026.png";
  try {
    console.log("Fetching URL:", url);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    console.log("Status:", res.status);
    console.log("Headers:", Array.from(res.headers.entries()));
    
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    console.log("Byte length:", bytes.length);
    console.log("First 16 bytes:", Array.from(bytes.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    
    const contentType = res.headers.get('content-type') || '';
    console.log("Content-Type:", contentType);
    
    let isSupported = false;
    // JPEG magic bytes: FF D8 FF
    if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      isSupported = true;
      console.log("Detected: JPEG");
    }
    // PNG magic bytes: 89 50 4E 47
    else if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      isSupported = true;
      console.log("Detected: PNG");
    } else {
      console.log("Detected: UNSUPPORTED MAGIC BYTES");
    }
    
    console.log("Is Supported:", isSupported);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testFetch();
