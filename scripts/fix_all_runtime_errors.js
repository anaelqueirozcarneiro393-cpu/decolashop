const fs = require('fs');
const path = require('path');

// 1. Fix DivulgadosView.tsx
const divPath = path.join(__dirname, '../src/components/views/DivulgadosView.tsx');
let divCode = fs.readFileSync(divPath, 'utf8');

// Add useMemo import
if (!divCode.includes('useState, useEffect, useMemo')) {
  divCode = divCode.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, useMemo } from 'react';"
  );
}

// Fix activeModalInfo self-reference
const brokenModalInfo = `      {(trackingModalData || trackingCampaign) && (() => {
        const activeModalInfo = trackingModalData || (trackingCampaign ? {
          shipping: getCampaignShippingInfo(trackingCampaign),
          name: activeModalInfo.name,
          image_url: activeModalInfo.image_url,
          price: activeModalInfo.price,
          orderId: undefined
        } : null);
        if (!activeModalInfo) return null;
        const shipping = activeModalInfo.shipping;`;

const fixedModalInfo = `      {(trackingModalData || trackingCampaign) && (() => {
        const activeModalInfo = trackingModalData || (trackingCampaign ? {
          shipping: getCampaignShippingInfo(trackingCampaign),
          name: trackingCampaign.name,
          image_url: trackingCampaign.image_url,
          price: trackingCampaign.price,
          orderId: undefined
        } : null);
        if (!activeModalInfo) return null;
        const shipping = activeModalInfo.shipping;`;

if (divCode.includes(brokenModalInfo)) {
  divCode = divCode.replace(brokenModalInfo, fixedModalInfo);
}

// Fix order type
divCode = divCode.replaceAll('{recentOrders.map((order) => {', '{recentOrders.map((order: OrderShipmentItem) => {');

// Fix st type
divCode = divCode.replaceAll('{shipping.steps.map((step, idx) => {', '{shipping.steps.map((step: any, idx: number) => {');
divCode = divCode.replaceAll('{shipping.steps.map((st, i) => {', '{shipping.steps.map((st: any, i: number) => {');

// Fix handleSendWhatsAppNotification in modal
divCode = divCode.replaceAll(
  'handleSendWhatsAppNotification(trackingCampaign, shipping)',
  'handleSendWhatsAppNotification(activeModalInfo.name, shipping)'
);

fs.writeFileSync(divPath, divCode, 'utf8');
console.log('Fixed DivulgadosView.tsx');

// 2. Fix MarginSelectionModal.tsx
const marginPath = path.join(__dirname, '../src/components/MarginSelectionModal.tsx');
let marginCode = fs.readFileSync(marginPath, 'utf8');

// Ensure channelConnectionMap is defined
if (!marginCode.includes('channelConnectionMap = useMemo')) {
  const targetChannel = `  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannel) || channels[0];
  }, [channels, selectedChannel]);`;

  const replacementChannel = `  const activeChannel = useMemo(() => {
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

  marginCode = marginCode.replace(targetChannel, replacementChannel);
}

// Move if (!isOpen || !product) return null; to the bottom of hooks
if (marginCode.includes('if (!isOpen || !product) return null;')) {
  // Remove from top
  marginCode = marginCode.replace('  if (!isOpen || !product) return null;\n', '');

  // Add safe product check in initialBasePrice
  marginCode = marginCode.replace(
    '  const initialBasePrice = useMemo(() => {\n    if (typeof product.price === \'number\') return product.price;',
    '  const initialBasePrice = useMemo(() => {\n    if (!product) return isUsd ? 49.90 : 99.90;\n    if (typeof product.price === \'number\') return product.price;'
  );

  // Add return null before JSX
  const jsxReturnTarget = '  return (\n    <div className="fixed inset-0 z-50';
  const jsxReturnReplacement = '  if (!isOpen || !product) return null;\n\n  return (\n    <div className="fixed inset-0 z-50';
  marginCode = marginCode.replace(jsxReturnTarget, jsxReturnReplacement);
}

fs.writeFileSync(marginPath, marginCode, 'utf8');
console.log('Fixed MarginSelectionModal.tsx');

// 3. Fix salesContext.tsx userStorageKeyUSD
const salesPath = path.join(__dirname, '../src/lib/salesContext.tsx');
let salesCode = fs.readFileSync(salesPath, 'utf8');

const emptyUsdTarget = `    const emptyStateUSD = {
      vendasTotais: 0,
      saldoDisponivel: 0,
      visitas: 0,
      cliques: 0,
      pedidos: 0,
      unidades: 0,
      hourlyData: CLEAN_HOURLY,
      recentSales: []
    };
    try {
      localStorage.setItem(userStorageKeyUSD, JSON.stringify(emptyStateUSD));`;

const emptyUsdReplacement = `    const userStorageKeyUSD = \`decolashop_metrics_usd_\${cleanEmailKey}\`;
    const emptyStateUSD = {
      vendasTotais: 0,
      saldoDisponivel: 0,
      visitas: 0,
      cliques: 0,
      pedidos: 0,
      unidades: 0,
      hourlyData: CLEAN_HOURLY,
      recentSales: []
    };
    try {
      localStorage.setItem(userStorageKeyUSD, JSON.stringify(emptyStateUSD));`;

if (salesCode.includes(emptyUsdTarget)) {
  salesCode = salesCode.replace(emptyUsdTarget, emptyUsdReplacement);
}

fs.writeFileSync(salesPath, salesCode, 'utf8');
console.log('Fixed salesContext.tsx');

// 4. Fix api/affiliates/route.ts missing dbMarkSalePaid
const affRoutePath = path.join(__dirname, '../src/app/api/affiliates/route.ts');
let affRouteCode = fs.readFileSync(affRoutePath, 'utf8');

if (!affRouteCode.includes('dbMarkSalePaid,')) {
  affRouteCode = affRouteCode.replace(
    '  dbMarkCommissionPaid,\n',
    '  dbMarkCommissionPaid,\n  dbMarkSalePaid,\n'
  );
  fs.writeFileSync(affRoutePath, affRouteCode, 'utf8');
  console.log('Fixed api/affiliates/route.ts');
}

// 5. Fix auth.ts Promise.resolve for updates
const authPath = path.join(__dirname, '../src/auth.ts');
let authCode = fs.readFileSync(authPath, 'utf8');

authCode = authCode.replaceAll(
  '}).eq("email", email).then(() => {}).catch(() => {});',
  '}).eq("email", email).then(() => {}, () => {});'
);
fs.writeFileSync(authPath, authCode, 'utf8');
console.log('Fixed auth.ts');

// 6. Fix AfiliadosView.tsx comparison
const afilViewPath = path.join(__dirname, '../src/components/views/AfiliadosView.tsx');
let afilViewCode = fs.readFileSync(afilViewPath, 'utf8');

afilViewCode = afilViewCode.replaceAll("sale.plan === 'bumps_only'", "(sale.plan as string) === 'bumps_only'");
fs.writeFileSync(afilViewPath, afilViewCode, 'utf8');
console.log('Fixed AfiliadosView.tsx');
