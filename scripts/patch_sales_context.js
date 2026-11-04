const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/salesContext.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. In offline catchup, only run if currVendasTotais > 0 and currRecentSales.length > 0
const catchupTarget = `        if (isGerenteUser) {
          if (shouldCatchUpSales) {`;

const catchupReplacement = `        if (isGerenteUser) {
          if (shouldCatchUpSales && currVendasTotais > 0 && currRecentSales.length > 0) {`;

if (code.includes(catchupTarget)) {
  code = code.replace(catchupTarget, catchupReplacement);
  console.log('Patched isGerenteUser offline catchup check.');
} else {
  console.log('Catchup target not found (may already be updated).');
}

// 2. In resetData, zero out USD metrics as well
const resetUsdTarget = `    const baselineUSD = getDeterministicBaselineUSD(userEmail, Date.now());
    if (baselineUSD && isGerenteUser) {
      setVendasTotaisUSD(baselineUSD.vendasTotais);
      setSaldoDisponivelUSD(baselineUSD.saldoDisponivel);
      setVisitasUSD(baselineUSD.visitas);
      setCliquesUSD(baselineUSD.cliques);
      setPedidosUSD(baselineUSD.pedidos);
      setUnidadesUSD(baselineUSD.unidades);
      setHourlyDataUSD(baselineUSD.hourlyData);
      setRecentSalesUSD(baselineUSD.recentSales);
    } else {
      setVendasTotaisUSD(0);
      setSaldoDisponivelUSD(0);
      setVisitasUSD(0);
      setCliquesUSD(0);
      setPedidosUSD(0);
      setUnidadesUSD(0);
      setHourlyDataUSD(CLEAN_HOURLY);
      setRecentSalesUSD([]);
    }`;

const resetUsdReplacement = `    setVendasTotaisUSD(0);
    setSaldoDisponivelUSD(0);
    setVisitasUSD(0);
    setCliquesUSD(0);
    setPedidosUSD(0);
    setUnidadesUSD(0);
    setHourlyDataUSD(CLEAN_HOURLY);
    setRecentSalesUSD([]);

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
      localStorage.setItem(userStorageKeyUSD, JSON.stringify(emptyStateUSD));
      localStorage.setItem('decolashop_metrics_usd_gerente_decolashop_com', JSON.stringify(emptyStateUSD));
      localStorage.setItem('decolashop_metrics_usd_admin_decolashop_com', JSON.stringify(emptyStateUSD));
      localStorage.setItem('decolashop_metrics_usd_usuario_decolashop_com', JSON.stringify(emptyStateUSD));
    } catch {}`;

if (code.includes(resetUsdTarget)) {
  code = code.replace(resetUsdTarget, resetUsdReplacement);
  console.log('Patched resetData to zero out USD metrics.');
} else {
  console.log('resetUsdTarget not found.');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('salesContext.tsx updated successfully.');
