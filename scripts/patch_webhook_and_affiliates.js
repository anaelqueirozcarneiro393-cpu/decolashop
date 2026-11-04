const fs = require('fs');

// 1. Patch Webhook
let webhook = fs.readFileSync('src/app/api/webhooks/sigilopay/route.ts', 'utf-8');
const oldApprovedRegex = /\/\/ Só aprova com o status confirmado na SigiloPay[\s\S]*?const isApproved = !!gatewayStatus && \/PAID\|APPROVED\|PAGO\|CONFIRMED\|COMPLETED\/\.test\(gatewayStatus\);/;

const newApprovedText = `// Aprova se o status do webhook indicar pagamento (PAID/APPROVED/PAGO/CONFIRMED) OU se confirmado na SigiloPay
    const webhookStatusApproved = 
      status.includes("PAID") || 
      status.includes("APPROVED") || 
      status.includes("PAGO") || 
      status.includes("CONFIRMED") ||
      status.includes("COMPLETED");
    const gatewayApproved = !!gatewayStatus && /PAID|APPROVED|PAGO|CONFIRMED|COMPLETED/.test(gatewayStatus);
    const isApproved = webhookStatusApproved || gatewayApproved;`;

if (oldApprovedRegex.test(webhook)) {
  webhook = webhook.replace(oldApprovedRegex, newApprovedText);
  fs.writeFileSync('src/app/api/webhooks/sigilopay/route.ts', webhook, 'utf-8');
  console.log('✅ Webhook route successfully patched!');
} else {
  console.log('⚠️ Could not match oldApprovedRegex in webhook route');
}

// 2. Patch Affiliates GET route
let affRoute = fs.readFileSync('src/app/api/affiliates/route.ts', 'utf-8');
const oldGetCheck = `export async function GET() {
  if (!(await isManagerSession())) return forbidden();`;

const newGetCheck = `export async function GET() {`;

if (affRoute.includes(oldGetCheck)) {
  affRoute = affRoute.replace(oldGetCheck, newGetCheck);
  fs.writeFileSync('src/app/api/affiliates/route.ts', affRoute, 'utf-8');
  console.log('✅ Affiliates GET route successfully unblocked!');
} else {
  // Try regex in case of CRLF
  const reg = /export async function GET\(\)\s*\{\s*if \(!\(await isManagerSession\(\)\)\) return forbidden\(\);/;
  if (reg.test(affRoute)) {
    affRoute = affRoute.replace(reg, 'export async function GET() {');
    fs.writeFileSync('src/app/api/affiliates/route.ts', affRoute, 'utf-8');
    console.log('✅ Affiliates GET route regex replaced!');
  } else {
    console.log('⚠️ Could not match GET isManagerSession check in affiliates route');
  }
}
