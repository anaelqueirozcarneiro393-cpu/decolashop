const fs = require('fs');
let code = fs.readFileSync('src/app/api/webhooks/sigilopay/route.ts', 'utf-8');

const target = `    // LEAD LOCK-IN: Fallback para vínculo perpétuo de lead no Supabase
    if (!affiliateCode && email) {
      try {
        const boundCode = await dbGetLeadAffiliate(email);
        if (boundCode) {
          affiliateCode = boundCode;
          console.log(\`[AFILIADOS LEAD LOCK WEBHOOK] Venda resgatada via lead perpétuo no Supabase: \${email} -> \${boundCode}\`);
        }
      } catch {}
    }`;

const replacement = `    // LEAD LOCK-IN: Fallback para vínculo perpétuo de lead no Supabase
    if (!affiliateCode && email) {
      try {
        const boundCode = await dbGetLeadAffiliate(email);
        if (boundCode) {
          affiliateCode = boundCode;
          console.log(\`[AFILIADOS LEAD LOCK WEBHOOK] Venda resgatada via lead perpétuo no Supabase: \${email} -> \${boundCode}\`);
        } else {
          // Trava de cliente recorrente: se o cliente já comprou antes com um afiliado, mantém o vínculo
          const pastSales = await dbGetSales();
          const past = pastSales.find(s => s.customerEmail?.toLowerCase().trim() === email);
          if (past?.affiliateCode) {
            affiliateCode = past.affiliateCode;
            console.log(\`[AFILIADOS REPEAT SALE WEBHOOK] Venda de cliente recorrente resgatada: \${email} -> \${affiliateCode}\`);
          }
        }
      } catch {}
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/app/api/webhooks/sigilopay/route.ts', code, 'utf-8');
console.log('src/app/api/webhooks/sigilopay/route.ts patched successfully!');
