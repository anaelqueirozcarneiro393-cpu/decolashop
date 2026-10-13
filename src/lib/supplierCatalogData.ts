import { Product, mockProducts } from './mockData';

export interface SupplierCatalogConfig {
  id: string;
  name: string;
  category: string;
  defaultSales: number;
}

export const SUPPLIER_METADATA: Record<string, SupplierCatalogConfig> = {
  sportsfull: {
    id: 'sportsfull',
    name: 'SportsFull Distribuidora Oficial - SP',
    category: 'Esportes',
    defaultSales: 3420,
  },
  innova: {
    id: 'innova',
    name: 'Innova Partners Tech Hub - SP',
    category: 'Eletrônicos',
    defaultSales: 4180,
  },
  lumina: {
    id: 'lumina',
    name: 'Lumina Beauty Cosméticos & Skincare',
    category: 'Beleza',
    defaultSales: 2950,
  },
  hometech: {
    id: 'hometech',
    name: 'HomeTech Prime Casa & Decoração',
    category: 'Casa & Decoração',
    defaultSales: 3120,
  },
  trendfit: {
    id: 'trendfit',
    name: 'TrendFit Moda Fitness & Streetwear - SP',
    category: 'Moda',
    defaultSales: 3840,
  },
  autopro: {
    id: 'autopro',
    name: 'AutoPro Distribuidora Automotiva - PR',
    category: 'Automotivo',
    defaultSales: 2680,
  },
  petmania: {
    id: 'petmania',
    name: 'PetMania Distribuidora Pet Care - SP',
    category: 'Pet',
    defaultSales: 2890,
  },
  playzone: {
    id: 'playzone',
    name: 'PlayZone Distribuidora Games & Geek - SP',
    category: 'Setup Gamer',
    defaultSales: 3510,
  },
};

interface SupplierProductTemplate {
  name: string;
  category: string;
  price: number;
  image_url: string;
  description: string;
  hype_score?: number;
  vendas_mes?: number;
}

const RAW_SUPPLIER_ITEMS: Record<string, SupplierProductTemplate[]> = {
  sportsfull: [
    {
      name: 'Chuteira Society Pro Grip SpeedGrip com Travas Borracha Antiderrapante',
      category: 'Esportes',
      price: 149.9,
      image_url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800',
      description: 'Chuteira society com solado emborrachado e microtravas multidirecionais para máxima tração no gramado sintético, cabedal texturizado e palmilha em EVA macio.'
    },
    {
      name: 'Tênis de Corrida Performance Flyknit com Amortecimento a Ar',
      category: 'Esportes',
      price: 189.9,
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      description: 'Tênis de alta performance para corrida e caminhada com cabedal em malha respirável Flyknit, entressola com cápsulas de ar e sola de borracha anti-impacto.'
    },
    {
      name: 'Bola de Futebol Campo Termofusão Sem Costura Edição Match Pro',
      category: 'Esportes',
      price: 99.9,
      image_url: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&q=80&w=800',
      description: 'Bola oficial confeccionada com tecnologia de termofusão sem costura, zero absorção de água, câmara de ar butílica e peso regulamentar da FIFA.'
    },
    {
      name: 'Bola de Futsal Profissional Salão com Amortecimento Termotec',
      category: 'Esportes',
      price: 89.9,
      image_url: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=800',
      description: 'Bola para quadras de futebol de salão com quique amortecido de precisão, revestimento de PU de alta densidade e costuras internas seladas.'
    },
    {
      name: 'Luva de Goleiro Grip Profissional Palma Látex Alemão 4mm',
      category: 'Esportes',
      price: 129.9,
      image_url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&q=80&w=800',
      description: 'Luva de alta performance com palma em látex alemão de 4mm, excelente aderência em piso seco ou molhado e munhequeira elástica com cinta de velcro dupla.'
    },
    {
      name: 'Garrafa Squeeze Térmica Inox Vacuum 1 Litro Parede Dupla',
      category: 'Esportes',
      price: 69.9,
      image_url: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&q=80&w=800',
      description: 'Garrafa esportiva em aço inox 304 com isolamento térmico a vácuo, mantém bebidas geladas por 24h e quentes por 12h com bico esportivo antifuga.'
    },
    {
      name: 'Joelheira de Compressão Ajustável com Estabilizador Patelar Pro',
      category: 'Esportes',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800',
      description: 'Suporte ortopédico esportivo com anel de silicone anatômico para proteção da patela, hastes flexíveis laterais e tecido respirável antialérgico.'
    },
    {
      name: 'Corda de Pular de Aço com Rolamento Profissional Speed Rope',
      category: 'Fitness',
      price: 39.9,
      image_url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80&w=800',
      description: 'Corda de alta velocidade com cabo de aço revestido, sistema giratório com duplo rolamento 360 e manoplas ergonômicas antiderrapantes.'
    },
    {
      name: 'Hand Grip com Contador Ajustável de Força 10kg a 60kg',
      category: 'Fitness',
      price: 34.9,
      image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=800',
      description: 'Aparelho fortalecedor para mãos, punhos e antebraço com mola em aço reforçado, regulagem de carga de 10 a 60kg e contador mecânico automático.'
    },
    {
      name: 'Rolo Massageador Muscular Foam Roller Liberação Miofascial',
      category: 'Fitness',
      price: 79.9,
      image_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=800',
      description: 'Rolo texturizado para alívio de nós de tensão muscular, aumento da flexibilidade e recuperação acelerada pós-treino com núcleo rígido em PVC.'
    },
    {
      name: 'Tapete de Yoga e Pilates Antiderrapante EVA 10mm Extra Macio',
      category: 'Fitness',
      price: 59.9,
      image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=800',
      description: 'Colchonete tapete com 10mm de espessura para amortecimento de coluna e articulações, superfície antiderrapante em ambos os lados e alça de transporte.'
    },
    {
      name: 'Kit 5 Faixas Elásticas Mini Bands para Treino em Casa',
      category: 'Fitness',
      price: 35.9,
      image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
      description: 'Cinco níveis de intensidade de leve a extra pesado em látex 100% natural para fortalecimento muscular de pernas, glúteos e braços.'
    },
    {
      name: 'Kit 3 Faixas Elásticas Hip Resistance Bands de Tecido para Glúteos',
      category: 'Fitness',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&q=80&w=800',
      description: 'Faixas largas de tecido elástico com tiras internas de borracha antiderrapante que não enrolam nem beliscam a pele durante os exercícios.'
    },
    {
      name: 'Smart Band Pulseira Inteligente M8 com Monitor Cardíaco',
      category: 'Fitness',
      price: 69.9,
      image_url: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&q=80&w=800',
      description: 'Pulseira inteligente com tela colorida, monitoramento contínuo de frequência cardíaca, oxigênio no sangue SpO2, passos e notificações do celular.'
    },
    {
      name: 'Caneleira de Futebol Anatômica Leve com Proteção EVA Dupla',
      category: 'Esportes',
      price: 29.9,
      image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800',
      description: 'Caneleira ergonômica com carcaça externa rígida e camada interna em EVA acolchoado para máxima absorção de choques nas divididas.'
    },
    {
      name: 'Tornozeleira de Compressão Esportiva com Cinta Cruzada Ajustável',
      category: 'Esportes',
      price: 34.9,
      image_url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800',
      description: 'Estabilizador de tornozelo elástico respirável para prevenção de entorses e recuperação de ligamentos com tiras elásticas de fixação cruzada.'
    },
    {
      name: 'Faixa de Cabeça Esportiva Antissuor Absorvente Dry-Fit',
      category: 'Esportes',
      price: 24.9,
      image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
      description: 'Headband elástica em tecido dry-fit de secagem rápida com faixa interna de silicone que segura o suor longe dos olhos durante o treino.'
    },
    {
      name: 'Kit Halteres Emborrachados de Neoprene 2kg Par Ergonômico',
      category: 'Fitness',
      price: 69.9,
      image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=800',
      description: 'Par de halteres em ferro fundido revestidos com neoprene macio e antiderrapante, formato hexagonal anti-rolamento para treino seguro.'
    },
    {
      name: 'Roda de Exercícios Abdominais Dupla com Apoio de Joelhos',
      category: 'Fitness',
      price: 59.9,
      image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
      description: 'Ab roller com duas rodas emborrachadas largas para estabilidade perfeita, eixo em aço maciço e manoplas acolchoadas em espuma.'
    },
    {
      name: 'Óculos de Natação Profissional Anti-Embaçante com Proteção UV',
      category: 'Esportes',
      price: 44.9,
      image_url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&q=80&w=800',
      description: 'Lentes espelhadas panorâmicas com película anti-fog anti-embaçamento, vedação em silicone macio 100% estanque e estojo rígido.'
    }
  ],

  innova: [
    {
      name: 'Smartwatch Ultra 2 Titanium Tela 2.02 AMOLED Always-On Caixa 49mm',
      category: 'Eletrônicos',
      price: 189.9,
      image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800',
      description: 'Smartwatch com tela infinita AMOLED de alta resolução, coroa giratória, atende chamadas telefônicas via Bluetooth e bateria para até 7 dias.'
    },
    {
      name: 'Fone de Ouvido Bluetooth TWS Pro ANC Cancelamento de Ruído',
      category: 'Eletrônicos',
      price: 99.9,
      image_url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=800',
      description: 'Fone estéreo com cancelamento ativo de ruído ANC, drivers dinâmicos de 13mm para graves profundos e estojo de recarga com autonomia de 28h.'
    },
    {
      name: 'Mini Projetor Smart 4K Portátil Wi-Fi 6 Android 11 Integrado',
      category: 'Eletrônicos',
      price: 329.9,
      image_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800',
      description: 'Transforme qualquer parede em cinema com resolução 4K decodificada, sistema Android embutido para Netflix e YouTube e rotação de 180 graus.'
    },
    {
      name: 'Carregador Power Bank 20.000mAh Turbo com Display Digital LED',
      category: 'Eletrônicos',
      price: 119.9,
      image_url: 'https://images.unsplash.com/photo-1609081219094-a31f24d80a22?auto=format&fit=crop&q=80&w=800',
      description: 'Bateria portátil de 20.000mAh com display digital numérico de porcentagem, saídas Turbo 22.5W compatíveis com iPhone e Android.'
    },
    {
      name: 'Mini Câmera de Segurança Espiã A9 WiFi Full HD Visão Noturna',
      category: 'Eletrônicos',
      price: 59.9,
      image_url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=800',
      description: 'Câmera compacta magnética com resolução 1080P, transmissão em tempo real pelo celular, sensor de presença e gravação contínua no cartão SD.'
    },
    {
      name: 'Carregador por Indução 3 em 1 Magnético Dobrável MagSafe 15W',
      category: 'Eletrônicos',
      price: 129.9,
      image_url: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&q=80&w=800',
      description: 'Estação de carregamento sem fio articulada compatível com iPhone, Apple Watch e AirPods simultaneamente com alinhamento magnético forte.'
    },
    {
      name: 'Cabo Magnético 3 em 1 Carga Rápida Giratório 540 Graus LED',
      category: 'Eletrônicos',
      price: 29.9,
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      description: 'Cabo reforçado em nylon trançado com conector giratório 540 e pontas magnéticas destacáveis Type-C, Lightning e Micro-USB.'
    },
    {
      name: 'Mini Drone Dobrável com Câmera Dual 4K HD e Sensor Anti-Colisão',
      category: 'Eletrônicos',
      price: 199.9,
      image_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800',
      description: 'Drone ultraleve com duas câmeras com transmissão de vídeo ao vivo no smartphone, decolagem automática em um botão e modo retorno seguro.'
    },
    {
      name: 'Caixa de Som Bluetooth À Prova Dágua T&G Bass Pro 12h Bateria',
      category: 'Eletrônicos',
      price: 119.9,
      image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800',
      description: 'Caixa com graves reforçados por radiadores passivos duplos, certificação contra água IPX6, bateria de 12 horas e conexão TWS estéreo.'
    },
    {
      name: 'Rastreador Inteligente Anti-Perda compatível com Apple Find My',
      category: 'Eletrônicos',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800',
      description: 'Localizador compacto para chaves, bolsas e malas com alerta sonoro integrado e localização global pela rede Buscar sem assinatura mensal.'
    },
    {
      name: 'Mini Impressora Térmica Portátil Bluetooth para Fotos e Recibos',
      category: 'Eletrônicos',
      price: 89.9,
      image_url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800',
      description: 'Impressora de bolso sem tinta que imprime instantaneamente por calor adesivos, listas, fotos e notas de estudo direto do smartphone.'
    },
    {
      name: 'Ring Light LED 26cm com Tripé Profissional 2.10m e Suporte Celular',
      category: 'Eletrônicos',
      price: 69.9,
      image_url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800',
      description: 'Iluminador circular com 3 tonalidades de luz (branca, quente e neutra), dimmer de 10 níveis de brilho e tripé regulável até 2,10 metros.'
    },
    {
      name: 'Smartwatch Series 9 Pro Max Tela Infinita AMOLED Caixa 45mm',
      category: 'Eletrônicos',
      price: 159.9,
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      description: 'Relógio inteligente de alta definição com monitor cardíaco, sensor de sono, pulseiras intercambiáveis e suporte a centenas de mostradores.'
    },
    {
      name: 'Fone Bluetooth Esportivo Condução Óssea Open-Ear Sweatproof',
      category: 'Eletrônicos',
      price: 119.9,
      image_url: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&q=80&w=800',
      description: 'Fone seguro para ciclistas e corredores que transmite áudio por vibrações no osso zigomático mantendo os canais auditivos livres para o trânsito.'
    },
    {
      name: 'Hub Adaptador USB-C 7 em 1 HDMI 4K USB 3.0 Cartão SD PD 100W',
      category: 'Eletrônicos',
      price: 89.9,
      image_url: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80&w=800',
      description: 'Expansão em liga de alumínio para MacBooks e notebooks com saída HDMI 4K, 3 portas USB 3.0 ultra rápidas e leitores de cartão SD/MicroSD.'
    },
    {
      name: 'Microfone de Mesa USB Condensador Cardioide com Filtro Antipuff',
      category: 'Eletrônicos',
      price: 139.9,
      image_url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800',
      description: 'Microfone profissional para streaming, podcasts e chamadas no Discord com cápsula cardioide que isola ruídos do teclado e ambiente.'
    },
    {
      name: 'Câmera de Ação 4K à Prova Dágua com Acessórios para Capacete',
      category: 'Eletrônicos',
      price: 179.9,
      image_url: 'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?auto=format&fit=crop&q=80&w=800',
      description: 'Action cam com gravação em 4K 30fps, lente grande angular de 170 graus, caixa estanque subaquática até 30 metros e kit de suportes.'
    },
    {
      name: 'Estabilizador Gimbal de 3 Eixos para Celular com Rastreamento Facial',
      category: 'Eletrônicos',
      price: 249.9,
      image_url: 'https://images.unsplash.com/photo-1589872765553-d66a6a575a74?auto=format&fit=crop&q=80&w=800',
      description: 'Estabilizador de vídeo eletrônico profissional para criadores de conteúdo que elimina tremores ao andar e rastreia rostos por IA.'
    }
  ],

  lumina: [
    {
      name: 'Body Splash Fragrância Baunilha Oriental & Âmbar Dourado 250ml',
      category: 'Beleza',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
      description: 'Desodorante colônia corporal com notas envolventes de baunilha de Madagascar, flor de cerejeira e fixação suave para o dia a dia.'
    },
    {
      name: 'Sérum Facial Vitamina C 15% Pura com Ácido Hialurônico 30ml',
      category: 'Beleza',
      price: 54.9,
      image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
      description: 'Fórmula clareadora antioxidante com 15% de vitamina C nanoencapsulada, hidrata profundamente, uniformiza o tom da pele e estimula o colágeno.'
    },
    {
      name: 'Kit Maquiagem Profissional 12 Pincéis com Estojo de Couro',
      category: 'Beleza',
      price: 69.9,
      image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
      description: 'Conjunto completo com cerdas sintéticas ultrafinas e macias para base, pó, blush, esfumado e contorno com estojo protetor.'
    },
    {
      name: 'Escova Secadora e Alisadora Rotativa 3 em 1 Cerâmica Ionizada',
      category: 'Beleza',
      price: 119.9,
      image_url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=800',
      description: 'Seca, alisa e modela os cabelos em minutos com calor cerâmico e emissão de íons negativos que eliminam o frizz e dão brilho espelhado.'
    },
    {
      name: 'Protetor Solar Facial Toque Seco FPS 60 com Niacinamida 50g',
      category: 'Beleza',
      price: 44.9,
      image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
      description: 'Protetor com textura gel fluida de rápida absorção, efeito matte anti-brilho por 12h e proteção ampla contra raios UVA/UVB e luz azul.'
    },
    {
      name: 'Óleo Capilar Reparador com Óleo de Argan e Macadâmia 60ml',
      category: 'Beleza',
      price: 39.9,
      image_url: 'https://images.unsplash.com/photo-1608248597359-598d9e6eb7b4?auto=format&fit=crop&q=80&w=800',
      description: 'Finalizador nutritivo para pontas duplas e ressecadas com proteção térmica de até 230 graus sem deixar os fios pesados.'
    },
    {
      name: 'Modelador de Cachos Automático Sem Fio Bateria USB Cerâmica',
      category: 'Beleza',
      price: 139.9,
      image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800',
      description: 'Cria cachos perfeitos e ondas naturais automaticamente sem queimar as mãos, com controle digital de temperatura e rotação bidirecional.'
    },
    {
      name: 'Kit Cílios Postiços Magnéticos com Delineador Líquido Especial',
      category: 'Beleza',
      price: 34.9,
      image_url: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&q=80&w=800',
      description: 'Aplicação magnética rápida sem necessidade de cola que danifica os cílios naturais, reutilizável até 30 vezes e à prova dágua.'
    },
    {
      name: 'Aparelho Removedor de Cravos e Espinhas a Vácuo com Sucção',
      category: 'Beleza',
      price: 79.9,
      image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
      description: 'Limpeza de pele profunda em casa com 5 níveis de sucção ajustáveis e 4 ponteiras específicas para desobstrução de poros.'
    },
    {
      name: 'Depilador de Cristal Corporal Indolor Nanotecnologia Esfoliante',
      category: 'Beleza',
      price: 29.9,
      image_url: 'https://images.unsplash.com/photo-1512290900672-1f02e742918d?auto=format&fit=crop&q=80&w=800',
      description: 'Depilação suave sem lâminas ou cera com microcristais que removem os pelos e células mortas da pele em movimentos circulares.'
    },
    {
      name: 'Rolo Facial de Jade Roller e Pedra Gua Sha Natural Massagem',
      category: 'Beleza',
      price: 38.9,
      image_url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800',
      description: 'Instrumentos de massagem facial em pedra natural que ativam a drenagem linfática, desincham o rosto e potencializam a absorção de séruns.'
    },
    {
      name: 'Caneta Depiladora Aparadora de Sobrancelha Elétrica LED',
      category: 'Beleza',
      price: 32.9,
      image_url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&q=80&w=800',
      description: 'Aparador de precisão no formato de caneta com lâmina hipoalergênica banhada a ouro e luz LED integrada para acabamento impecável.'
    },
    {
      name: 'Perfume Árabe Concentrado Notas de Baunilha e Oud 100ml',
      category: 'Beleza',
      price: 149.9,
      image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800',
      description: 'Fragrância oriental de luxo com alta concentração de essência, projeção marcante e fixação de mais de 16 horas na pele.'
    },
    {
      name: 'Paleta de Sombras Neutras 18 Cores Matte e Cintilantes',
      category: 'Beleza',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800',
      description: 'Sombras ultra pigmentadas de textura aveludada com tons terrosos, nudes e dourados que esfumam com facilidade sem craquelar.'
    },
    {
      name: 'Esponja de Maquiagem Gota com Suporte Rose Gold Metal',
      category: 'Beleza',
      price: 19.9,
      image_url: 'https://images.unsplash.com/photo-1599733589046-10c005738ef9?auto=format&fit=crop&q=80&w=800',
      description: 'Esponja de textura macia que dobra de tamanho quando molhada para acabamento natural de bases e corretivos com suporte ventilado.'
    },
    {
      name: 'Máscara de Cílios Volume Máximo à Prova Dágua Efeito Boneca',
      category: 'Beleza',
      price: 34.9,
      image_url: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?auto=format&fit=crop&q=80&w=800',
      description: 'Rímel com aplicador anatômico de cerdas densas que alonga, curva e dá volume expressivo da raiz às pontas sem formar grumos.'
    },
    {
      name: 'Batom Líquido Matte Longa Duração 16 Horas Não Transfere',
      category: 'Beleza',
      price: 27.9,
      image_url: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?auto=format&fit=crop&q=80&w=800',
      description: 'Batom com pigmentação intensa e secagem rápida que não borra, não transfere para copos e máscaras e mantém os lábios aveludados.'
    },
    {
      name: 'Água Micelar Demaquilante Purificante 5 em 1 Ácido Hialurônico 200ml',
      category: 'Beleza',
      price: 29.9,
      image_url: 'https://images.unsplash.com/photo-1556228722-d0b7132145e6?auto=format&fit=crop&q=80&w=800',
      description: 'Remove maquiagem à prova dágua, limpa a oleosidade dos poros, purifica, tonifica e hidrata sem necessidade de enxágue.'
    }
  ],

  hometech: [
    {
      name: 'Robô Aspirador Inteligente Bivolt 3 em 1 Varre, Aspira e Passa Pano',
      category: 'Casa & Decoração',
      price: 179.9,
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
      description: 'Robô autônomo com sensores anti-queda e anti-colisão, escovas laterais rotativas e pano de microfibra umedecível para limpeza prática.'
    },
    {
      name: 'Umidificador e Difusor de Aromas Ultrassônico Efeito Chama LED',
      category: 'Casa & Decoração',
      price: 79.9,
      image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
      description: 'Umidificador de ambiente com luzes LED que simulam chamas de lareira realistas, compatível com óleos essenciais para aromaterapia.'
    },
    {
      name: 'Mop Giratório Limpeza Prática 360 com Balde Lava e Seca',
      category: 'Casa & Decoração',
      price: 89.9,
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
      description: 'Sistema completo com balde centrífuga em inox que espreme a microfibra sem molhar as mãos, cabo telescópico ajustável e refil extra.'
    },
    {
      name: 'Luminária Noturna Touch de Cabeceira com Sensor de Presença LED',
      category: 'Casa & Decoração',
      price: 39.9,
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
      description: 'Luz noturna magnética sem fios com bateria recarregável USB que acende automaticamente ao detectar movimento no escuro.'
    },
    {
      name: 'Lâmpada Lua Cheia 3D Touch 16 Cores RGB com Suporte de Madeira',
      category: 'Casa & Decoração',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&q=80&w=800',
      description: 'Réplica da lua impressa em 3D com texturas crateradas reais, controle remoto com 16 cores e regulação de intensidade de luz.'
    },
    {
      name: 'Balança Digital Corporal de Bioimpedância com Conexão Bluetooth',
      category: 'Casa & Decoração',
      price: 69.9,
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
      description: 'Mede peso, índice de massa corporal IMC, gordura corporal, massa muscular e taxa metabólica com sincronização automática no smartphone.'
    },
    {
      name: 'Cortador de Legumes Multifuncional 12 em 1 Mandoline Pro Inox',
      category: 'Cozinha',
      price: 79.9,
      image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800',
      description: 'Cortador com lâminas intercambiáveis em aço inoxidável para fatiar, picar em cubos, ralar e escorrer alimentos com rapidez e segurança.'
    },
    {
      name: 'Triturador Elétrico de Alho e Alimentos USB 250ml Lâminas Aço Inox',
      category: 'Cozinha',
      price: 39.9,
      image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
      description: 'Mini processador portátil sem fio com tripla lâmina afiada que tritura alho, cebola, nozes e legumes em apenas 5 segundos.'
    },
    {
      name: 'Dispenser Automático de Pasta de Dente com Esterilizador UV',
      category: 'Casa & Decoração',
      price: 59.9,
      image_url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=800',
      description: 'Suporte de parede com lâmpada germicida ultravioleta que esteriliza as cerdas das escovas e dosa o creme dental a vácuo sem desperdício.'
    },
    {
      name: 'Garrafa Pulverizadora Spray de Azeite e Óleo Culinário em Vidro',
      category: 'Cozinha',
      price: 29.9,
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800',
      description: 'Pulverizador névoa ultrafina que reduz em até 70% o consumo de azeite e calorias em saladas, grelhados e fritadeiras Air Fryer.'
    },
    {
      name: 'Forma de Silicone Antiaderente Reutilizável para Fritadeira Air Fryer',
      category: 'Cozinha',
      price: 24.9,
      image_url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=800',
      description: 'Cesto protetor em silicone alimentício livre de BPA com relevo para escorrer gordura que mantém o cesto da Air Fryer 100% limpo.'
    },
    {
      name: 'Afiador Amolador de Facas Profissional 4 em 1 com Base Antiderrapante',
      category: 'Cozinha',
      price: 34.9,
      image_url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&q=80&w=800',
      description: 'Amolador de facas e tesouras com 4 fases (tungstênio, cerâmica, diamante e tesoura) que restaura o fio navalha em poucos puxões.'
    },
    {
      name: 'Bomba Elétrica Recarregável para Galão de Água Touch USB',
      category: 'Cozinha',
      price: 39.9,
      image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&q=80&w=800',
      description: 'Dispenser elétrico para galões de 10L e 20L que enche copos e garrafas com 1 toque no botão sem precisar virar peso.'
    },
    {
      name: 'Kit 4 Potes Herméticos de Vidro com Tampa de Bambu e Silicone',
      category: 'Cozinha',
      price: 79.9,
      image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800',
      description: 'Potes organizadores em vidro borossilicato resistente com tampa hermética de bambu que conserva mantimentos frescos e crocantes.'
    },
    {
      name: 'Lixeira Automática Inteligente com Sensor de Movimento 12 Litros',
      category: 'Casa & Decoração',
      price: 89.9,
      image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
      description: 'Lixeira com sensor de proximidade infravermelho que abre a tampa em 0.3 segundos sem toque manual e anel de fixação de sacola.'
    },
    {
      name: 'Porta Condimentos Giratório em Aço Inox com 16 Frascos de Vidro',
      category: 'Cozinha',
      price: 99.9,
      image_url: 'https://images.unsplash.com/photo-1514792451248-5940ffb7bc39?auto=format&fit=crop&q=80&w=800',
      description: 'Organizador giratório 360 em aço escovado com 16 potes de vidro dosadores para manter temperos visíveis e organizados na bancada.'
    },
    {
      name: 'Escorredor de Louças Dobrável em Aço Inox sobre a Pia',
      category: 'Cozinha',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
      description: 'Grelha escorredora multiuso enrolável em hastes de inox com bordas de silicone antiderrapante que otimiza espaço sobre a cuba.'
    },
    {
      name: 'Balança Digital de Cozinha Alta Precisão 10kg Display LCD',
      category: 'Cozinha',
      price: 29.9,
      image_url: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=800',
      description: 'Balança culinária de alta sensibilidade com função Tara, graduação de 1g até 10kg ideal para receitas, dietas e porções.'
    }
  ],

  trendfit: [
    {
      name: 'Mochila Executiva Antifurto Impermeável com Trava TSA e Saída USB',
      category: 'Moda',
      price: 139.9,
      image_url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800',
      description: 'Mochila para notebook até 15.6 polegadas com zíperes ocultos antifurto, cadeado TSA com senha, tecido impermeável e entrada externa USB.'
    },
    {
      name: 'Carteira Slim Masculina de Fibra de Carbono com Bloqueio RFID',
      category: 'Moda',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
      description: 'Carteira minimalista com clipe de dinheiro em aço, compartimento ejetor de cartões em cascata com 1 clique e escudo anti-clonagem RFID.'
    },
    {
      name: 'Óculos de Sol Retrô Polarizado Masculino e Feminino Proteção UV400',
      category: 'Moda',
      price: 59.9,
      image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800',
      description: 'Armação clássica em policarbonato reforçado com lentes polarizadas de alta definição que eliminam reflexos incômodos na direção.'
    },
    {
      name: 'Bolsa Feminina Transversal Joey de Luxo Alça em Corrente Dourada',
      category: 'Moda',
      price: 89.9,
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
      description: 'Bolsa tiracolo em couro ecológico texturizado com fecho magnético de pressão e alça mista em corrente e couro para eventos e passeios.'
    },
    {
      name: 'Calça Jogger Minimalista Soft Comfort Tecido Premium com Punho',
      category: 'Moda',
      price: 79.9,
      image_url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&q=80&w=800',
      description: 'Calça streetwear casual confeccionada em algodão com elastano, cós elástico com cordão de ajuste e bolsos laterais fundos.'
    },
    {
      name: 'Boné Aba Curva Streetwear Snapback Algodão Escovado Ajustável',
      category: 'Moda',
      price: 39.9,
      image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800',
      description: 'Boné 6 gomos em sarja de algodão de alta gramatura com ilhoses bordados de ventilação e fecho traseiro de regulagem rápida.'
    },
    {
      name: 'Relógio Masculino Quartzo em Aço Inoxidável Cronógrafo Calendário',
      category: 'Moda',
      price: 129.9,
      image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800',
      description: 'Relógio clássico resistente à água até 30m com caixa em aço inox polido, vidro mineral resistente a riscos e ponteiros luminosos.'
    },
    {
      name: 'Cinto Tático Militar de Nylon Reforçado com Fivela Engate Rápido',
      category: 'Moda',
      price: 34.9,
      image_url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=800',
      description: 'Cinto de alta resistência para calças jeans e táticas com fivela cobra em liga de zinco que destrava com 1 clique lateral.'
    },
    {
      name: 'Jaqueta Corta-Vento Esportiva Impermeável com Capuz Dobrável',
      category: 'Moda',
      price: 99.9,
      image_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=800',
      description: 'Casaco ultraleve repelente à água e vento, zíper frontal selado e tecido respirável que se dobra dentro do próprio bolso.'
    },
    {
      name: 'Carteira Feminina Compacta em Couro Sintético com Fecho Zíper',
      category: 'Moda',
      price: 44.9,
      image_url: 'https://images.unsplash.com/photo-1563903530908-afdd155d057a?auto=format&fit=crop&q=80&w=800',
      description: 'Porta cartões e moedas elegante com divisórias sanfonadas, espaço para CNH e notas dobradas com puxador em metal dourado.'
    },
    {
      name: 'Óculos de Sol Vintage Unissex Armação Metálica Redonda Lente G15',
      category: 'Moda',
      price: 54.9,
      image_url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&q=80&w=800',
      description: 'Armação redonda clássica estilo retrô com almofadas nasais em silicone macio e lentes escuras com bloqueio solar 100% UV400.'
    },
    {
      name: 'Tênis Casual Slip-on Masculino e Feminino Knit Respirável',
      category: 'Moda',
      price: 119.9,
      image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=800',
      description: 'Calçado sem cadarço fácil de calçar com cabedal em malha knit elástica que se molda ao pé e solado em EVA leve e flexível.'
    },
    {
      name: 'Sandália Nuvem Confort Ortopédica Antiderrapante Macia EVA',
      category: 'Moda',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&q=80&w=800',
      description: 'Chinelo nuvem anatômico com 4cm de sola espessa que alivia dores nos calcanhares e esporão, silencioso e antiderrapante no molhado.'
    }
  ],

  autopro: [
    {
      name: 'Aspirador de Pó Sem Fio Automotivo e Doméstico Alta Sucção 120W',
      category: 'Automotivo',
      price: 79.9,
      image_url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800',
      description: 'Aspirador portátil recarregável USB com motor potente de 120W, filtro HEPA lavável e bico extensor para cantos estreitos e estofados.'
    },
    {
      name: 'Suporte Celular Veicular Indução Automático MagSafe 15W',
      category: 'Automotivo',
      price: 89.9,
      image_url: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&q=80&w=800',
      description: 'Suporte para saída de ar com trava automática por sensor de indução que fecha sozinho ao aproximar o aparelho e carrega sem fio em até 15W.'
    },
    {
      name: 'Compressor de Ar Portátil Digital Calibrador de Pneus USB',
      category: 'Automotivo',
      price: 139.9,
      image_url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=800',
      description: 'Bomba elétrica digital com display LCD que calibra pneus de carro, moto e bicicleta na pressão exata em PSI/BAR e desliga automaticamente.'
    },
    {
      name: 'Aromatizador Automotivo Giratório Solar Helicóptero Metal Luxo',
      category: 'Automotivo',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      description: 'Difusor de essência para painel de carro com hélice que gira com a luz solar sem necessidade de pilhas, corpo em liga metálica nobre.'
    },
    {
      name: 'Kit Iluminação LED Automotiva RGB para Assoalho com Sensor Musical',
      category: 'Automotivo',
      price: 44.9,
      image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800',
      description: 'Quatro barras de LED adesivas para os pés do carro com controle remoto de 16 cores e microfone que faz a luz pulsar no ritmo da música.'
    },
    {
      name: 'Câmera Veicular Dash Cam HD 1080P Visão Noturna e Gravação em Loop',
      category: 'Automotivo',
      price: 119.9,
      image_url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&q=80&w=800',
      description: 'Gravador de bordo para para-brisa com sensor G de colisão que bloqueia o arquivo em acidentes, gravação contínua e ângulo de 140 graus.'
    },
    {
      name: 'Suporte Veicular Celular com Trava por Gravidade para Saída de Ar',
      category: 'Automotivo',
      price: 34.9,
      image_url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&q=80&w=800',
      description: 'Mecanismo mecânico que aperta as hastes laterais pelo próprio peso do celular ao pousá-lo, base giratória e almofadas emborrachadas.'
    },
    {
      name: 'Transmissor FM Bluetooth Veicular com Duas Portas USB QC 3.0',
      category: 'Automotivo',
      price: 39.9,
      image_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800',
      description: 'Conecta o Spotify do smartphone ao rádio do carro via frequência FM com viva-voz para chamadas telefônicas e carregamento rápido.'
    },
    {
      name: 'Guarda-Sol Protetor Térmico Dobrável para Para-brisa de Carro Anti-UV',
      category: 'Automotivo',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800',
      description: 'Bloqueador solar com mecanismo de guarda-chuva que abre em 2 segundos e reflete até 99% do calor evitando ressecamento do painel.'
    },
    {
      name: 'Organizador de Porta-Malas Automotivo Dobrável com Divisórias',
      category: 'Automotivo',
      price: 59.9,
      image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800',
      description: 'Caixa organizadora em tecido Oxford resistente à água com alças reforçadas e compartimentos múltiplos para compras e ferramentas.'
    },
    {
      name: 'Pano de Microfibra Automotivo Alta Absorção 600GSM Kit com 3 Peças',
      category: 'Automotivo',
      price: 29.9,
      image_url: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=800',
      description: 'Toalhas de microfibra de alta densidade sem costura para secagem e polimento sem riscar a pintura nem soltar fiapos.'
    }
  ],

  petmania: [
    {
      name: 'Bebedouro Fonte Automática para Gatos e Cães com Filtro de Carvão 2L',
      category: 'Pet',
      price: 69.9,
      image_url: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&q=80&w=800',
      description: 'Fonte com bomba dágua silenciosa de fluxo contínuo que incentiva os pets a beberem água fresca e filtrada prevenindo problemas renais.'
    },
    {
      name: 'Escova Tira Pelos Autolimpante Massageadora para Cães e Gatos',
      category: 'Pet',
      price: 34.9,
      image_url: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&q=80&w=800',
      description: 'Rasqueadeira com botão retrátil que solta toda a camada de pelos mortos da escova em 1 segundo sem sujar as mãos com pontas protegidas.'
    },
    {
      name: 'Cortador de Unha Pet com Luz LED e Lixa Embutida Anti-Sangramento',
      category: 'Pet',
      price: 39.9,
      image_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
      description: 'Alicate com lâmina em aço inox afiada e luz LED integrada que ilumina a linha de sangue da unha evitando cortes dolorosos.'
    },
    {
      name: 'Guia Retrátil para Cachorro 5 Metros com Trava de Segurança',
      category: 'Pet',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800',
      description: 'Coleira guia em fita resistente para animais de até 25kg com mecanismo retrátil suave e botão de freio instantâneo no polegar.'
    },
    {
      name: 'Comedouro Lento Antigulosa para Cães com Base Antiderrapante',
      category: 'Pet',
      price: 29.9,
      image_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
      description: 'Tigela com labirintos internos que desacelera o ritmo da alimentação em até 5 vezes, prevenindo engasgos, vômitos e obesidade.'
    },
    {
      name: 'Luva Magnética Removedora de Pelos para Cães e Gatos Silicone',
      category: 'Pet',
      price: 24.9,
      image_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
      description: 'Luva com 180 pontas de silicone flexíveis que recolhe pelos soltos enquanto massageia e acaricia o animal.'
    },
    {
      name: 'Tapete Higiênico Lavável e Impermeável Reutilizável para Cães 70x50cm',
      category: 'Pet',
      price: 44.9,
      image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800',
      description: 'Tapete absorvente de 4 camadas reutilizável que retém urina sem vazar no chão, lavável na máquina e econômico.'
    },
    {
      name: 'Brinquedo Interativo Laser LED Automático Giratório para Gatos',
      category: 'Pet',
      price: 59.9,
      image_url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800',
      description: 'Torre laser que gira com trajetórias aleatórias estimulando o instinto caçador dos felinos com timer de desligamento automático.'
    },
    {
      name: 'Cortador e Aparador de Pelos Pet Profissional Sem Fio Bateria Bivolt',
      category: 'Pet',
      price: 89.9,
      image_url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=800',
      description: 'Máquina de tosa com lâmina de titânio e cerâmica, motor ultrassilencioso que não assusta os bichinhos e 4 pentes de altura.'
    },
    {
      name: 'Cinto de Segurança Automotivo com Amortecedor Elástico para Cães',
      category: 'Pet',
      price: 22.9,
      image_url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=800',
      description: 'Engate padrão para cinto de segurança veicular com mola elástica amortecedora que protege o cachorro contra freadas bruscas.'
    },
    {
      name: 'Cama Nuvem Ortopédica Redonda Pelúcia Macia para Cães e Gatos 60cm',
      category: 'Pet',
      price: 69.9,
      image_url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&q=80&w=800',
      description: 'Cama antiestresse redonda com bordas elevadas que oferecem sensação de ninho e segurança, forro peluciado com fundo impermeável.'
    },
    {
      name: 'Comedouro e Bebedouro Duplo Elevado Ergonômico em Aço Inox',
      category: 'Pet',
      price: 54.9,
      image_url: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?auto=format&fit=crop&q=80&w=800',
      description: 'Suporte elevado em bambu ecológico com duas tigelas removíveis em aço inox que melhoram a postura cervical e digestão do animal.'
    }
  ],

  playzone: [
    {
      name: 'Teclado Mecânico Compacto 60% RGB Switch Blue Hot-Swappable',
      category: 'Setup Gamer',
      price: 139.9,
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
      description: 'Teclado gamer 61 teclas formato compacto com iluminação RGB personalizável, switches mecânicos azuis com clique tátil e cabo removível Type-C.'
    },
    {
      name: 'Mouse Gamer Ergonômico RGB 7200 DPI com 7 Botões Programáveis',
      category: 'Setup Gamer',
      price: 69.9,
      image_url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800',
      description: 'Mouse com sensor óptico de alta precisão ajustável de 800 a 7200 DPI, formato ergonômico para pegada palm e iluminação cromada.'
    },
    {
      name: 'Mousepad Gamer Extra Grande 90x40cm Mapa Múndi Emborrachado',
      category: 'Setup Gamer',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800',
      description: 'Mousepad speed gigante para cobrir teclado e mouse, bordas costuradas que não desfiam e base antiderrapante em borracha natural.'
    },
    {
      name: 'Headset Gamer Surround 7.1 com Microfone Noise Cancelling',
      category: 'Setup Gamer',
      price: 149.9,
      image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800',
      description: 'Almofadas confortáveis em espuma de memória que não esquentam e áudio posicional 7.1 para ouvir passos com precisão milimétrica nos jogos.'
    },
    {
      name: 'Suporte Articulado a Gás para Monitores 17 a 34 Polegadas VESA',
      category: 'Setup Gamer',
      price: 159.9,
      image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
      description: 'Braço articulado com pistão a gás para ajuste suave de altura, inclinação e giro 360 graus liberando espaço total na mesa.'
    },
    {
      name: 'Lâmpada de Monitor Barra LED RGB Screenbar com Sensor Touch',
      category: 'Setup Gamer',
      price: 99.9,
      image_url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=800',
      description: 'Luminária assimétrica para topo de monitor que ilumina a área de trabalho sem causar reflexo na tela nem cansar a visão à noite.'
    },
    {
      name: 'Fita de LED RGB 5050 5 Metros com Controle Remoto e Bluetooth',
      category: 'Setup Gamer',
      price: 44.9,
      image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
      description: 'Fita adesiva com LEDs de alta intensidade para decorar atrás da mesa ou monitor, controlável por app no celular ou controle remoto.'
    },
    {
      name: 'Controle Gamepad Sem Fio Bluetooth para PC, Celular e TV Box',
      category: 'Setup Gamer',
      price: 89.9,
      image_url: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&q=80&w=800',
      description: 'Joystick sem fio com gatilhos analógicos precisos, motores de vibração dupla e suporte acoplável para celular.'
    },
    {
      name: 'Apoio de Pulso Ergonômico em Gel para Teclado e Mouse',
      category: 'Setup Gamer',
      price: 54.9,
      image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800',
      description: 'Descanso ergonômico preenchido com gel de alta densidade que mantém os punhos alinhados evitando dores e tendinites.'
    },
    {
      name: 'Suporte de Headset em Alumínio com Hub USB Integrado',
      category: 'Setup Gamer',
      price: 59.9,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      description: 'Base organizadora para fones de ouvido em alumínio anodizado com base antiderrapante pesada e portas USB extras para periféricos.'
    },
    {
      name: 'Caixa de Som Gamer Estéreo RGB para Computador USB Potência 10W',
      category: 'Setup Gamer',
      price: 69.9,
      image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800',
      description: 'Par de caixas compactas para mesa com iluminação dinâmica Rainbow RGB, som estéreo 2.0 claro e controle de volume frontal.'
    },
    {
      name: 'Suporte Vertical para Placa de Vídeo com Iluminação ARGB',
      category: 'Setup Gamer',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=800',
      description: 'Apoio magnético para evitar o empenamento de placas de vídeo pesadas com iluminação ARGB sincronizável com a placa-mãe.'
    },
    {
      name: 'Teclado Mecânico Sem Fio Bluetooth e 2.4GHz Switch Red Silencioso',
      category: 'Setup Gamer',
      price: 179.9,
      image_url: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
      description: 'Teclado mecânico trimode com switches lineares vermelhos macios e silenciosos, teclas PBT Double-Shot duráveis e bateria de longa vida.'
    },
    {
      name: 'Mouse Gamer Ultraleve Honeycomb Colmeia 64g Cabo Paracord',
      category: 'Setup Gamer',
      price: 89.9,
      image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&q=80&w=800',
      description: 'Mouse ultraleve com estrutura furada em colmeia para máxima agilidade em jogos FPS, sensor gamer de 12.000 DPI e pés 100% PTFE.'
    },
    {
      name: 'Óculos Bloqueador de Luz Azul Anti-Fadiga Ocular para Games e Telas',
      category: 'Setup Gamer',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=800',
      description: 'Lentes sem grau com tecnologia Blue Light Filter que filtram o excesso de radiação azul das telas prevenindo dores de cabeça e insônia.'
    },
    {
      name: 'Webcam Full HD 1080P com Tampa de Privacidade e Microfone Duplo',
      category: 'Setup Gamer',
      price: 99.9,
      image_url: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&q=80&w=800',
      description: 'Câmera com foco automático inteligente, correção de luz em ambientes escuros, microfone estéreo com redução de ruído e obturador físico.'
    },
    {
      name: 'Luminária Projetora de Galáxia Astronauta Nebulosa 360 com Controle',
      category: 'Setup Gamer',
      price: 89.9,
      image_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=800',
      description: 'Projetor estético em formato de astronauta com cabeça magnética giratória que projeta estrelas e nebulosas espaciais no teto do quarto.'
    },
    {
      name: 'Organizador de Cabos Sob a Mesa em Calha de Aço Preto Sem Furar',
      category: 'Setup Gamer',
      price: 49.9,
      image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
      description: 'Bandeja organizadora com presilhas de aperto rápido que esconde réguas de tomada, fontes e cabos embaixo da mesa mantendo visual limpo.'
    }
  ]
};

function generateSupplierCatalog(): Product[] {
  const allProducts: Product[] = [];
  const usedImages = new Set<string>();

  for (const [supplierId, meta] of Object.entries(SUPPLIER_METADATA)) {
    const items = RAW_SUPPLIER_ITEMS[supplierId] || [];
    let idx = 1;

    for (const item of items) {
      // Garante unicidade estrita de imagem
      let img = item.image_url;
      if (usedImages.has(img)) {
        // Se já tiver sido usada, adiciona marcador único de imagem
        img = `${item.image_url}&item=${supplierId}_${idx}`;
      }
      usedImages.add(img);

      const commissionNum = item.price * 0.32;
      const commission = `R$ ${commissionNum.toFixed(2).replace('.', ',')}`;
      const hype_score = 90 + ((idx * 7) % 10);
      const vendas_mes = Math.max(950, meta.defaultSales + ((idx * 43) % 1600) - 700);

      allProducts.push({
        id: `prod_${supplierId}_${String(idx).padStart(3, '0')}`,
        name: item.name,
        title: item.name,
        price: item.price,
        image_url: img,
        hype_score,
        score: hype_score,
        url: `https://shopee.com.br/search?keyword=${encodeURIComponent(item.name)}`,
        status: hype_score >= 94 ? 'ALTA' : 'ESTÁVEL',
        category: item.category,
        commission,
        vendas_mes,
        supplier: meta.name,
        supplierId,
        description: item.description
      });

      idx++;
    }
  }

  return allProducts;
}

export const ALL_SUPPLIER_PRODUCTS: Product[] = generateSupplierCatalog();

/**
 * Retorna produtos filtrados por fornecedores ativados.
 * Se nenhum fornecedor estiver ativado ainda, retorna TODOS os produtos por padrão
 * para garantir que o catálogo do usuário NUNCA fique quebrado ou vazio.
 */
export function getProductsByActivatedSuppliers(activatedIds: string[]): Product[] {
  if (!activatedIds || activatedIds.length === 0) {
    return ALL_SUPPLIER_PRODUCTS;
  }
  const idSet = new Set(activatedIds.map(id => id.toLowerCase()));
  const filtered = ALL_SUPPLIER_PRODUCTS.filter(p => idSet.has((p.supplierId || '').toLowerCase()));
  return filtered.length > 0 ? filtered : ALL_SUPPLIER_PRODUCTS;
}

/**
 * Retorna a contagem de produtos únicos por fornecedor
 */
export function getSupplierProductsCount(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const prod of ALL_SUPPLIER_PRODUCTS) {
    if (prod.supplierId) {
      counts[prod.supplierId] = (counts[prod.supplierId] || 0) + 1;
    }
  }
  return counts;
}
