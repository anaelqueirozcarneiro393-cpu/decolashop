import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isSafeImageUrl } from '@/lib/security';

// Bypass SSL/TLS unauthorized errors only in development environment
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Force dynamic execution to prevent caching in App Router
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Produto Exclusivo';
    const price = searchParams.get('price') || 'Sob Consulta';
    const image = searchParams.get('image');

    // Decode URL components
    const decodedTitle = decodeURIComponent(title);
    const decodedPrice = decodeURIComponent(price);
    
    // Clean title to remove emojis and special characters that cause Satori to hang fetching fonts
    const cleanTitle = decodedTitle.replace(/[^\p{L}\p{N}\s\-.,!?&()']/gu, '').trim() || 'Produto Exclusivo';
    
    let fetchUrl = image || '';
    
    // Suporte a caminhos relativos adicionando o origin da requisição
    if (fetchUrl.startsWith('/')) {
      const origin = new URL(req.url).origin;
      fetchUrl = `${origin}${fetchUrl}`;
    }

    // SSRF Prevention: Validate external image URL
    if (fetchUrl && !fetchUrl.startsWith('data:') && !isSafeImageUrl(fetchUrl)) {
      console.warn(`[SECURITY] SSRF attempt or invalid image URL blocked: ${fetchUrl}`);
      fetchUrl = '';
    }
    
    // Força URLs do Cloudinary a retornarem JPG (Satori não suporta WebP)
    if (fetchUrl.includes('res.cloudinary.com') && !fetchUrl.includes('f_jpg')) {
      fetchUrl = fetchUrl.replace('/upload/', '/upload/f_jpg/');
    }

    // Auto-convert webp/avif extensions to .jpg to trick ML/AliExpress CDNs into returning JPEGs (which Satori supports)
    if (fetchUrl.includes('.webp')) {
      fetchUrl = fetchUrl.replace(/\.webp($|\?)/, '.jpg$1');
    }
    if (fetchUrl.includes('.avif')) {
      fetchUrl = fetchUrl.replace(/\.avif($|\?)/, '.jpg$1');
    }

    let imageSrc = null;
    if (image && image !== 'null' && image !== 'undefined' && image !== 'N/A' && image !== '') {
      // 0. DIRECT BASE64 DATA URL BYPASS:
      // If the image is already a Base64 data URL, we use it directly!
      if (image.startsWith('data:')) {
        imageSrc = image;
      }
      // 1. DIRECT LOCAL FILESYSTEM BYPASS:
      // If the image is the Brazilian flag or a local relative path, we read it instantly from disk.
      // This completely bypasses any local dev network, SSL, or timeout issues!
      try {
        let isLocalBypass = false;
        let localFilename = '';
        
        if (fetchUrl.includes('bandeira_brasil_2026.png')) {
          isLocalBypass = true;
          localFilename = 'bandeira_brasil_2026.png';
        } else if (fetchUrl.includes('/images/')) {
          isLocalBypass = true;
          const rawName = fetchUrl.split('/images/')[1]?.split('?')[0] || '';
          localFilename = path.basename(rawName); // Strips directory traversal (../, ..\)
        }
        
        if (isLocalBypass && localFilename) {
          const imagesDir = path.resolve(process.cwd(), 'public', 'images');
          const localPath = path.resolve(imagesDir, localFilename);
          
          // Strict Path Traversal Defense: Ensure file strictly resides inside public/images
          if (localPath.startsWith(imagesDir) && fs.existsSync(localPath)) {
            const buffer = fs.readFileSync(localPath);
            const base64 = buffer.toString('base64');
            
            // Check magic bytes for correct mime type
            let detectedMime = 'image/jpeg';
            if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
              detectedMime = 'image/png';
            }
            
            imageSrc = `data:${detectedMime};base64,${base64}`;
            console.log(`SUCCESS: Loaded image "${localFilename}" artificially from local disk!`);
          }
        }
      } catch (localErr) {
        console.error("Local disk bypass failed, falling back to fetch:", localErr);
      }

      // 2. STANDARD FETCH FALLBACK:
      // If the local disk bypass did not run or succeed, fetch it over the network
      if (!imageSrc) {
        try {
          console.log(`Pre-fetching image for ad template: ${fetchUrl}`);
          const fetchPromise = fetch(fetchUrl, { 
            headers: { 
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            }
          });
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Fetch timeout')), 9000)
          );
          const imgRes = await Promise.race([fetchPromise, timeoutPromise]) as Response;
          
          if (imgRes.ok) {
            const contentType = imgRes.headers.get('content-type') || '';
            if (contentType.includes('webp') || contentType.includes('avif')) {
              console.warn('Skipping WebP/AVIF image as Satori does not support them.');
              imageSrc = null;
            } else {
              const bufferPromise = imgRes.arrayBuffer();
              const bufferTimeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Buffer timeout')), 9000)
              );
              const buffer = await Promise.race([bufferPromise, bufferTimeout]) as ArrayBuffer;
              
              const bytes = new Uint8Array(buffer);
              
              // Check magic bytes for JPEG or PNG to prevent Satori from crashing
              let isSupported = false;
              let detectedMime = contentType;
              // JPEG magic bytes: FF D8 FF
              if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
                isSupported = true;
                detectedMime = 'image/jpeg';
              }
              // PNG magic bytes: 89 50 4E 47
              else if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
                isSupported = true;
                detectedMime = 'image/png';
              }

              if (!isSupported) {
                console.warn('Image is not a valid JPEG/PNG (magic bytes check failed). Skipping to prevent Satori crash.');
                imageSrc = null;
              } else {
                // Use Buffer for efficient base64 conversion
                const base64 = Buffer.from(buffer).toString('base64');
                imageSrc = `data:${detectedMime};base64,${base64}`;
                console.log(`Successfully loaded image with mime-type ${detectedMime} for background`);
              }
            }
          }
        } catch (e) {
          console.error('Error pre-fetching image for OG:', e);
          imageSrc = null;
        }
      }
    }


    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            backgroundColor: '#09090b', // Zinc 950 fallback
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Main Background Image (Product + AI Environment) */}
          {imageSrc ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(to bottom, #27272a 0%, #09090b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: '#71717a',
                letterSpacing: '2px',
              }}
            >
              PRODUTO PREMIUM
            </div>
          )}

          {/* Elegant dark gradient overlay at the bottom to ensure text readability */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '500px',
              backgroundImage: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0) 100%)',
              display: 'flex',
            }}
          />

          {/* Ad Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '60px',
              width: '100%',
              zIndex: 10,
              marginBottom: '20px',
            }}
          >
            {/* Minimalist Top Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(212, 175, 55, 0.15)', // Gold with opacity
                color: '#d4af37', // Gold
                border: '1px solid rgba(212, 175, 55, 0.4)',
                padding: '12px 30px',
                borderRadius: '100px',
                fontSize: '22px',
                fontWeight: '600',
                letterSpacing: '3px',
                marginBottom: '30px',
                textTransform: 'uppercase',
                backdropFilter: 'blur(10px)',
              }}
            >
              OFERTA EXCLUSIVA
            </div>

            {/* Title - Elegant Layout */}
            <div
              style={{
                fontSize: '56px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '20px',
                maxWidth: '900px',
                textAlign: 'center',
                lineHeight: 1.2,
                letterSpacing: '-1px',
                textShadow: '0 4px 20px rgba(0,0,0,0.8)',
              }}
            >
              {cleanTitle.length > 65 ? cleanTitle.substring(0, 65) + '...' : cleanTitle}
            </div>
            
            {/* Price */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d4af37', // Gold
                fontSize: '72px',
                fontWeight: '800',
                letterSpacing: '-2px',
                textShadow: '0 0 40px rgba(212, 175, 55, 0.4), 0 4px 20px rgba(0,0,0,0.8)',
              }}
            >
              R$ {decodedPrice}
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    );
  } catch (e: any) {
    console.error('Error generating image:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
