import { Product } from './mockData';

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

interface ArchetypeDef {
  name: string;
  category: string;
  count: number;
  priceRange: [number, number];
  images: string[];
  titleGenerator: (idx: number) => string;
  descriptionGenerator: (idx: number) => string;
}

const CLUBS = [
  'Flamengo', 'Real Madrid', 'Palmeiras', 'Barcelona', 'Corinthians', 'Manchester City',
  'São Paulo', 'Arsenal', 'Vasco da Gama', 'Paris Saint-Germain', 'Santos', 'Liverpool',
  'Grêmio', 'Bayern de Munique', 'Internacional', 'Juventus', 'Atlético Mineiro', 'Chelsea',
  'Cruzeiro', 'Milan', 'Botafogo', 'Inter de Milão', 'Fluminense', 'Borussia Dortmund',
  'Seleção Brasileira', 'Seleção Argentina', 'Seleção Francesa', 'Seleção Portuguesa', 'Seleção Alemã', 'Seleção Espanhola'
];

const COLORS_GENERAL = [
  'Preto Fosco', 'Branco Polar', 'Cinza Chumbo', 'Azul Marinho', 'Verde Militar', 'Grafite Escovado',
  'Vermelho Carmim', 'Dourado Champanhe', 'Prata Espelhado', 'Azul Petróleo', 'Rosa Quartz', 'Titanium Black'
];

const FRAGRANCES = [
  'Vanilla Obsession', 'Morango Silvestre & Chantilly', 'Âmbar Dourado & Sândalo', 'Flor de Cerejeira Japonesa',
  'Pistache Cremoso & Baunilha', 'Caramelo Salgado & Mel', 'Algodão Egípcio Puro', 'Frutas Vermelhas & Cassis',
  'Orquídea Negra Noturna', 'Bruma de Coco Tropical', 'Lavanda Francesa Relaxante', 'Flor de Laranjeira & Cedro'
];

const SKINCARE_ACTIVES = [
  'Vitamina C Pura 15%', 'Ácido Hialurônico 2% Multimolecular', 'Retinol Puro 0.3% Renovador',
  'Niacinamida 10% + Zinco 1%', 'Ácido Salicílico 2% Anti-Oleosidade', 'Peptídeos de Cobre Estimulante',
  'Cafeína 5% + EGCG Descongestionante', 'Esqualano Vegetal 100% Puro', 'Ácido Glicólico 7% Esfoliante'
];

const SUPPLIER_ARCHETYPES: Record<string, ArchetypeDef[]> = {
  sportsfull: [
    {
      name: 'Camisa de Time Dry-Fit',
      category: 'Esportes',
      count: 60,
      priceRange: [89.9, 139.9],
      images: [
        'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const club = CLUBS[idx % CLUBS.length];
        const version = idx % 3 === 0 ? 'Versão Jogador Match' : idx % 3 === 1 ? 'Edição Especial Retrô' : 'Uniforme Oficial 24/25';
        return `Camisa de Time Dry-Fit ${club} ${version}`;
      },
      descriptionGenerator: (idx) => {
        const club = CLUBS[idx % CLUBS.length];
        return `Camisa de futebol do ${club} confeccionada em tecido poliéster 100% com tecnologia Dry-Fit antissuor, escudo bordado de alta definição, costuras reforçadas e modelagem anatômica para treino e lazer.`;
      }
    },
    {
      name: 'Chuteira Society Pro Grip',
      category: 'Esportes',
      count: 60,
      priceRange: [129.9, 189.9],
      images: [
        'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        const model = `SpeedGrip V${(idx % 5) + 1}`;
        return `Chuteira Society Pro Grip com Travas Borracha ${model} ${color}`;
      },
      descriptionGenerator: () => {
        return `Chuteira society com solado emborrachado com microtravas multidirecionais para máxima tração no gramado sintético, cabedal texturizado para controle de bola e palmilha em EVA macio.`;
      }
    },
    {
      name: 'Bola de Futebol Campo e Futsal',
      category: 'Esportes',
      count: 60,
      priceRange: [79.9, 119.9],
      images: [
        'https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const type = idx % 2 === 0 ? 'Campo Oficial' : 'Futsal Profissional';
        return `Bola de Futebol ${type} Termofusão Sem Costura Edição Match ${(idx % 10) + 1}`;
      },
      descriptionGenerator: () => {
        return `Bola oficial confeccionada com tecnologia de termofusão sem costura, zero absorção de água, câmara de ar butílica com retenção de pressão prolongada e peso regulamentar.`;
      }
    },
    {
      name: 'Luva de Goleiro Grip Profissional',
      category: 'Esportes',
      count: 60,
      priceRange: [99.9, 159.9],
      images: [
        'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const size = (idx % 4) + 8; // Tam 8, 9, 10, 11
        const cut = idx % 2 === 0 ? 'Corte Negativo' : 'Roll Finger';
        return `Luva de Goleiro Profissional ${cut} Palma Látex Alemão 4mm Tam ${size}`;
      },
      descriptionGenerator: () => {
        return `Luva com palma em látex alemão de 4mm com aderência superior em piso seco ou molhado, munhequeira elástica com cinta de velcro dupla e dorso acolchoado para amortecimento de impacto.`;
      }
    },
    {
      name: 'Garrafa Squeeze Térmica Inox',
      category: 'Esportes',
      count: 60,
      priceRange: [49.9, 79.9],
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const vol = idx % 2 === 0 ? '750ml' : '1 Litro';
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Garrafa Squeeze Térmica Inox Vacuum ${vol} Parede Dupla ${color}`;
      },
      descriptionGenerator: () => {
        return `Garrafa em aço inox 304 com isolamento térmico a vácuo de parede dupla, preserva líquidos gelados por até 24 horas e quentes por 12 horas, tampa antifuga com bico esportivo.`;
      }
    },
    {
      name: 'Joelheira de Compressão Neoprene',
      category: 'Esportes',
      count: 60,
      priceRange: [39.9, 69.9],
      images: [
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Joelheira de Compressão Ajustável com Estabilizador Patelar Pro ${color}`;
      },
      descriptionGenerator: () => {
        return `Suporte ortopédico esportivo de alta compressão com anel de silicone anatômico para proteção da patela, hastes flexíveis laterais e tecido respirável que não esquenta.`;
      }
    }
  ],

  innova: [
    {
      name: 'Smartwatch Ultra Series AMOLED',
      category: 'Eletrônicos',
      count: 60,
      priceRange: [139.9, 199.9],
      images: [
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const series = idx % 3 === 0 ? 'Series 9 Pro Max' : idx % 3 === 1 ? 'Ultra 2 Titanium' : 'Series 8 AMOLED';
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Smartwatch ${series} Tela 2.02" AMOLED Caixa Reforçada ${color}`;
      },
      descriptionGenerator: () => {
        return `Smartwatch com tela infinita AMOLED de alta resolução, coroa giratória funcional, atende e faz chamadas telefônicas via Bluetooth, monitoramento de saúde 24h e mais de 100 modos esportivos.`;
      }
    },
    {
      name: 'Fone de Ouvido Bluetooth TWS ANC',
      category: 'Eletrônicos',
      count: 65,
      priceRange: [59.9, 119.9],
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const model = `AirBass ANC Gen-${(idx % 6) + 1}`;
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Fone de Ouvido Bluetooth TWS Pro ${model} Baixa Latência ${color}`;
      },
      descriptionGenerator: () => {
        return `Fone estéreo com cancelamento ativo de ruído ANC, drivers dinâmicos de 13mm para graves profundos, microfone com redução de vento, baixa latência para vídeos e estojo com até 28h de autonomia.`;
      }
    },
    {
      name: 'Mini Projetor Smart 4K Portátil',
      category: 'Eletrônicos',
      count: 55,
      priceRange: [269.9, 389.9],
      images: [
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const model = `Cinema Pro 5G Mod-${(idx % 5) + 1}`;
        return `Mini Projetor Portátil Smart 4K Wi-Fi 5G Android Integrado ${model}`;
      },
      descriptionGenerator: () => {
        return `Projetor compacto com rotação de 180°, suporte a decodificação 4K, conexão Wi-Fi dual-band 5G, sistema Android com apps de streaming integrados e auto-keystone para correção de imagem.`;
      }
    },
    {
      name: 'Power Bank Turbo com Display Digital',
      category: 'Eletrônicos',
      count: 65,
      priceRange: [79.9, 139.9],
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const cap = idx % 2 === 0 ? '20.000mAh' : '10.000mAh';
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Carregador Power Bank ${cap} Turbo PD 22.5W com Display Digital ${color}`;
      },
      descriptionGenerator: () => {
        return `Bateria externa portátil de alta densidade com display em LED indicador de porcentagem exata, múltiplas portas USB e USB-C com tecnologia Power Delivery e proteção contra sobretensão.`;
      }
    },
    {
      name: 'Caixa de Som Bluetooth Subwoofer IPX7',
      category: 'Eletrônicos',
      count: 70,
      priceRange: [89.9, 169.9],
      images: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const power = (idx % 4 === 0) ? '30W' : (idx % 4 === 1) ? '40W' : (idx % 4 === 2) ? '20W' : '50W';
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Caixa de Som Bluetooth Portátil Subwoofer IPX7 ${power} RMS ${color}`;
      },
      descriptionGenerator: () => {
        return `Caixa de som sem fio com radiadores passivos de graves reforçados, certificação IPX7 à prova de respingos d'água, bateria para até 14h de som contínuo e conexão TWS para emparelhar duas caixas.`;
      }
    },
    {
      name: 'Microfone Lapela Sem Fio Duplo',
      category: 'Eletrônicos',
      count: 65,
      priceRange: [49.9, 89.9],
      images: [
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const conn = idx % 2 === 0 ? 'Tipo-C Android / iPhone 15' : 'Conector Lightning Apple';
        return `Microfone de Lapela Sem Fio Duplo com Redução de Ruído para ${conn}`;
      },
      descriptionGenerator: () => {
        return `Kit com 2 microfones lapela e 1 receptor sem fio com emparelhamento automático instantâneo, captação omnidirecional 360°, filtro de ruído acústico inteligente e alcance de até 20 metros sem delay.`;
      }
    }
  ],

  lumina: [
    {
      name: 'Body Splash Desodorante Colônia',
      category: 'Beleza',
      count: 60,
      priceRange: [39.9, 69.9],
      images: [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const frag = FRAGRANCES[idx % FRAGRANCES.length];
        return `Body Splash Desodorante Colônia ${frag} 250ml Fixação 24h`;
      },
      descriptionGenerator: (idx) => {
        const frag = FRAGRANCES[idx % FRAGRANCES.length];
        return `Desodorante colônia na fragrância ${frag} enriquecida com notas olfativas envolventes, rápida absorção na pele, fixação de até 12 horas e toque acetinado sem ressecar.`;
      }
    },
    {
      name: 'Sérum Facial Concentrado Skincare',
      category: 'Beleza',
      count: 60,
      priceRange: [34.9, 59.9],
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const active = SKINCARE_ACTIVES[idx % SKINCARE_ACTIVES.length];
        return `Sérum Facial Concentrado ${active} Tratamento Anti-Idade 30ml`;
      },
      descriptionGenerator: (idx) => {
        const active = SKINCARE_ACTIVES[idx % SKINCARE_ACTIVES.length];
        return `Sérum facial dermatológico com ${active}, textura fluida de rápida absorção, combate radicais livres, hidrata profundamente e restaura o viço natural da pele.`;
      }
    },
    {
      name: 'Escova Alisadora Secadora Cerâmica',
      category: 'Beleza',
      count: 60,
      priceRange: [69.9, 119.9],
      images: [
        'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Escova Alisadora e Secadora 3 em 1 Íons Cerâmica Turmalina ${color}`;
      },
      descriptionGenerator: () => {
        return `Escova com cerdas mistas macias e flexíveis com pontas arredondadas, gerador de íons negativos que selam as cutículas reduzindo o frizz e 3 temperaturas reguláveis para todos os tipos de fios.`;
      }
    },
    {
      name: 'Paleta de Sombras Ultra Pigmentada',
      category: 'Beleza',
      count: 60,
      priceRange: [44.9, 79.9],
      images: [
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const palette = idx % 2 === 0 ? 'Nude Glamour 18 Cores' : 'Sunset Desert Matte & Brilho 24 Cores';
        return `Paleta de Sombras Profissional ${palette} Ultra Pigmentada`;
      },
      descriptionGenerator: () => {
        return `Paleta com cores altamente pigmentadas de fácil aplicação e esfumado uniforme, tons matte aveludados e cintilantes de longa durabilidade à prova d'água.`;
      }
    },
    {
      name: 'Gloss Labial Efeito Volume Plump',
      category: 'Beleza',
      count: 60,
      priceRange: [24.9, 42.9],
      images: [
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const tone = idx % 3 === 0 ? 'Rosa Translúcido' : idx % 3 === 1 ? 'Nude Cristal' : 'Pêssego Brilhante';
        return `Gloss Labial Hidratante Efeito Plump Volume com Ácido Hialurônico ${tone}`;
      },
      descriptionGenerator: () => {
        return `Gloss labial formulado com microesferas de ácido hialurônico que promovem volume imediato e hidratação profunda sem sensação pegajosa, com brilho espelhado luminoso.`;
      }
    },
    {
      name: 'Creme Hidratante Corporal Nutritivo',
      category: 'Beleza',
      count: 60,
      priceRange: [29.9, 49.9],
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const frag = FRAGRANCES[idx % FRAGRANCES.length];
        return `Creme Hidratante Corporal Nutritivo Manteiga de Karité ${frag} 200g`;
      },
      descriptionGenerator: () => {
        return `Hidratante desodorante corporal com ação desodorante e nutritiva profunda, textura cremosa densa que absorve rápido sem engordurar a pele, deixando toque aveludado e perfume suave.`;
      }
    }
  ],

  hometech: [
    {
      name: 'Painel Ripado Autoadesivo EVA',
      category: 'Casa & Decoração',
      count: 60,
      priceRange: [69.9, 139.9],
      images: [
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const pattern = idx % 2 === 0 ? 'Madeira Freijó Nobre' : 'Carvalho Europeu';
        const len = (idx % 3 === 0) ? '10 Metros' : (idx % 3 === 1) ? '15 Metros' : '20 Metros';
        return `Kit Painel Ripado Autoadesivo Flexível ${len} ${pattern}`;
      },
      descriptionGenerator: () => {
        return `Revestimento de parede moderno autocolante em EVA de alta densidade, resistente à umidade, lavável, isolamento térmico e acústico, dispensa cola extra e ferramentas complexas.`;
      }
    },
    {
      name: 'Barra de Luz LED para Monitor',
      category: 'Casa & Decoração',
      count: 60,
      priceRange: [89.9, 149.9],
      images: [
        'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Barra de Luz LED para Monitor Anti-Reflexo com Sensor Touch ${color}`;
      },
      descriptionGenerator: () => {
        return `Luminária linear para fixação em monitores de qualquer espessura, iluminação frontal assimétrica que elimina reflexos na tela e previne cansaço visual em longas sessões de trabalho ou estudo.`;
      }
    },
    {
      name: 'Umidificador Efeito Chama LED',
      category: 'Casa & Decoração',
      count: 60,
      priceRange: [69.9, 119.9],
      images: [
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Umidificador e Difusor de Aromas Ultrassônico Efeito Chama LED Flame ${color}`;
      },
      descriptionGenerator: () => {
        return `Aparelho ultrassônico silencioso com luz LED quente que simula chama realista de lareira, tanque de água com desligamento automático inteligente e compatível com óleos essenciais aromáticos.`;
      }
    },
    {
      name: 'Organizadores Acrílicos Modulares',
      category: 'Casa & Decoração',
      count: 60,
      priceRange: [39.9, 79.9],
      images: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const pcs = (idx % 3 === 0) ? '6 Peças' : (idx % 3 === 1) ? '8 Peças' : '12 Peças';
        return `Kit Organizadores Transparentes Empilháveis para Gavetas e Closet ${pcs}`;
      },
      descriptionGenerator: () => {
        return `Organizadores transparentes empilháveis de plástico rígido livre de BPA, bordas arredondadas e divisórias práticas para manter roupas íntimas, maquiagens, talheres e gavetas perfeitamente arrumadas.`;
      }
    },
    {
      name: 'Copo Térmico Inox com Tampa',
      category: 'Cozinha',
      count: 55,
      priceRange: [39.9, 69.9],
      images: [
        'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Copo Térmico em Aço Inox 473ml com Tampa e Abridor Embutido ${color}`;
      },
      descriptionGenerator: () => {
        return `Copo com parede dupla com isolamento a vácuo, mantém a cerveja ou refrigerante gelado por mais de 4 horas sem transpirar na parte externa, acompanha tampa com bocal e abridor de garrafas.`;
      }
    },
    {
      name: 'Mini Processador Elétrico USB',
      category: 'Cozinha',
      count: 55,
      priceRange: [34.9, 54.9],
      images: [
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const cap = idx % 2 === 0 ? '250ml' : '300ml';
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Mini Processador e Triturador Elétrico sem Fio USB ${cap} ${color}`;
      },
      descriptionGenerator: () => {
        return `Triturador compacto sem fio com 3 lâminas afiadas em aço inox, acionamento prático por botão superior para picar alho, cebola, nozes e legumes em segundos, fácil de lavar e carregar.`;
      }
    }
  ],

  trendfit: [
    {
      name: 'Legging Levanta Bumbum Sem Costura',
      category: 'Fitness',
      count: 65,
      priceRange: [59.9, 89.9],
      images: [
        'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Calça Legging Sem Costura Cintura Alta Efeito Empina Bumbum 3D ${color}`;
      },
      descriptionGenerator: () => {
        return `Legging fitness confeccionada em malha texturizada com elasticidade em 4 direções, zero transparência no agachamento, cós duplo anatômico compressivo que afina a cintura sem descer.`;
      }
    },
    {
      name: 'Top Fitness Alta Sustentação Bojo',
      category: 'Fitness',
      count: 65,
      priceRange: [39.9, 65.9],
      images: [
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Top Fitness Alta Sustentação com Alças Cruzadas e Bojo Removível ${color}`;
      },
      descriptionGenerator: () => {
        return `Top de treino com compressão ideal para corridas e treinos de alto impacto, tecido dry antitranspirante de toque macio e forro interno respirável com bojos removíveis.`;
      }
    },
    {
      name: 'Camiseta Oversized Streetwear Algodão',
      category: 'Moda',
      count: 60,
      priceRange: [59.9, 94.9],
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        const edit = idx % 2 === 0 ? 'Edição Minimalista Heavy' : 'Graphic Box Street';
        return `Camiseta Oversized Streetwear 100% Algodão 240g ${edit} ${color}`;
      },
      descriptionGenerator: () => {
        return `Camiseta corte amplo oversized no estilo streetwear autêntico, gola canelada grossa 2.5cm, malha 100% algodão penteado fio 26.1 que não encolhe e não desbota na lavagem.`;
      }
    },
    {
      name: 'Short Duplo Corrida com Bolso',
      category: 'Fitness',
      count: 60,
      priceRange: [49.9, 79.9],
      images: [
        'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Short 2 em 1 de Corrida e Academia com Forro de Compressão Interno ${color}`;
      },
      descriptionGenerator: () => {
        return `Short duplo com bermuda de compressão interna que evita assaduras por atrito nas coxas, bolso elástico justo para segurar celular com segurança e cós com cordão de ajuste.`;
      }
    },
    {
      name: 'Jaqueta Corta-Vento Impermeável',
      category: 'Moda',
      count: 60,
      priceRange: [89.9, 149.9],
      images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Jaqueta Corta-Vento Streetwear Repelente à Água com Capuz ${color}`;
      },
      descriptionGenerator: () => {
        return `Jaqueta leve confeccionada em poliéster ripstop impermeável, forro interno em tela mesh respirável, bolsos frontais com fechamento seguro e elásticos ajustáveis nos punhos e na barra.`;
      }
    },
    {
      name: 'Moletom Canguru Flanelado Street',
      category: 'Moda',
      count: 60,
      priceRange: [99.9, 169.9],
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Moletom Canguru Flanelado com Capuz Forrado e Bolso Frontal ${color}`;
      },
      descriptionGenerator: () => {
        return `Agasalho confeccionado em moletom premium 3 cabos com interior macio felpado super quente, cordão roliço no capuz e punhos canelados com elastano que não laceiam.`;
      }
    }
  ],

  autopro: [
    {
      name: 'Suporte Celular Veicular Indução',
      category: 'Automotivo',
      count: 60,
      priceRange: [59.9, 99.9],
      images: [
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const model = `SmartGrip Qi V${(idx % 4) + 1}`;
        return `Suporte Celular Veicular Inteligente Indução Qi com Sensor ${model}`;
      },
      descriptionGenerator: () => {
        return `Suporte veicular com abertura e fechamento automatizado por sensor de presença, carregamento sem fio rápido Fast Charge e fixação estável nas aletas da saída de ventilação ou ventosa.`;
      }
    },
    {
      name: 'Transmissor FM Bluetooth Veicular',
      category: 'Automotivo',
      count: 60,
      priceRange: [34.9, 59.9],
      images: [
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const version = `BT 5.0 Dual USB QC 3.0 Mod-${(idx % 5) + 1}`;
        return `Transmissor FM Bluetooth Veicular Viva-Voz Carregador Turbo ${version}`;
      },
      descriptionGenerator: () => {
        return `Adaptador para rádio automotivo que conecta o celular via Bluetooth, permite chamadas nítidas sem tirar as mãos do volante e carrega smartphones simultaneamente pela porta Turbo QC 3.0.`;
      }
    },
    {
      name: 'Mini Compressor de Ar Digital',
      category: 'Automotivo',
      count: 60,
      priceRange: [119.9, 179.9],
      images: [
        'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const model = `AirPro Digital 150 PSI Mod-${(idx % 4) + 1}`;
        return `Mini Compressor de Ar Digital Sem Fio Bateria Recarregável ${model}`;
      },
      descriptionGenerator: () => {
        return `Bomba de ar compacta digital para calibrar pneus de carros, motos, bicicletas e bolas esportivas com ajuste de pressão exata em PSI/BAR e corte automático imediato ao atingir o limite.`;
      }
    },
    {
      name: 'Câmera Veicular Dash Cam Full HD',
      category: 'Automotivo',
      count: 60,
      priceRange: [89.9, 159.9],
      images: [
        'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const angle = idx % 2 === 0 ? 'Ângulo Amplo 170°' : 'Visão Noturna Sony Sensor';
        return `Câmera de Segurança Veicular Dash Cam Full HD 1080p ${angle}`;
      },
      descriptionGenerator: () => {
        return `Câmera frontal veicular com gravação contínua em loop no cartão de memória micro SD, sensor de impacto G-sensor que bloqueia gravações de colisões e tela LCD para visualização em tempo real.`;
      }
    },
    {
      name: 'Lâmpadas LED Automotivas 6000K',
      category: 'Automotivo',
      count: 55,
      priceRange: [69.9, 119.9],
      images: [
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const encaixe = ['H4', 'H7', 'H11', 'HB4', 'H1', 'H3'][idx % 6];
        return `Par de Lâmpadas LED Automotivas Encaixe ${encaixe} Super Branca 6000K 12V`;
      },
      descriptionGenerator: (idx) => {
        const encaixe = ['H4', 'H7', 'H11', 'HB4', 'H1', 'H3'][idx % 6];
        return `Kit com 2 lâmpadas LED com encaixe ${encaixe} de alta intensidade, feixe de luz nítido e focalizado sem pontos cegos, cooler traseiro de resfriamento em alumínio aeronáutico e instalação plug & play.`;
      }
    },
    {
      name: 'Aspirador de Pó Portátil Automotivo',
      category: 'Automotivo',
      count: 55,
      priceRange: [54.9, 89.9],
      images: [
        'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Aspirador de Pó Portátil Automotivo Sem Fio Bateria USB 6000Pa ${color}`;
      },
      descriptionGenerator: () => {
        return `Aspirador compacto e leve para limpeza de bancos, carpetes e painéis veiculares, filtro HEPA reutilizável lavável e bicos com escova para limpar saídas de ar e frestas estreitas.`;
      }
    }
  ],

  petmania: [
    {
      name: 'Bebedouro Fonte Automática Pet',
      category: 'Pet',
      count: 60,
      priceRange: [59.9, 99.9],
      images: [
        'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const vol = idx % 2 === 0 ? '2 Litros' : '2.5 Litros';
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Bebedouro Fonte de Água Automática Silenciosa para Cães e Gatos ${vol} ${color}`;
      },
      descriptionGenerator: () => {
        return `Fonte de água contínua com sistema de tripla filtragem em carvão ativado que elimina pelos, cloro e impurezas, bomba submersa de consumo ultraeconômico e operação totalmente silenciosa.`;
      }
    },
    {
      name: 'Escova a Vapor Tira Pelos 3 em 1',
      category: 'Pet',
      count: 60,
      priceRange: [44.9, 69.9],
      images: [
        'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Escova a Vapor Tira Pelos Pet 3 em 1 com Névoa Hidratante ${color}`;
      },
      descriptionGenerator: () => {
        return `Escova inovadora com cerdas de silicone macias e difusor de vapor suave recarregável via USB, desembaraça os nós e remove até 95% dos pelos soltos sem irritar a pele do animal.`;
      }
    },
    {
      name: 'Brinquedo Interativo Pet Laser',
      category: 'Pet',
      count: 60,
      priceRange: [39.9, 69.9],
      images: [
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const type = idx % 2 === 0 ? 'Laser Rotativo 360 Automático' : 'Torre de Bolinhas Tripla Trilha';
        return `Brinquedo Interativo Estimulante para Gatos e Cães ${type}`;
      },
      descriptionGenerator: () => {
        return `Brinquedo interativo estimulante que entretém cães e gatos, reduz o estresse, a ansiedade de separação e o hábito de morder móveis, funcionando de forma autônoma e segura.`;
      }
    },
    {
      name: 'Cama Nuvem Pelúcia Antiestresse',
      category: 'Pet',
      count: 60,
      priceRange: [69.9, 139.9],
      images: [
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const size = ['Tamanho P (50cm)', 'Tamanho M (60cm)', 'Tamanho G (70cm)', 'Tamanho GG (80cm)'][idx % 4];
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Cama Nuvem Pet Pelúcia Antiestresse Redonda Lavável ${size} ${color}`;
      },
      descriptionGenerator: () => {
        return `Cama redonda em pelúcia macia hipoalergênica com bordas altas que proporcionam sensação aconchegante de ninho e apoio ortopédico para cabeça e articulações, fundo antiderrapante impermeável.`;
      }
    },
    {
      name: 'Coleira Peitoral Antipuxão Refletiva',
      category: 'Pet',
      count: 55,
      priceRange: [39.9, 69.9],
      images: [
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const size = ['Tam P', 'Tam M', 'Tam G', 'Tam GG'][idx % 4];
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Coleira Peitoral Antipuxão Ergonômica com Fita Refletiva ${size} ${color}`;
      },
      descriptionGenerator: () => {
        return `Peitoral anatômico respirável que distribui uniformemente a pressão no tórax do cão durante os passeios, fivelas de liberação rápida, alça de controle dorsal resistente e faixas refletivas noturnas.`;
      }
    },
    {
      name: 'Comedouro Lento Interativo Antigula',
      category: 'Pet',
      count: 55,
      priceRange: [29.9, 49.9],
      images: [
        'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Comedouro Lento Interativo Antigula em Labirinto Digestivo ${color}`;
      },
      descriptionGenerator: () => {
        return `Prato comedouro confeccionado em polipropileno atóxico de grau alimentar, obstáculos em relevo que desaceleram a velocidade com que o pet ingere ração, prevenindo engasgos e problemas digestivos.`;
      }
    }
  ],

  playzone: [
    {
      name: 'Headset Gamer Surround 7.1 RGB',
      category: 'Setup Gamer',
      count: 60,
      priceRange: [89.9, 169.9],
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const model = `Surround 7.1 Pro Drivers 50mm Gen-${(idx % 5) + 1}`;
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Headset Gamer ${model} com Iluminação RGB e Microfone Flexível ${color}`;
      },
      descriptionGenerator: () => {
        return `Headset gamer com som surround 7.1 virtual para percepção precisa de passos e tiros em jogos competitivos, almofadas circumaurais em courino respirável e microfone articulado omnidirecional.`;
      }
    },
    {
      name: 'Teclado Mecânico Compacto 60% RGB',
      category: 'Setup Gamer',
      count: 60,
      priceRange: [119.9, 229.9],
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const sw = idx % 2 === 0 ? 'Switch Blue Tátil' : 'Switch Red Linear';
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Teclado Mecânico Compacto 60% ${sw} RGB Hot-Swap ${color}`;
      },
      descriptionGenerator: () => {
        return `Teclado mecânico gamer de formato reduzido 60% para máxima área de deslize do mouse, switches mecânicos com durabilidade de 50 milhões de cliques, anti-ghosting em 100% das teclas e cabo USB-C removível.`;
      }
    },
    {
      name: 'Mouse Gamer Óptico 12.800 DPI',
      category: 'Setup Gamer',
      count: 60,
      priceRange: [59.9, 119.9],
      images: [
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const dpi = idx % 2 === 0 ? '12.800 DPI Sensor Óptico' : '7.200 DPI Ultraleve 65g';
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Mouse Gamer Óptico ${dpi} 7 Botões Programáveis RGB ${color}`;
      },
      descriptionGenerator: () => {
        return `Mouse gamer ergonômico com sensor óptico de rastreamento de alta velocidade, botões laterais com suporte a macros, cabo paracord flexível ultraleve e skates em teflon 100% PTFE para deslizamento sem esforço.`;
      }
    },
    {
      name: 'Mousepad Gamer Speed Extra Grande 90x40cm',
      category: 'Setup Gamer',
      count: 60,
      priceRange: [39.9, 74.9],
      images: [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const theme = ['Cyberpunk Neon', 'Dark Minimalist', 'Tokyo Street', 'Galaxy Cosmos', 'Carbon Texture', 'Abstract Wave'][idx % 6];
        return `Mousepad Gamer Speed Extra Grande 900x400mm Estampa ${theme} Borda Costurada`;
      },
      descriptionGenerator: () => {
        return `Mousepad gamer gigante com superfície de tecido microtrançado otimizado para sensores ópticos e laser, base de borracha texturizada antiderrapante de 3mm e bordas com costura reforçada antidesfiamento.`;
      }
    },
    {
      name: 'Suporte de Headset RGB com Hub USB',
      category: 'Setup Gamer',
      count: 60,
      priceRange: [49.9, 89.9],
      images: [
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const color = COLORS_GENERAL[idx % COLORS_GENERAL.length];
        return `Suporte de Headset Gamer de Mesa com Iluminação RGB e 2 Portas Hub USB ${color}`;
      },
      descriptionGenerator: () => {
        return `Suporte organizador para fone de ouvido gamer com base ponderada estável, iluminação RGB com modos personalizáveis touch e portas USB frontais para conectar pen drives e recarregar periféricos.`;
      }
    },
    {
      name: 'Fita LED RGB 5050 com Sensor Rítmico',
      category: 'Setup Gamer',
      count: 60,
      priceRange: [34.9, 59.9],
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
      ],
      titleGenerator: (idx) => {
        const len = idx % 2 === 0 ? '5 Metros' : '10 Metros';
        return `Fita de LED RGB 5050 ${len} com Controle Remoto e Sensor Rítmico de Música`;
      },
      descriptionGenerator: () => {
        return `Fita de iluminação com LEDs de alto brilho para aplicar atrás da mesa de computador ou monitor, microfone integrado que reage às batidas dos jogos e músicas, fita adesiva 3M e fonte bivolt inclusa.`;
      }
    }
  ]
};

/**
 * Builds the complete deterministic product catalog.
 * Guaranteeing 350 to 380 products per supplier, completely matching title, image, and description.
 */
function generateSupplierCatalog(): Product[] {
  const allProducts: Product[] = [];

  for (const [supplierId, meta] of Object.entries(SUPPLIER_METADATA)) {
    const archetypes = SUPPLIER_ARCHETYPES[supplierId] || [];
    let supplierProdIdx = 1;

    for (const arch of archetypes) {
      for (let i = 0; i < arch.count; i++) {
        const prodId = `prod_${supplierId}_${String(supplierProdIdx).padStart(3, '0')}`;
        const name = arch.titleGenerator(i);
        const description = arch.descriptionGenerator(i);
        const image_url = arch.images[i % arch.images.length];

        // Determistic price inside priceRange
        const minP = arch.priceRange[0];
        const maxP = arch.priceRange[1];
        const step = (maxP - minP) / (arch.count - 1 || 1);
        const rawPrice = minP + (i * step);
        const price = Math.round(rawPrice * 10) / 10;

        const commissionNum = price * 0.32;
        const commission = `R$ ${commissionNum.toFixed(2).replace('.', ',')}`;
        
        // Hype score 88 to 99
        const hype_score = 88 + ((supplierProdIdx * 7) % 12);
        const status = hype_score >= 94 ? 'ALTA' : 'ESTÁVEL';
        const vendas_mes = Math.max(850, meta.defaultSales + ((supplierProdIdx * 37) % 1800) - 900);

        allProducts.push({
          id: prodId,
          name,
          title: name,
          price,
          image_url,
          hype_score,
          score: hype_score,
          url: `https://shopee.com.br/search?keyword=${encodeURIComponent(name)}`,
          status,
          category: arch.category,
          commission,
          vendas_mes,
          supplier: meta.name,
          supplierId,
          description
        });

        supplierProdIdx++;
      }
    }
  }

  return allProducts;
}

export const ALL_SUPPLIER_PRODUCTS: Product[] = generateSupplierCatalog();

/**
 * Filter catalog products based on currently activated supplier IDs.
 * If empty list is passed, returns empty array (user must activate suppliers).
 */
export function getProductsByActivatedSuppliers(activatedIds: string[]): Product[] {
  if (!activatedIds || activatedIds.length === 0) {
    return [];
  }
  const idSet = new Set(activatedIds.map(id => id.toLowerCase()));
  return ALL_SUPPLIER_PRODUCTS.filter(p => idSet.has((p.supplierId || '').toLowerCase()));
}

/**
 * Returns summary counts per supplier
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
