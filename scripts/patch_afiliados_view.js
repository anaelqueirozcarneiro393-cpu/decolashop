const fs = require('fs');

let viewCode = fs.readFileSync('src/components/views/AfiliadosView.tsx', 'utf-8');

// 1. Replace handleConfirmPayCommission and add handleMarkSingleSalePaid
const oldConfirmPay = `  const handleConfirmPayCommission = async () => {
    if (!payingAffiliate) return;
    try {
      await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pay',
          affiliateId: payingAffiliate.id,
          affiliateCode: payingAffiliate.code
        })
      });
      markCommissionPaid(payingAffiliate.id);
      toast.success(\`💸 Repasse de R$ \${payingAffiliate.pendingCommission.toFixed(2).replace('.', ',')} marcado como pago!\`);
      setPayingAffiliate(null);
      const res = await syncAffiliatesFromServer();
      if (res) {
        setAffiliates(res.affiliates);
        setSales(res.sales);
      }
      loadData();
    } catch {
      markCommissionPaid(payingAffiliate.id);
      setPayingAffiliate(null);
      loadData();
    }
  };`;

const newConfirmPay = `  const handleMarkSingleSalePaid = async (saleId: string) => {
    try {
      setSales(prev => prev.map(s => (s.id === saleId || s.transactionId === saleId) ? { ...s, status: 'paid_to_affiliate' } : s));
      toast.success('💸 Venda individual marcada como paga!');
      await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_sale_paid', saleId })
      });
      const res = await syncAffiliatesFromServer();
      if (res) {
        setAffiliates(res.affiliates);
        setSales(res.sales);
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmPayCommission = async () => {
    if (!payingAffiliate) return;
    const targetAff = payingAffiliate;
    try {
      // Atualização otimista imediata na interface
      setSales(prev => prev.map(s => {
        const isTarget = s.affiliateId === targetAff.id || s.affiliateCode?.toLowerCase() === targetAff.code?.toLowerCase();
        return isTarget ? { ...s, status: 'paid_to_affiliate' } : s;
      }));
      markCommissionPaid(targetAff.id);
      toast.success(\`💸 Repasse de R$ \${targetAff.pendingCommission.toFixed(2).replace('.', ',')} marcado como pago com sucesso!\`);
      setPayingAffiliate(null);

      await fetch('/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pay',
          affiliateId: targetAff.id,
          affiliateCode: targetAff.code
        })
      });

      const res = await syncAffiliatesFromServer();
      if (res) {
        setAffiliates(res.affiliates);
        setSales(res.sales);
      }
      loadData();
    } catch {
      markCommissionPaid(targetAff.id);
      setPayingAffiliate(null);
      loadData();
    }
  };`;

const viewNormalized = viewCode.replace(/\r\n/g, '\n');
const oldConfirmNormalized = oldConfirmPay.replace(/\r\n/g, '\n');

if (viewNormalized.includes(oldConfirmNormalized)) {
  viewCode = viewNormalized.replace(oldConfirmNormalized, newConfirmPay.replace(/\r\n/g, '\n'));
  console.log('✅ handleConfirmPayCommission updated in AfiliadosView.tsx');
} else {
  console.log('⚠️ Could not match oldConfirmPay in AfiliadosView.tsx');
}

// 2. Make the status badge clickable in the table
const oldStatusBadge = `{sale.status === 'paid_to_affiliate' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            <CheckCircle2 size={11} />
                            <span>Pago</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                            <Clock size={11} />
                            <span>A Pagar</span>
                          </span>
                        )}`;

const newStatusBadge = `{sale.status === 'paid_to_affiliate' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            <CheckCircle2 size={11} />
                            <span>Pago</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMarkSingleSalePaid(sale.id)}
                            title="Clique para marcar esta venda individual como Paga"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 hover:bg-emerald-500/20 text-amber-300 hover:text-emerald-400 border border-amber-500/30 hover:border-emerald-500/40 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <Clock size={11} />
                            <span>A Pagar (Pagar)</span>
                          </button>
                        )}`;

const viewNormalized2 = viewCode.replace(/\r\n/g, '\n');
const oldBadgeNormalized = oldStatusBadge.replace(/\r\n/g, '\n');

if (viewNormalized2.includes(oldBadgeNormalized)) {
  viewCode = viewNormalized2.replace(oldBadgeNormalized, newStatusBadge.replace(/\r\n/g, '\n'));
  console.log('✅ Status badge made clickable in AfiliadosView.tsx');
} else {
  console.log('⚠️ Could not match oldStatusBadge in AfiliadosView.tsx');
}

fs.writeFileSync('src/components/views/AfiliadosView.tsx', viewCode, 'utf-8');
