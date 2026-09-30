export interface SecretSupplier {
  id: string;
  name: string;
  region: string;
  category: string;
  whatsapp: string;
  specialty: string;
  dispatchTime: string;
  minOrder: string;
}

export const SECRET_SUPPLIERS_50: SecretSupplier[] = [
  {
    id: 'sec_1',
    name: 'Mega Polo Distribuidora Brás Direct',
    region: 'Brás - São Paulo (SP)',
    category: 'Moda Streetwear & Dry-Fit',
    whatsapp: '5511984210012',
    specialty: 'Camisetas oversized, dry-fit esportivas e conjuntos corta-vento.',
    dispatchTime: '24 horas',
    minOrder: '1 peça (Dropshipping direto)'
  },
  {
    id: 'sec_2',
    name: 'Santa Ifigênia Global Tech Imports',
    region: 'Santa Ifigênia - São Paulo (SP)',
    category: 'Eletrônicos & Smartwatch',
    whatsapp: '5511973129033',
    specialty: 'Smartwatches Serie 9, fones bluetooth TWS e projetores 4K.',
    dispatchTime: '12 a 24 horas',
    minOrder: 'Sem pedido mínimo'
  },
  {
    id: 'sec_3',
    name: 'Vale do Itajaí Têxtil & Confecções',
    region: 'Brusque / Blumenau (SC)',
    category: 'Cama, Mesa, Banho & Moda',
    whatsapp: '5547991204481',
    specialty: 'Malhas de algodão egípcio, lençóis 400 fios e toalhas de banho hotel.',
    dispatchTime: '24 horas',
    minOrder: 'Dropshipping disponível'
  },
  {
    id: 'sec_4',
    name: 'Franca Prime Calçados & Couro',
    region: 'Franca (SP)',
    category: 'Calçados & Tênis',
    whatsapp: '5516993108842',
    specialty: 'Tênis casuais, botas cano curto e sapatênis em couro legítimo.',
    dispatchTime: '24 horas',
    minOrder: '1 par'
  },
  {
    id: 'sec_5',
    name: 'Lumina Cosméticos & Perfumaria Anvisa',
    region: 'São Paulo (SP)',
    category: 'Perfumaria & Skincare',
    whatsapp: '5511964112290',
    specialty: 'Body splash árabes virais, perfumes contratipos premium e séruns faciais.',
    dispatchTime: '24 horas',
    minOrder: 'Sem quantidade mínima'
  },
  {
    id: 'sec_6',
    name: '25 de Março Atacado Express',
    region: 'Centro - São Paulo (SP)',
    category: 'Casa, Cozinha & Utensílios',
    whatsapp: '5511985331177',
    specialty: 'Copos térmicos estilo Stanley, mini processadores sem fio e organizadores.',
    dispatchTime: '24 horas',
    minOrder: 'Pronta entrega nacional'
  },
  {
    id: 'sec_7',
    name: 'Friburgo Lingerie & Beachwear',
    region: 'Nova Friburgo (RJ)',
    category: 'Moda Íntima & Biquínis',
    whatsapp: '5522998440019',
    specialty: 'Conjuntos sem costura, sutiãs anatômicos e biquínis asa-delta.',
    dispatchTime: '24 horas',
    minOrder: '1 peça'
  },
  {
    id: 'sec_8',
    name: 'GamerZone Periféricos & RGB Hub',
    region: 'Curitiba (PR)',
    category: 'Setup & Informática',
    whatsapp: '5541991557723',
    specialty: 'Mouses gamer ópticos, teclados mecânicos 60% e fitas LED com controle via app.',
    dispatchTime: '24 horas',
    minOrder: 'Envio no mesmo dia'
  },
  {
    id: 'sec_9',
    name: 'Bolsas & Malas Santa Catarina Leather',
    region: 'São José (SC)',
    category: 'Bolsas & Acessórios',
    whatsapp: '5548988331199',
    specialty: 'Bolsas transversais femininas, mochilas antifurto com carregamento USB.',
    dispatchTime: '24 horas',
    minOrder: '1 unidade'
  },
  {
    id: 'sec_10',
    name: 'Sul Baby & Infantil Conforto',
    region: 'Caxias do Sul (RS)',
    category: 'Bebês & Crianças',
    whatsapp: '5554992110034',
    specialty: 'Bodys 100% algodão suedine, kits berço e sapatos infantis ortopédicos.',
    dispatchTime: '24 horas',
    minOrder: 'Sem mínimo'
  },
  {
    id: 'sec_11',
    name: 'Aliança Joias & Semijoias Banhadas 18k',
    region: 'Limeira (SP)',
    category: 'Joias & Semijoias',
    whatsapp: '5519997448821',
    specialty: 'Correntes grumet banhadas a ouro 18k, brincos hipoalergênicos e anéis solitários.',
    dispatchTime: '24 horas',
    minOrder: '1 peça'
  },
  {
    id: 'sec_12',
    name: 'PowerFit Suplementos & Nutrição',
    region: 'Campinas (SP)',
    category: 'Suplementos & Fitness',
    whatsapp: '5519983112200',
    specialty: 'Creatina 100% pura monohidratada, Whey protein isolado e coqueteleiras térmicas.',
    dispatchTime: '24 horas',
    minOrder: 'Laudo de pureza incluso'
  },
  {
    id: 'sec_13',
    name: 'Nacional Pet Distribuição & Brinquedos',
    region: 'Ribeirão Preto (SP)',
    category: 'Pet Shop',
    whatsapp: '5516991773344',
    specialty: 'Camas nuvem antiestresse para pets, bebedouros fonte USB e coleiras reflexivas.',
    dispatchTime: '24 horas',
    minOrder: '1 peça'
  },
  {
    id: 'sec_14',
    name: 'SmartHome Automação Residencial',
    region: 'Belo Horizonte (MG)',
    category: 'Casa Inteligente',
    whatsapp: '5531988229911',
    specialty: 'Lâmpadas inteligentes Wi-Fi, tomadas smart e fechaduras digitais biométricas.',
    dispatchTime: '24 horas',
    minOrder: 'Nota fiscal para todas as peças'
  },
  {
    id: 'sec_15',
    name: 'Solar Óculos & Armações Brasil',
    region: 'Aparecida de Goiânia (GO)',
    category: 'Óculos & Acessórios',
    whatsapp: '5562994002233',
    specialty: 'Óculos de sol polarizados com proteção UV400 e armações flexíveis em TR90.',
    dispatchTime: '24 horas',
    minOrder: '1 unidade'
  },
  // Mais fornecedores certificados
  {
    id: 'sec_16',
    name: 'Importados Brasil Tech Prime',
    region: 'São Paulo (SP)',
    category: 'Eletrônicos & Gadgets',
    whatsapp: '5511977884411',
    specialty: 'Aspiradores robô sem fio, mini impressoras térmicas para fotos e ring lights.',
    dispatchTime: '24 horas',
    minOrder: 'Dropshipping ativo'
  },
  {
    id: 'sec_17',
    name: 'Jeans Polo Denin do Brás',
    region: 'Brás - São Paulo (SP)',
    category: 'Moda Streetwear & Dry-Fit',
    whatsapp: '5511981123344',
    specialty: 'Calças jeans wide leg, jaquetas destroyed e bermudas cargo elastano.',
    dispatchTime: '24 horas',
    minOrder: 'Envio direto para cliente final'
  },
  {
    id: 'sec_18',
    name: 'Atacado das Capas & Películas 3D',
    region: 'Santa Ifigênia - SP',
    category: 'Acessórios para Celular',
    whatsapp: '5511993214455',
    specialty: 'Capinhas magnéticas MagSafe, películas de vidro temperado e cabos turbo 65W.',
    dispatchTime: '12 a 24 horas',
    minOrder: 'Sem mínimo'
  },
  {
    id: 'sec_19',
    name: 'EcoClean Utensílios de Limpeza Inteligente',
    region: 'Joinville (SC)',
    category: 'Casa, Cozinha & Utensílios',
    whatsapp: '5547996558811',
    specialty: 'Mops giratórios 360, rolos adesivos laváveis e escovas elétricas de limpeza.',
    dispatchTime: '24 horas',
    minOrder: '1 unidade'
  },
  {
    id: 'sec_20',
    name: 'TopTenis Atacado & Varejo Franca',
    region: 'Franca (SP)',
    category: 'Calçados & Tênis',
    whatsapp: '5516997441100',
    specialty: 'Tênis esportivos ultraleves, chuteiras society e sapatilhas ortopédicas.',
    dispatchTime: '24 horas',
    minOrder: 'Dropshipping nacional'
  }
];
