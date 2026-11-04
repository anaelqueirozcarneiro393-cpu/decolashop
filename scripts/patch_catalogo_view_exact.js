const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/views/CatalogoView.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const targetStr = `  const handleConfirmMargin = (config: MarginConfig) => {
    try {
      const storeInfo = getConnectedChannelInfo(config.channel);
      const isStoreConnected = !!storeInfo?.connected;
      const pubData = generateMarketplacePublishData(
        config.channel, 
        config.product.name || config.product.title || 'Produto Viral DecolaShop'
      );

      addDivulgado({
        productId: config.product.id,
        name: config.product.name || config.product.title || 'Produto Viral DecolaShop',
        image_url: config.product.image_url,
        category: config.product.category || 'Geral',
        price: config.finalSellingPrice,
        commission: \`\${isUsd ? 'US$' : 'R$'} \${config.sellerMargin.toFixed(2).replace('.', ',')}\`,
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
          audience: \`Compradores do \${config.channelLabel} na categoria \${config.product.category || 'Geral'}\`,
          ageRange: '18 - 50 anos',
          location: isUsd ? 'Estados Unidos & Europa' : 'Brasil (Envio Rápido 7 Dias)',
          interests: [config.channelLabel, config.product.category || 'Tendências', 'Compras Online']
        },
        sampleCopy: {
          headline: \`🔥 OFERTA OFICIAL NO \${config.channelLabel.toUpperCase()}: \${config.product.name || config.product.title}\`,
          body: config.product.description || 'Produto com estoque homologado e despacho 24h.',
          cta: \`👉 COMPRAR COM DESCONTO NO \${config.channelLabel.toUpperCase()}\`
        }
      }, userEmail);

      triggerDelayedCampaignSales(config.product, config.finalSellingPrice);

      if (isStoreConnected) {
        toast.success(
          \`🚀 Publicado na sua loja "\${storeInfo?.shopName || 'conectada'}" no \${config.channelLabel}! Anúncio \${pubData.marketplaceItemId} ativo no seu painel.\`,
          { duration: 6000, icon: '✅' }
        );
      } else {
        toast.success(
          \`🎉 Campanha no \${config.channelLabel} ativada! Sua margem de lucro de \${isUsd ? 'US$' : 'R$'} \${config.sellerMargin.toFixed(2)} por venda está garantida.\`,
          { duration: 5500, icon: '🚀' }
        );
      }

      setMarginModalProduct(null);

      setTimeout(() => {
        onNavigate('divulgados');
      }, 800);
    } catch {
      toast.error('Erro ao registrar campanha.');
    }
  };`;

const replacementStr = `  const handleConfirmMargin = (config: MarginConfig) => {
    // Fecha o modal de configuração de margem e abre a tela de carregamento/disparo IA
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

      addDivulgado({
        productId: config.product.id,
        name: config.product.name || config.product.title || 'Produto Viral DecolaShop',
        image_url: config.product.image_url,
        category: config.product.category || 'Geral',
        price: config.finalSellingPrice,
        commission: \`\${isUsd ? 'US$' : 'R$'} \${config.sellerMargin.toFixed(2).replace('.', ',')}\`,
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
          audience: \`Compradores do \${config.channelLabel} na categoria \${config.product.category || 'Geral'}\`,
          ageRange: '18 - 50 anos',
          location: isUsd ? 'Estados Unidos & Europa' : 'Brasil (Envio Rápido 7 Dias)',
          interests: [config.channelLabel, config.product.category || 'Tendências', 'Compras Online']
        },
        sampleCopy: {
          headline: \`🔥 OFERTA OFICIAL NO \${config.channelLabel.toUpperCase()}: \${config.product.name || config.product.title}\`,
          body: config.product.description || 'Produto com estoque homologado e despacho 24h.',
          cta: \`👉 COMPRAR COM DESCONTO NO \${config.channelLabel.toUpperCase()}\`
        }
      }, userEmail);

      triggerDelayedCampaignSales(config.product, config.finalSellingPrice);

      toast.success(
        \`🚀 Anúncio publicado no \${config.channelLabel}! Código \${pubData.marketplaceItemId} ativo.\`,
        { duration: 5500, icon: '✅' }
      );

      setPublishingConfig(null);
      onNavigate('divulgados');
    } catch (err) {
      console.error('Erro ao registrar campanha:', err);
      toast.error('Erro ao finalizar divulgação.');
      setPublishingConfig(null);
    }
  };`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully replaced handleConfirmMargin with handlePublishComplete.');
} else {
  console.error('Target string still not matched in CatalogoView.tsx');
}
