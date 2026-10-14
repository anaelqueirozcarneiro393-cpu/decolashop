const fs = require('fs');
const path = require('path');

// Banco curado de fotos reais e de alta conversão por produto exato
const PRODUCT_FAMILIES = [
  // ELETRÔNICOS
  {
    category: 'Eletrônicos',
    baseName: 'Fone de Ouvido Bluetooth TWS Sem Fio com Cancelamento de Ruído',
    supplier: 'Innova Partners Tech Hub - SP',
    supplierId: 'innova',
    basePrice: 89.90,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1598331668826-20cecc596b86?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Fone de ouvido sem fio Bluetooth de última geração com graves potentes, estojo de carregamento com visor de bateria LED e emparelhamento instantâneo. Design ergonômico ideal para treinos, chamadas e dia a dia.'
  },
  {
    category: 'Eletrônicos',
    baseName: 'Smartwatch Inteligente Ultra com Monitor Cardíaco e Notificações',
    supplier: 'Innova Partners Tech Hub - SP',
    supplierId: 'innova',
    basePrice: 159.90,
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Relógio inteligente multifunções com monitor de passos, batimentos cardíacos, sono e oxigenação. Notificações de WhatsApp, chamadas e redes sociais direto no pulso com tela AMOLED em alta definição.'
  },
  {
    category: 'Eletrônicos',
    baseName: 'Mini Drone Dobrável com Câmera 4K HD e Controle Remoto',
    supplier: 'Innova Partners Tech Hub - SP',
    supplierId: 'innova',
    basePrice: 229.90,
    images: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1533282960533-51328aa49826?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Drone portátil compacto com hélices dobráveis, estabilização de voo automática por sensores e transmissão de vídeo em tempo real para smartphone. Bateria de longa duração e retorno com um toque.'
  },
  {
    category: 'Eletrônicos',
    baseName: 'Mini Projetor Portátil Smart Cinema LED Full HD para Celular e TV',
    supplier: 'Innova Partners Tech Hub - SP',
    supplierId: 'innova',
    basePrice: 289.90,
    images: [
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Transforme qualquer parede em uma tela de cinema de até 120 polegadas. Conexão HDMI, USB e espelhamento sem fio para celular, notebook e videogames. Alto-falante embutido de alta fidelidade.'
  },

  // SETUP GAMER
  {
    category: 'Setup Gamer',
    baseName: 'Headset Gamer 7.1 Surround com Microfone e Iluminação RGB',
    supplier: 'PlayZone Distribuidora Games & Geek - SP',
    supplierId: 'playzone',
    basePrice: 139.90,
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Áudio imersivo 7.1 que permite ouvir os passos e tiros dos inimigos com precisão direcional. Almofadas auriculares macias respiráveis com isolamento acústico e microfone flexível com redução de ruído.'
  },
  {
    category: 'Setup Gamer',
    baseName: 'Teclado Mecânico Gamer RGB com Switches Rápidos e Anti-Ghosting',
    supplier: 'PlayZone Distribuidora Games & Geek - SP',
    supplierId: 'playzone',
    basePrice: 179.90,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Teclas mecânicas táteis com resposta ultrarrápida para jogos competitivos. Iluminação Chroma RGB personalizável com múltiplos efeitos e construção resistente com placa de alumínio.'
  },
  {
    category: 'Setup Gamer',
    baseName: 'Mouse Gamer Ergonômico RGB 7200 DPI com Botões Laterais',
    supplier: 'PlayZone Distribuidora Games & Geek - SP',
    supplierId: 'playzone',
    basePrice: 79.90,
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1626218174358-7769486c4b79?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Sensor óptico de alta precisão com ajuste instantâneo de DPI para mira cirúrgica em jogos de FPS. Pegada ergonômica anti-fadiga com laterais emborrachadas e iluminação RGB dinâmica.'
  },

  // ESPORTES & FITNESS
  {
    category: 'Esportes',
    baseName: 'Joelheira de Compressão Ajustável Ortopédica com Estabilizador Patelar',
    supplier: 'SportsFull Distribuidora Oficial - SP',
    supplierId: 'sportsfull',
    basePrice: 49.90,
    images: [
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Proporciona compressão médica e suporte anatômico aos ligamentos do joelho. Faixas ajustáveis de velcro que garantem firmeza sem escorregar durante corridas, agachamentos e treinos de crossfit.'
  },
  {
    category: 'Esportes',
    baseName: 'Pistola Massageadora Muscular Fascial Elétrica Deep Tissue 6 Velocidades',
    supplier: 'SportsFull Distribuidora Oficial - SP',
    supplierId: 'sportsfull',
    basePrice: 149.90,
    images: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Acelera a recuperação pós-treino, alivia nós de tensão e dores musculares através de percussão profunda. Acompanha 4 ponteiras intercambiáveis e bateria recarregável com autonomia de até 4 horas.'
  },
  {
    category: 'Esportes',
    baseName: 'Corda de Pular Crossfit com Rolamento Duplo e Cabo de Aço Ajustável',
    supplier: 'SportsFull Distribuidora Oficial - SP',
    supplierId: 'sportsfull',
    basePrice: 39.90,
    images: [
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Giro suave em 360 graus que permite saltos rápidos e double unders sem enrolar a corda. Cabo revestido resistente ao atrito com manoplas ergonômicas de pegada firme.'
  },

  // BELEZA & SKINCARE
  {
    category: 'Beleza',
    baseName: 'Massageador Facial de Quartzo Rosa e Pedra Gua Sha Natural',
    supplier: 'Lumina Beauty Cosméticos & Skincare',
    supplierId: 'lumina',
    basePrice: 59.90,
    images: [
      'https://images.unsplash.com/photo-1512290900672-1f48641a27e7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Estimula a microcirculação facial, promove drenagem linfática natural e reduz o inchaço matinal ao redor dos olhos e bochechas. Devolve o viço e potencializa a absorção de séruns e hidratantes.'
  },
  {
    category: 'Beleza',
    baseName: 'Kit de Batons Líquidos Matte de Longa Duração e Alta Pigmentação',
    supplier: 'Lumina Beauty Cosméticos & Skincare',
    supplierId: 'lumina',
    basePrice: 69.90,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Cores sofisticadas com acabamento aveludado impecável que não craquela e não transfere. Fórmula hidratante com vitamina E que dura até 16 horas nos lábios com conforto absoluto.'
  },
  {
    category: 'Beleza',
    baseName: 'Ring Light LED de Mesa com Tripé Articulado e Suporte para Celular',
    supplier: 'Lumina Beauty Cosméticos & Skincare',
    supplierId: 'lumina',
    basePrice: 79.90,
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Iluminação profissional de estúdio para gravações de vídeos, maquiagem e fotos de produtos. 3 tonalidades de luz (branca, quente e neutra) com 10 níveis de intensidade e rotação 360 graus.'
  },

  // CASA & DECORAÇÃO
  {
    category: 'Casa & Decoração',
    baseName: 'Umidificador de Ar e Difusor de Aromas Ultrassônico com LED Noturno',
    supplier: 'HomeTech Prime Casa & Decoração',
    supplierId: 'hometech',
    basePrice: 89.90,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Mantém a umidade saudável do ar no quarto ou sala, aliviando tosse seca e alergias respiratórias. Compatível com essências aromáticas para criar um ambiente relaxante com iluminação sutil.'
  },
  {
    category: 'Casa & Decoração',
    baseName: 'Garrafa Térmica Inteligente em Inox com Display Digital de Temperatura',
    supplier: 'HomeTech Prime Casa & Decoração',
    supplierId: 'hometech',
    basePrice: 59.90,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1570831739427-44f6f8742880?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Parede dupla com isolamento a vácuo que mantém líquidos quentes por 12h ou gelados por 24h. Tampa com sensor touch em LED que mostra a temperatura exata da bebida em tempo real.'
  },

  // AUTOMOTIVO
  {
    category: 'Automotivo',
    baseName: 'Câmera Veicular Frontal Dashcam Full HD com Visão Noturna e Sensor de Impacto',
    supplier: 'AutoPro Distribuidora Automotiva - PR',
    supplierId: 'autopro',
    basePrice: 169.90,
    images: [
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Gravação contínua em loop com lente grande-angular que captura placas de carros e detalhes do trânsito. Sensor G integrado que bloqueia e protege os vídeos automaticamente em caso de colisão.'
  },
  {
    category: 'Automotivo',
    baseName: 'Suporte Veicular Magnético para Celular Saída de Ar com Trava Segura',
    supplier: 'AutoPro Distribuidora Automotiva - PR',
    supplierId: 'autopro',
    basePrice: 39.90,
    images: [
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Imãs de neodímio extra-fortes que seguram qualquer celular mesmo em curvas acentuadas e buracos. Rotação em 360 graus que permite usar na vertical ou horizontal sem bloquear a visão do para-brisa.'
  },

  // PET
  {
    category: 'Pet',
    baseName: 'Bebedouro Portátil de Passeio para Cães e Gatos com Trava Anti-Vazamento',
    supplier: 'PetMania Distribuidora Pet Care - SP',
    supplierId: 'petmania',
    basePrice: 45.90,
    images: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Mantenha seu melhor amigo hidratado em caminhadas, viagens e parques. Aperte o botão para a água sair na conchinha anatômica e devolva a água que sobrar sem desperdício.'
  },
  {
    category: 'Pet',
    baseName: 'Cama Pet Nuvem Redonda Antiestresse Pelúcia Extra Macia e Lavável',
    supplier: 'PetMania Distribuidora Pet Care - SP',
    supplierId: 'petmania',
    basePrice: 119.90,
    images: [
      'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Bordas elevadas acolchoadas que dão suporte para a cabeça e pescoço, transmitindo sensação de segurança e reduzindo a ansiedade do animal. Fundo impermeável e antiderrapante.'
  },

  // MODA & ACESSÓRIOS
  {
    category: 'Moda',
    baseName: 'Óculos de Sol Polarizado Clássico com Proteção UV400 e Estojo',
    supplier: 'TrendFit Moda Fitness & Streetwear - SP',
    supplierId: 'trendfit',
    basePrice: 89.90,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Lentes polarizadas de alta definição que eliminam reflexos solares em pistas e água, proporcionando visão relaxada. Armação leve em metal com design moderno unissex.'
  },
  {
    category: 'Moda',
    baseName: 'Porta Cartões Automático com Ejetor e Bloqueio Anti-Furto RFID',
    supplier: 'TrendFit Moda Fitness & Streetwear - SP',
    supplierId: 'trendfit',
    basePrice: 49.90,
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800'
    ],
    description: 'Gatilho rápido que ejeta os cartões em cascata com um só clique. Proteção de alumínio que bloqueia tentativas de leitura indevida por aproximação (RFID/NFC).'
  }
];

const MODIFIERS = [
  'Pro', 'Max', 'Ultra', 'Plus', 'Premium', 'Edition 2026', 'Titanium', 'Black Edition', 
  'Slim', 'Gold', 'Silver', 'Carbon', 'Sport', 'Master', 'Wireless', 'Fast Charge'
];

const COLORS = [
  'Preto Fosco', 'Branco Polar', 'Cinza Espacial', 'Azul Marinho', 'Verde Militar', 'Prata Grafite'
];

function generateSanitizedCatalog() {
  const TOTAL_PRODUCTS = 2550;
  const products = [];
  const familiesCount = PRODUCT_FAMILIES.length;

  for (let i = 0; i < TOTAL_PRODUCTS; i++) {
    const family = PRODUCT_FAMILIES[i % familiesCount];
    const mod1 = MODIFIERS[(i * 3 + 1) % MODIFIERS.length];
    const color = COLORS[(i * 2 + 3) % COLORS.length];
    const imageIndex = (i + Math.floor(i / familiesCount)) % family.images.length;
    const imageUrl = family.images[imageIndex];

    const priceVariation = ((i % 15) - 7) * 3;
    const finalPrice = Math.max(39.90, Math.round((family.basePrice + priceVariation) * 10) / 10);
    const commVal = Math.round(finalPrice * 0.35 * 100) / 100;

    const idNumber = String(i + 1).padStart(4, '0');
    const productName = `${family.baseName} ${mod1} (${color})`;

    products.push({
      id: `br-${idNumber}`,
      name: productName,
      title: productName,
      price: finalPrice,
      image_url: imageUrl,
      hype_score: 90 + (i % 10),
      score: 90 + (i % 10),
      url: `https://shopee.com.br/search?keyword=${encodeURIComponent(family.baseName)}`,
      status: (i % 3 === 0) ? 'ALTA' : 'ESTÁVEL',
      category: family.category,
      commission: `R$ ${commVal.toFixed(2).replace('.', ',')}`,
      vendas_mes: 1200 + (i * 17) % 3500,
      supplier: family.supplier,
      supplierId: family.supplierId,
      currency: 'BRL',
      origin: 'São Paulo - SP (Hub Nacional)',
      description: family.description
    });
  }

  const outputPath = path.join(__dirname, '..', 'src', 'data', 'nationalCatalog2500.json');
  fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf-8');
  console.log(`Catálogo 100% higienizado gerado com sucesso em ${outputPath}! Total: ${products.length} produtos.`);
}

generateSanitizedCatalog();
