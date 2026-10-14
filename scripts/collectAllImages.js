const fs = require('fs');
const path = require('path');

async function main() {
  console.log('--- Collecting 2,600+ Unique Image URLs ---');
  const uniqueUrls = new Set();
  const list = [];

  function addUrl(url, category) {
    if (!url || typeof url !== 'string') return false;
    const clean = url.trim();
    if (uniqueUrls.has(clean)) return false;
    uniqueUrls.add(clean);
    list.push({ url: clean, category: category || 'Geral' });
    return true;
  }

  // 1. Existing verified Unsplash images from codebase
  try {
    const mockContent = fs.readFileSync(path.join(__dirname, '../src/lib/mockData.ts'), 'utf8') +
                        fs.readFileSync(path.join(__dirname, '../src/lib/supplierCatalogData.ts'), 'utf8') +
                        fs.readFileSync(path.join(__dirname, '../src/lib/internationalCatalogData.ts'), 'utf8');
    const matches = mockContent.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-\_\=\&\?\.\%]+/g) || [];
    for (const m of matches) {
      const clean = m.split('&item=')[0].split('?')[0] + '?auto=format&fit=crop&q=80&w=800';
      addUrl(clean, 'Eletrônicos');
    }
    console.log(`[1] Codebase Unsplash added: ${list.length}`);
  } catch (e) {
    console.error('Error reading codebase unsplash:', e.message);
  }

  // 2. DummyJSON Products Images (~470 clean product images)
  try {
    const res = await fetch('https://dummyjson.com/products?limit=194');
    const data = await res.json();
    for (const p of (data.products || [])) {
      const cat = p.category || 'Geral';
      if (Array.isArray(p.images)) {
        for (const img of p.images) {
          addUrl(img, cat);
        }
      } else if (p.thumbnail) {
        addUrl(p.thumbnail, cat);
      }
    }
    console.log(`[2] After DummyJSON: ${list.length}`);
  } catch (e) {
    console.error('Error fetching DummyJSON:', e.message);
  }

  // 3. Devtools-Tech Ecommerce Sample Data (~250 products)
  try {
    const res = await fetch('https://raw.githubusercontent.com/Devtools-Tech-Team/sample-data-api/main/ecommerce.json');
    const data = await res.json();
    for (const p of (data.products || [])) {
      if (p.image) addUrl(p.image, p.category || 'Geral');
    }
    console.log(`[3] After Devtools-Tech: ${list.length}`);
  } catch (e) {
    console.error('Error fetching Devtools-Tech:', e.message);
  }

  // 4. Platzi Fake Store API (~120 products)
  try {
    const res = await fetch('https://api.escuelajs.co/api/v1/products?offset=0&limit=200');
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const p of data) {
        if (Array.isArray(p.images)) {
          for (const img of p.images) {
            let clean = img.replace(/[\[\]"]/g, '').trim();
            if (clean.startsWith('http')) {
              addUrl(clean, p.category?.name || 'Geral');
            }
          }
        }
      }
    }
    console.log(`[4] After Platzi Store: ${list.length}`);
  } catch (e) {
    console.error('Error fetching Platzi:', e.message);
  }

  // 5. Picsum Photos (993 unique verified photos)
  try {
    for (let page = 1; page <= 11; page++) {
      const res = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=100`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      for (const item of data) {
        if (item.id) {
          const url = `https://picsum.photos/id/${item.id}/700/700`;
          addUrl(url, 'Casa & Decoração');
        }
      }
    }
    console.log(`[5] After Picsum: ${list.length}`);
  } catch (e) {
    console.error('Error fetching Picsum:', e.message);
  }

  // 6. Wikimedia Commons Product Search (50 images per query)
  const WIKI_QUERIES = [
    { q: 'smartwatch', cat: 'Eletrônicos' },
    { q: 'headphones', cat: 'Eletrônicos' },
    { q: 'earphones', cat: 'Eletrônicos' },
    { q: 'microphone', cat: 'Setup Gamer' },
    { q: 'camera digital', cat: 'Eletrônicos' },
    { q: 'wristwatch', cat: 'Moda & Acessórios' },
    { q: 'sneakers shoes', cat: 'Moda & Acessórios' },
    { q: 'backpack', cat: 'Moda & Acessórios' },
    { q: 'kitchen cookware', cat: 'Cozinha & Utilidades' },
    { q: 'electric kettle', cat: 'Cozinha & Utilidades' },
    { q: 'coffee machine', cat: 'Cozinha & Utilidades' },
    { q: 'table lamp', cat: 'Casa & Decoração' },
    { q: 'bicycle helmet', cat: 'Esportes & Fitness' },
    { q: 'yoga mat', cat: 'Esportes & Fitness' },
    { q: 'dumbbell', cat: 'Esportes & Fitness' },
    { q: 'tools hammer pliers', cat: 'Ferramentas' },
    { q: 'cordless drill', cat: 'Ferramentas' },
    { q: 'sunglasses', cat: 'Moda & Acessórios' },
    { q: 'game controller gamepad', cat: 'Setup Gamer' },
    { q: 'computer mouse', cat: 'Setup Gamer' },
    { q: 'drone quadcopter', cat: 'Eletrônicos' },
    { q: 'perfume bottle', cat: 'Beleza & Cuidados' },
    { q: 'cosmetics lotion', cat: 'Beleza & Cuidados' },
    { q: 'dog collar leash', cat: 'Pet Shop' },
    { q: 'car dashboard accessory', cat: 'Automotivo' }
  ];

  for (const wq of WIKI_QUERIES) {
    if (list.length >= 2700) break;
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(wq.q + ' filetype:bitmap')}&gsrlimit=50&gsrnamespace=6&prop=imageinfo&iiprop=url`;
      const res = await fetch(url, { headers: { 'User-Agent': 'DecolaShopApp/1.0 (contact@decolashop.com)' } });
      const data = await res.json();
      const pages = Object.values(data.query?.pages || {});
      let addedInBatch = 0;
      for (const p of pages) {
        const u = p.imageinfo?.[0]?.url;
        if (u && (u.endsWith('.jpg') || u.endsWith('.png') || u.endsWith('.jpeg')) && !u.includes('Albert-L%C3%A1szl%C3%B3')) {
          if (addUrl(u, wq.cat)) addedInBatch++;
        }
      }
      console.log(`[6] Wikimedia (${wq.q}): added ${addedInBatch}, total now ${list.length}`);
    } catch (e) {
      console.error(`Error fetching wiki ${wq.q}:`, e.message);
    }
  }

  console.log(`\n========================================`);
  console.log(`Total unique image URLs collected: ${list.length}`);
  console.log(`========================================\n`);

  const outDir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outDir, 'collectedImageUrls.json'), JSON.stringify(list, null, 2), 'utf8');
  console.log(`Saved to src/data/collectedImageUrls.json successfully!`);
}

main();
