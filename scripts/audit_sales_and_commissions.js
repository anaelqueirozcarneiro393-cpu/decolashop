const fs = require('fs');
const path = require('path');

const dump = JSON.parse(fs.readFileSync(path.join(__dirname, 'full_db_dump.json'), 'utf-8'));
const tokens = dump.tables.verification_tokens;
const sales = tokens.filter(t => t.identifier.startsWith('affiliate_sale:'));

console.log('Total sales in dump:', sales.length);

const affStats = {};

sales.forEach(row => {
  const data = JSON.parse(row.token);
  let code = (data.affiliateCode || 'unknown').toLowerCase();
  if (code === 'kaio' || code === 'kaiofredy' || code === 'kaiofredy2908') code = 'rwjncwiofw';
  
  if (!affStats[code]) {
    affStats[code] = {
      name: data.affiliateName || code,
      code,
      salesCount: 0,
      totalRevenue: 0,
      totalCommission: 0,
      paidCommission: 0,
      pendingCommission: 0,
      salesList: []
    };
  }

  const s = affStats[code];
  s.salesCount++;
  const amt = Number(data.totalAmount || 0);
  const comm = Number(data.commissionAmount || 0);
  s.totalRevenue += amt;
  s.totalCommission += comm;

  if (data.status === 'paid_to_affiliate') {
    s.paidCommission += comm;
  } else {
    s.pendingCommission += comm;
  }

  s.salesList.push({
    id: row.identifier,
    buyerEmail: data.buyerEmail,
    plan: data.planName,
    amount: amt,
    commission: comm,
    status: data.status,
    date: data.createdAt || data.date
  });
});

console.log('\n--- DETALHAMENTO DE VENDAS E COMISSÕES POR AFILIADO ---');
for (const [code, info] of Object.entries(affStats)) {
  console.log(`\nAFILIADO: ${info.name} (código: ${code})`);
  console.log(`- Quantidade de Vendas: ${info.salesCount}`);
  console.log(`- Faturamento Total (GMV): R$ ${info.totalRevenue.toFixed(2)}`);
  console.log(`- Comissão Total Gerada: R$ ${info.totalCommission.toFixed(2)}`);
  console.log(`- Comissão Paga: R$ ${info.paidCommission.toFixed(2)}`);
  console.log(`- Comissão Pendente: R$ ${info.pendingCommission.toFixed(2)}`);
}

// Check unique paying clients in users
const users = dump.tables.users;
const uniquePayingClients = new Set();
users.forEach(u => {
  const e = (u.email || '').toLowerCase().trim();
  if (e && !e.endsWith('@decolashop.com') && !['aleghartz@gmail.com', 'digital405060@gmail.com'].includes(e)) {
    uniquePayingClients.add(e);
  }
});

console.log('\n--- CLIENTES ---');
console.log('Total de registros na tabela next_auth.users:', users.length);
console.log('Total de clientes pagantes únicos:', uniquePayingClients.size);
