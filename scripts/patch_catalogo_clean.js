const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/views/CatalogoView.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add PublishingProgressModal import
if (!code.includes('PublishingProgressModal')) {
  code = code.replace(
    "import MarginSelectionModal, { MarginConfig } from '@/components/MarginSelectionModal';",
    "import MarginSelectionModal, { MarginConfig } from '@/components/MarginSelectionModal';\nimport PublishingProgressModal from '@/components/PublishingProgressModal';"
  );
}

// 2. Add publishingConfig state
const stateTarget = "  const [marginModalProduct, setMarginModalProduct] = useState<Product | null>(null);";
const stateCode = "  const [marginModalProduct, setMarginModalProduct] = useState<Product | null>(null);\n  const [publishingConfig, setPublishingConfig] = useState<MarginConfig | null>(null);";

if (code.includes(stateTarget)) {
  code = code.replace(stateTarget, stateCode);
}

// 3. Replace handleConfirmMargin with animated progress flow
const funcStart = "  const handleConfirmMargin = (config: MarginConfig) => {";
const funcEnd = "  // Carrega fornecedores ativados e produtos únicos do catálogo (Nacional vs Exterior)";

const sIdx = code.indexOf(funcStart);
const eIdx = code.indexOf(funcEnd);

if (sIdx !== -1 && eIdx !== -1) {
  const newFunctions = `  const handleConfirmMargin = (config: MarginConfig) => {
    // Fecha o modal de configuração e abre a tela de carregamento/disparo IA
    setMarginModalProduct(null);
    setPublishingConfig(config);
  };

  const handlePublishComplete = () => {
    if (!publishingConfig) return;
    const config = publishingConfig;

    try {
      const storeInfo = getConnectedChannelInfo(config.channel, userEmail);
      const isStoreConnected = !!storeInfo?.connected;
      const pubData = generateMarketplacePublishData(
        config.channel, 
        config.product.name || config.product.title || 'Produto Viral DecolaShop'
      );

      const commPrefix = isUsd ? 'US$ ' : 'R$ ';
      const commissionStr = commPrefix + config.sellerMargin.toFixed(2).replace('.', ',');

      addDivulgado({
        productId: config.product.id,
        name: config.product.name || config.product.title || 'Produto Viral DecolaShop',
        image_url: config.product.image_url,
        category: config.product.category || 'Geral',
        price: config.finalSellingPrice,
        commission: commissionStr,
        currency: isUsd ? 'USD' : 'BRL',
        origin: (config.product as any)?.origin || (isUsd ? 'East Brunswick, New Jersey - EUA' : 'São Paulo - SP (Hub Nacional)'),
        status: 'active',
        channel: config.channel,
        channelLabel: config.channelLabel,
        supplierCost: config.supplierCost,
        sellerMargin: config.sellerMargin,
        sellerMarginPercent: config.sellerMarginPercent,
        marketplaceFee: config.marketplaceFeeAmount,
        marketplaceItemId: pubData.marketplaceItemId,
        marketplaceItemUrl: pubData.marketplaceItemUrl,
        isPublishedToStore: isStoreConnected,
        storeAccountEmail: storeInfo?.email,
        storeAccountName: storeInfo?.name || storeInfo?.shopName,
        networks: [config.channelLabel, 'Google Shopping', 'Meta Ads', 'WhatsApp Grupos VIP'],
        impressions: Math.floor(Math.random() * 1400) + 900,
        clicks: Math.floor(Math.random() * 85) + 45,
        salesCount: 0,
        revenue: 0,
        roas: 4.8,
        conversionRate: 3.9,
        targeting: {
          audience: 'Compradores do ' + config.channelLabel + ' na categoria ' + (config.product.category || 'Geral'),
          ageRange: '18 - 50 anos',
          location: isUsd ? 'Estados Unidos & Europa' : 'Brasil (Envio Rápido 7 Dias)',
          interests: [config.channelLabel, config.product.category || 'Tendências', 'Compras Online']
        },
        sampleCopy: {
          headline: '🔥 OFERTA OFICIAL NO ' + config.channelLabel.toUpperCase() + ': ' + (config.product.name || config.product.title),
          body: config.product.description || 'Produto com estoque homologado e despacho 24h.',
          cta: '👉 COMPRAR COM DESCONTO NO ' + config.channelLabel.toUpperCase()
        }
      }, userEmail);

      triggerDelayedCampaignSales(config.product, config.finalSellingPrice);

      toast.success(
        '🚀 Anúncio publicado na sua loja no ' + config.channelLabel + '! Código ' + pubData.marketplaceItemId + ' ativo.',
        { duration: 5500, icon: '✅' }
      );

      setPublishingConfig(null);
      onNavigate('divulgados');
    } catch (err) {
      console.error('Erro ao registrar campanha:', err);
      toast.error('Erro ao finalizar divulgação.');
      setPublishingConfig(null);
    }
  };

  `;

  code = code.substring(0, sIdx) + newFunctions + code.substring(eIdx);
  console.log('Replaced handleConfirmMargin with clean progress logic.');
} else {
  console.error('funcStart or funcEnd not found in CatalogoView.tsx');
}

// 4. Render PublishingProgressModal
const modalTarget = `      {/* Modal de Seleção de Margem e Canal */}
      <MarginSelectionModal
        isOpen={!!marginModalProduct}
        onClose={() => setMarginModalProduct(null)}
        product={marginModalProduct}
        onConfirm={handleConfirmMargin}
        isUsd={isUsd}
      />`;

const modalCode = `      {/* Modal de Seleção de Margem e Canal */}
      <MarginSelectionModal
        isOpen={!!marginModalProduct}
        onClose={() => setMarginModalProduct(null)}
        product={marginModalProduct}
        onConfirm={handleConfirmMargin}
        isUsd={isUsd}
      />

      {/* Modal de Carregamento e Publicação IA com Progresso em Tempo Real */}
      <PublishingProgressModal
        isOpen={!!publishingConfig}
        product={publishingConfig?.product || null}
        channelLabel={publishingConfig?.channelLabel || ''}
        isUsd={isUsd}
        onComplete={handlePublishComplete}
      />`;

if (code.includes(modalTarget)) {
  code = code.replace(modalTarget, modalCode);
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('CatalogoView.tsx patched successfully.');
