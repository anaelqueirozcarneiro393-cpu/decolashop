const fs = require('fs');
let code = fs.readFileSync('src/app/api/sigilopay/confirm-payment/route.ts', 'utf-8');

// 1. Add dbGetSales to imports
if (!code.includes('dbGetSales')) {
  code = code.replace(
    'dbGetAffiliates, resolveAffiliateCode',
    'dbGetAffiliates, dbGetSales, resolveAffiliateCode'
  );
}

// 2. Add repeat sale fallback
const target = `      // LEAD LOCK-IN: Vínculo perpétuo de email do lead com afiliado no Supabase
      if (!affiliateCode && cleanEmail) {
        try {
          const bound = await dbGetLeadAffiliate(cleanEmail);
          if (bound) {
            affiliateCode = bound;
            console.log(\`[AFILIADOS LEAD LOCK] Venda confirmada resgatada pelo vínculo perpétuo no banco: \${cleanEmail} -> \${bound}\`);
          }
        } catch {}
      }`;

const replacement = `      // LEAD LOCK-IN: Vínculo perpétuo de email do lead com afiliado no Supabase
      if (!affiliateCode && cleanEmail) {
        try {
          const bound = await dbGetLeadAffiliate(cleanEmail);
          if (bound) {
            affiliateCode = bound;
            console.log(\`[AFILIADOS LEAD LOCK] Venda confirmada resgatada pelo vínculo perpétuo no banco: \${cleanEmail} -> \${bound}\`);
          } else {
            // Trava de cliente recorrente: se o cliente já comprou antes com um afiliado, mantém o vínculo
            const pastSales = await dbGetSales();
            const past = pastSales.find(s => s.customerEmail?.toLowerCase().trim() === cleanEmail);
            if (past?.affiliateCode) {
              affiliateCode = past.affiliateCode;
              console.log(\`[AFILIADOS REPEAT SALE CONFIRM] Venda confirmada resgatada via histórico do cliente: \${cleanEmail} -> \${affiliateCode}\`);
            }
          }
        } catch {}
      }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/app/api/sigilopay/confirm-payment/route.ts', code, 'utf-8');
console.log('src/app/api/sigilopay/confirm-payment/route.ts patched successfully!');
