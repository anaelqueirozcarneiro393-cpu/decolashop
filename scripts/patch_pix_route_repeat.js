const fs = require('fs');
let code = fs.readFileSync('src/app/api/sigilopay/pix/route.ts', 'utf-8');

// 1. Add dbGetSales to imports
if (!code.includes('dbGetSales')) {
  code = code.replace(
    'dbGetAffiliates, resolveAffiliateCode',
    'dbGetAffiliates, dbGetSales, resolveAffiliateCode'
  );
}

// 2. Add repeat customer check
const target = `    // LEAD LOCK-IN NO SUPABASE: Se não veio código na requisição, busca se o email já está vinculado a um afiliado
    if (!effectiveAffiliateCode && !isTaxaAntecipacao && customer?.email) {
      try {
        const boundCode = await dbGetLeadAffiliate(customer.email);
        if (boundCode) {
          effectiveAffiliateCode = boundCode;
          console.log(\`[AFILIADOS LEAD LOCK DB] Lead recorrente recuperado do Supabase! \${customer.email} -> \${boundCode}\`);
        }
      } catch {}
    }`;

const replacement = `    // LEAD LOCK-IN NO SUPABASE: Se não veio código na requisição, busca se o email já está vinculado a um afiliado
    if (!effectiveAffiliateCode && !isTaxaAntecipacao && customer?.email) {
      try {
        const boundCode = await dbGetLeadAffiliate(customer.email);
        if (boundCode) {
          effectiveAffiliateCode = boundCode;
          console.log(\`[AFILIADOS LEAD LOCK DB] Lead recorrente recuperado do Supabase! \${customer.email} -> \${boundCode}\`);
        } else {
          // Trava de cliente recorrente: se o cliente já comprou antes com um afiliado, mantém o vínculo
          const pastSales = await dbGetSales();
          const past = pastSales.find(s => s.customerEmail?.toLowerCase().trim() === customer.email.toLowerCase().trim());
          if (past?.affiliateCode) {
            effectiveAffiliateCode = past.affiliateCode;
            console.log(\`[AFILIADOS REPEAT SALE PIX] Lead recorrente resgatado via histórico: \${customer.email} -> \${effectiveAffiliateCode}\`);
          }
        }
      } catch {}
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/app/api/sigilopay/pix/route.ts', code, 'utf-8');
console.log('src/app/api/sigilopay/pix/route.ts patched successfully!');
