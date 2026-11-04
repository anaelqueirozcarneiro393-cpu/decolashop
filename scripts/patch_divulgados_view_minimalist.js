const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/views/DivulgadosView.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add getRecentOrdersFromCampaigns, OrderShipmentItem to import
if (!code.includes('getRecentOrdersFromCampaigns')) {
  code = code.replace(
    "getCampaignShippingInfo,\n  ShippingTrackingInfo\n} from '@/lib/divulgados';",
    "getCampaignShippingInfo,\n  ShippingTrackingInfo,\n  getRecentOrdersFromCampaigns,\n  OrderShipmentItem\n} from '@/lib/divulgados';"
  );
}

// 2. Add trackingModalData state and recentOrders memo
const stateHookTarget = `  const [trackingCampaign, setTrackingCampaign] = useState<DivulgadoCampaign | null>(null);`;
const stateHookReplacement = `  const [trackingCampaign, setTrackingCampaign] = useState<DivulgadoCampaign | null>(null);
  const [trackingModalData, setTrackingModalData] = useState<{
    shipping: ShippingTrackingInfo;
    name: string;
    image_url: string;
    price: number | string;
    orderId?: string;
  } | null>(null);

  const recentOrders = useMemo(() => {
    return getRecentOrdersFromCampaigns(campaigns, 15);
  }, [campaigns]);`;

if (code.includes(stateHookTarget) && !code.includes('trackingModalData')) {
  code = code.replace(stateHookTarget, stateHookReplacement);
}

// 3. Update handleSendWhatsAppNotification to accept string name or DivulgadoCampaign
const waTarget = `  const handleSendWhatsAppNotification = (camp: DivulgadoCampaign, shipping: ShippingTrackingInfo) => {
    const isUsd = shipping.currency === 'USD';
    const recipientFirstName = shipping.recipientName.split(' ')[0];
    const message = isUsd
      ? \`📦 *DecolaShop Global Delivery Update*\\n\\nHello \${recipientFirstName}!\\nYour order for *\${camp.name}* is in express transit with guaranteed 7-day delivery!\\n\\n🚚 *Tracking Number:* \${shipping.trackingCode}\\n🏢 *Carrier:* \${shipping.carrier}\\n📍 *Status:* \${shipping.statusLabel}\\n📅 *Estimated Arrival:* \${shipping.estimatedDeliveryDate}\\n🏠 *Destination:* \${shipping.recipientCity}\\n\\nTrack your shipment live:\\nhttps://decolashop.com/rastreio?code=\${shipping.trackingCode}\\n\\nThank you for choosing DecolaShop Global!\`
      : \`📦 *Decola Express - Acompanhamento de Pedido*\\n\\nOlá \${recipientFirstName}!\\nSeu pedido do produto *\${camp.name}* está em trânsito com prazo de entrega de 7 dias!\\n\\n🚚 *Código de Rastreio:* \${shipping.trackingCode}\\n🏢 *Transportadora:* \${shipping.carrier}\\n📍 *Status Atual:* \${shipping.statusLabel}\\n📅 *Previsão de Chegada:* \${shipping.estimatedDeliveryDate}\\n🏠 *Cidade de Destino:* \${shipping.recipientCity}\\n\\nAcompanhe em tempo real:\\nhttps://decolashop.com/rastreio?code=\${shipping.trackingCode}\\n\\nQualquer dúvida estamos à disposição! Decola Express.\`;

    const encoded = encodeURIComponent(message);
    window.open(\`https://api.whatsapp.com/send?text=\${encoded}\`, '_blank');
    toast.success('WhatsApp aberto com mensagem de rastreio!');
  };`;

const waReplacement = `  const handleSendWhatsAppNotification = (campOrName: DivulgadoCampaign | string, shipping: ShippingTrackingInfo) => {
    const isUsd = shipping.currency === 'USD';
    const recipientFirstName = shipping.recipientName.split(' ')[0];
    const productName = typeof campOrName === 'string' ? campOrName : campOrName.name;
    const message = isUsd
      ? \`📦 *DecolaShop Global Delivery Update*\\n\\nHello \${recipientFirstName}!\\nYour order for *\${productName}* is in express transit with guaranteed 7-day delivery!\\n\\n🚚 *Tracking Number:* \${shipping.trackingCode}\\n🏢 *Carrier:* \${shipping.carrier}\\n📍 *Status:* \${shipping.statusLabel}\\n📅 *Estimated Arrival:* \${shipping.estimatedDeliveryDate}\\n🏠 *Destination:* \${shipping.recipientCity}\\n\\nTrack your shipment live:\\nhttps://decolashop.com/rastreio?code=\${shipping.trackingCode}\\n\\nThank you for choosing DecolaShop Global!\`
      : \`📦 *Decola Express - Acompanhamento de Pedido*\\n\\nOlá \${recipientFirstName}!\\nSeu pedido do produto *\${productName}* está em trânsito com prazo de entrega de 7 dias!\\n\\n🚚 *Código de Rastreio:* \${shipping.trackingCode}\\n🏢 *Transportadora:* \${shipping.carrier}\\n📍 *Status Atual:* \${shipping.statusLabel}\\n📅 *Previsão de Chegada:* \${shipping.estimatedDeliveryDate}\\n🏠 *Cidade de Destino:* \${shipping.recipientCity}\\n\\nAcompanhe em tempo real:\\nhttps://decolashop.com/rastreio?code=\${shipping.trackingCode}\\n\\nQualquer dúvida estamos à disposição! Decola Express.\`;

    const encoded = encodeURIComponent(message);
    window.open(\`https://api.whatsapp.com/send?text=\${encoded}\`, '_blank');
    toast.success('WhatsApp aberto com mensagem de rastreio!');
  };`;

if (code.includes(waTarget)) {
  code = code.replace(waTarget, waReplacement);
}

// 4. Update the campaign modal opening condition
const modalConditionTarget = `{trackingCampaign && (() => {
        const shipping = getCampaignShippingInfo(trackingCampaign);`;

const modalConditionReplacement = `{(trackingModalData || trackingCampaign) && (() => {
        const activeModalInfo = trackingModalData || (trackingCampaign ? {
          shipping: getCampaignShippingInfo(trackingCampaign),
          name: trackingCampaign.name,
          image_url: trackingCampaign.image_url,
          price: trackingCampaign.price,
          orderId: undefined
        } : null);
        if (!activeModalInfo) return null;
        const shipping = activeModalInfo.shipping;`;

if (code.includes(modalConditionTarget)) {
  code = code.replace(modalConditionTarget, modalConditionReplacement);
}

// Close tracking modal should close both
code = code.replaceAll('setTrackingCampaign(null)', 'setTrackingCampaign(null); setTrackingModalData(null)');

// Modal product display inside tracking modal
code = code.replaceAll('trackingCampaign.image_url', 'activeModalInfo.image_url');
code = code.replaceAll('trackingCampaign.name', 'activeModalInfo.name');
code = code.replaceAll('typeof trackingCampaign.price ===', 'typeof activeModalInfo.price ===');
code = code.replaceAll('trackingCampaign.price', 'activeModalInfo.price');

fs.writeFileSync(filePath, code, 'utf8');
console.log('DivulgadosView.tsx imports and tracking handlers updated.');
