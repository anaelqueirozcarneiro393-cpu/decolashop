const fs = require('fs');
const path = require('path');

// 1. Fix MarginSelectionModal.tsx
const marginPath = path.join(__dirname, '../src/components/MarginSelectionModal.tsx');
let marginCode = fs.readFileSync(marginPath, 'utf8');

const targetActive = `  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannel) || channels[0];
  }, [channels, selectedChannel]);`;

const replacementActive = `  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannel) || channels[0];
  }, [channels, selectedChannel]);

  const channelConnectionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const ch of channels) {
      map[ch.id] = isChannelConnected(ch.id, userEmail);
    }
    return map;
  }, [channels, userEmail]);

  const isCurrentChannelConnected = !!channelConnectionMap[selectedChannel];`;

if (marginCode.includes(targetActive)) {
  marginCode = marginCode.replace(targetActive, replacementActive);
  console.log('Added channelConnectionMap to MarginSelectionModal.tsx');
} else {
  console.error('targetActive not found in MarginSelectionModal.tsx');
}

fs.writeFileSync(marginPath, marginCode, 'utf8');

// 2. Fix DivulgadosView.tsx
const divPath = path.join(__dirname, '../src/components/views/DivulgadosView.tsx');
let divCode = fs.readFileSync(divPath, 'utf8');

const targetWa = `  const handleSendWhatsAppNotification = (camp: DivulgadoCampaign, shipping: ShippingTrackingInfo) => {
    const isUsd = shipping.currency === 'USD';
    const recipientFirstName = shipping.recipientName.split(' ')[0];
    const message = isUsd
      ? \`📦 *DecolaShop Global Delivery Update*\\n\\nHello \${recipientFirstName}!\\nYour order for *\${camp.name}* is in express transit with guaranteed 7-day delivery!\\n\\n🔹 *Tracking Number:* \${shipping.trackingCode}\\n🔹 *Carrier:* \${shipping.carrier}\\n🔹 *Status:* \${shipping.statusLabel}\\n🔹 *Estimated Arrival:* \${shipping.estimatedDeliveryDate}\\n🔹 *Destination:* \${shipping.recipientCity}\\n\\nTrack your shipment live:\\nhttps://decolashop.com/rastreio?code=\${shipping.trackingCode}\\n\\nThank you for choosing DecolaShop Global!\`
      : \`📦 *Decola Express - Acompanhamento de Pedido*\\n\\nOlá \${recipientFirstName}!\\nSeu pedido do produto *\${camp.name}* está em trânsito com prazo de entrega de 7 dias!\\n\\n🔹 *Código de Rastreio:* \${shipping.trackingCode}\\n🔹 *Transportadora:* \${shipping.carrier}\\n🔹 *Status Atual:* \${shipping.statusLabel}\\n🔹 *Previsão de Chegada:* \${shipping.estimatedDeliveryDate}\\n🔹 *Cidade de Destino:* \${shipping.recipientCity}\\n\\nAcompanhe em tempo real:\\nhttps://decolashop.com/rastreio?code=\${shipping.trackingCode}\\n\\nQualquer dúvida estamos à disposição! Decola Express.\`;

    const encoded = encodeURIComponent(message);
    window.open(\`https://api.whatsapp.com/send?text=\${encoded}\`, '_blank');
    toast.success('WhatsApp aberto com mensagem de rastreio!');
  };`;

const replacementWa = `  const handleSendWhatsAppNotification = (campOrName: DivulgadoCampaign | string, shipping: ShippingTrackingInfo) => {
    const isUsd = shipping.currency === 'USD';
    const recipientFirstName = shipping.recipientName.split(' ')[0];
    const productName = typeof campOrName === 'string' ? campOrName : campOrName.name;
    const message = isUsd
      ? \`📦 *DecolaShop Global Delivery Update*\\n\\nHello \${recipientFirstName}!\\nYour order for *\${productName}* is in express transit with guaranteed 7-day delivery!\\n\\n🔹 *Tracking Number:* \${shipping.trackingCode}\\n🔹 *Carrier:* \${shipping.carrier}\\n🔹 *Status:* \${shipping.statusLabel}\\n🔹 *Estimated Arrival:* \${shipping.estimatedDeliveryDate}\\n🔹 *Destination:* \${shipping.recipientCity}\\n\\nTrack your shipment live:\\nhttps://decolashop.com/rastreio?code=\${shipping.trackingCode}\\n\\nThank you for choosing DecolaShop Global!\`
      : \`📦 *Decola Express - Acompanhamento de Pedido*\\n\\nOlá \${recipientFirstName}!\\nSeu pedido do produto *\${productName}* está em trânsito com prazo de entrega de 7 dias!\\n\\n🔹 *Código de Rastreio:* \${shipping.trackingCode}\\n🔹 *Transportadora:* \${shipping.carrier}\\n🔹 *Status Atual:* \${shipping.statusLabel}\\n🔹 *Previsão de Chegada:* \${shipping.estimatedDeliveryDate}\\n🔹 *Cidade de Destino:* \${shipping.recipientCity}\\n\\nAcompanhe em tempo real:\\nhttps://decolashop.com/rastreio?code=\${shipping.trackingCode}\\n\\nQualquer dúvida estamos à disposição! Decola Express.\`;

    const encoded = encodeURIComponent(message);
    window.open(\`https://api.whatsapp.com/send?text=\${encoded}\`, '_blank');
    toast.success('WhatsApp aberto com mensagem de rastreio!');
  };`;

if (divCode.includes(targetWa)) {
  divCode = divCode.replace(targetWa, replacementWa);
  console.log('Fixed handleSendWhatsAppNotification in DivulgadosView.tsx');
} else {
  console.error('targetWa not found in DivulgadosView.tsx');
}

fs.writeFileSync(divPath, divCode, 'utf8');
