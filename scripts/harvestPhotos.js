const fs = require('fs');
const path = require('path');

const QUERIES = [
  // Tech & Eletrônicos
  'smartwatch', 'smartband', 'earbuds', 'wireless headphones', 'bluetooth speaker',
  'gamer mouse', 'mechanical keyboard', 'microphone streaming', 'webcam 4k', 'drone 4k',
  'action camera', 'tripod phone', 'ring light', 'portable projector', 'power bank',
  'fast charger', 'usb c hub', 'external ssd', 'graphics tablet', 'vr headset',
  'security camera wifi', 'smart plug', 'led desk lamp', 'airtag holder', 'car phone mount',
  
  // Cozinha & Utilidades
  'air fryer', 'electric kettle', 'coffee grinder', 'espresso cup', 'blender portable',
  'knife set', 'frying pan granite', 'food container glass', 'spice rack', 'water bottle vacuum',
  'silicone spatula', 'manual food chopper', 'wine opener electric', 'baking dish', 'thermos bottle',
  'vegetable peeler', 'salad spinner', 'kitchen scale digital', 'ice cube tray silicone', 'lunch box bento',

  // Casa & Decoração
  'diffuser aroma', 'scented candle', 'ambient lamp', 'cushion velvet', 'throw blanket',
  'wall clock modern', 'vase ceramic', 'indoor plant pot', 'fairy lights led', 'humidifier ultrasonic',
  'storage basket', 'closet organizer', 'doormat aesthetic', 'jewelry box velvet', 'desk organizer wood',
  'mirror led touch', 'curtain blackout', 'picture frame minimalist', 'incense holder', 'foam soap dispenser',

  // Beleza & Cuidados
  'face serum', 'moisturizer cream', 'sunscreen fluid', 'skincare jade roller', 'facial cleanser',
  'hair oil argan', 'hair dryer ionic', 'hair straightener ceramic', 'beard trimmer electric', 'perfume bottle',
  'lip gloss', 'eyeshadow palette', 'makeup brush set', 'body lotion', 'exfoliating scrub',
  'face mask clay', 'manicure set', 'electric toothbrush', 'water flosser dental', 'bath salts lavender',

  // Esportes & Fitness
  'yoga mat', 'resistance bands set', 'dumbbell neoprene', 'jump rope digital', 'massage gun deep tissue',
  'running shoes sneakers', 'sports duffel bag', 'cycling helmet', 'fitness tracker', 'compression knee sleeve',
  'ab roller wheel', 'pull up bar doorway', 'protein shaker bottle', 'swimming goggles', 'boxing gloves',
  'hydration pack running', 'exercise ball balance', 'ankle weights', 'gym towel microfiber', 'foam roller muscle',

  // Moda & Acessórios
  'leather wallet rfid', 'crossbody bag nylon', 'minimalist backpack', 'polarized sunglasses', 'stainless steel watch',
  'casual sneakers', 'canvas tote bag', 'baseball cap aesthetic', 'waterproof duffle bag', 'anti theft backpack',
  'card holder slim', 'fanny pack sling', 'bucket hat streetwear', 'wool beanie winter', 'automatic umbrella',

  // Setup Gamer & Geek
  'rgb gaming headset', 'gaming mouse pad xxl', 'headphone stand rgb', 'gamepad controller wireless', 'monitor light bar',
  'cable management sleeve', 'mechanical keycaps pbt', 'microphone boom arm', 'ergonomic footrest', 'screen cleaning kit',

  // Automotivo & Ferramentas
  'car vacuum portable', 'tire inflator portable', 'dash cam front rear', 'car diffuser solar', 'scratch repair car',
  'multitool pliers', 'cordless screwdriver', 'laser measure tape', 'precision screwdriver set', 'safety glasses work',

  // Pet Care
  'dog harness no pull', 'cat scratching post', 'pet water fountain', 'automatic pet feeder', 'dog leash reflective',
  'pet grooming brush', 'cat laser toy', 'dog dental chew', 'pet travel bag', 'portable dog water bottle'
];

async function harvest() {
  console.log(`Starting photo harvest across ${QUERIES.length} queries...`);
  const uniquePhotos = new Map(); // id -> { id, url, query }

  for (let i = 0; i < QUERIES.length; i++) {
    const q = QUERIES[i];
    if (uniquePhotos.size >= 2700) {
      console.log(`Reached ${uniquePhotos.size} photos, stopping.`);
      break;
    }

    for (let page = 1; page <= 3; page++) {
      if (uniquePhotos.size >= 2700) break;
      try {
        const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(q)}&per_page=30&page=${page}`;
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!res.ok) {
          if (res.status === 429) {
            console.log(`Rate limited on page ${page} of query "${q}". Waiting 2 seconds...`);
            await new Promise(r => setTimeout(r, 2000));
          }
          break;
        }

        const data = await res.json();
        const results = data?.results || [];
        if (results.length === 0) break;

        for (const r of results) {
          const rawUrl = r.urls?.regular || r.urls?.small;
          if (rawUrl && r.id && !uniquePhotos.has(r.id)) {
            // Limpa query params extras mantendo tamanho otimizado
            const cleanUrl = rawUrl.split('?')[0] + '?auto=format&fit=crop&q=80&w=800';
            uniquePhotos.set(r.id, {
              id: r.id,
              url: cleanUrl,
              alt: r.alt_description || r.description || q,
              query: q
            });
          }
        }
      } catch (err) {
        console.error(`Error fetching "${q}" page ${page}:`, err.message);
        break;
      }
      // Pequeno delay gentil
      await new Promise(r => setTimeout(r, 120));
    }

    if ((i + 1) % 10 === 0 || i === QUERIES.length - 1) {
      console.log(`Processed ${i + 1}/${QUERIES.length} queries -> Unique photos collected: ${uniquePhotos.size}`);
    }
  }

  const outDir = path.join(__dirname, '../src/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const photosList = Array.from(uniquePhotos.values());
  const outFile = path.join(outDir, 'harvestedPhotos.json');
  fs.writeFileSync(outFile, JSON.stringify(photosList, null, 2), 'utf8');
  console.log(`Done! Saved ${photosList.length} unique photos to ${outFile}`);
}

harvest();
