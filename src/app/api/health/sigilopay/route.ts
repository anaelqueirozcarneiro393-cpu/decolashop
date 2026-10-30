import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { POST as processWebhook } from '@/app/api/webhooks/sigilopay/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Cruza os Pix pendentes do banco com o status real na SigiloPay.
// Mostra quais foram PAGOS mas não viraram cliente/venda. E-mails mascarados.
// Com ?reprocess=1, reenvia cada Pix pago e não salvo pelo webhook (que confere o status no gateway).
function maskEmail(email: string): string {
  const [user, domain] = (email || '').split('@');
  if (!domain) return '***';
  return `${user.slice(0, 3)}***@${domain}`;
}

export async function GET(req: Request) {
  const reprocess = new URL(req.url).searchParams.get('reprocess') === '1';
  const publicKey = process.env.SIGILOPAY_PUBLIC_KEY;
  const secretKey = process.env.SIGILOPAY_SECRET_KEY;
  const baseUrl = process.env.SIGILOPAY_BASE_URL || 'https://app.sigilopay.com.br';
  const supabase = getSupabaseAdmin();

  if (!publicKey || !secretKey) {
    return NextResponse.json({ ok: false, error: 'SIGILOPAY_PUBLIC_KEY / SIGILOPAY_SECRET_KEY não definidas' }, { status: 500 });
  }

  const { data: rows, error } = await supabase
    .from('verification_tokens')
    .select('token')
    .like('identifier', 'pending_pix:%');

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const pending = (rows || [])
    .map((r) => { try { return JSON.parse(r.token); } catch { return null; } })
    .filter((p) => p && p.transactionId)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, reprocess ? undefined : 20);

  const results: Record<string, unknown>[] = [];
  let rateLimited = false;

  for (const p of pending) {
    const email = String(p.email || '').toLowerCase().trim();
    const { data: user } = await supabase
      .from('users')
      .select('plan, plan_expires_at')
      .eq('email', email)
      .maybeSingle();

    // Só consulta o gateway quando faz diferença: cliente não salvo, plano abaixo do que
    // este Pix compraria (ex.: salvo só com bump, mas pagou o vitalício), ou taxa de saque
    const PLAN_RANK: Record<string, number> = { free: 0, bumps_only: 1, monthly: 2, lifetime: 3 };
    const belowPurchased = !user || (PLAN_RANK[user.plan] ?? 0) < (PLAN_RANK[p.plan] ?? 0);
    const needsGateway = belowPurchased || p.plan === 'taxa_antecipacao';
    let gatewayStatus: string | null = null;
    let gatewayAmount: number | null = null;
    let gatewayError: string | null = needsGateway ? null : 'não consultado (cliente já salvo)';

    if (needsGateway && rateLimited) {
      gatewayError = 'não consultado (SigiloPay limitou as requisições, tente em 1 minuto)';
    } else if (needsGateway) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await fetch(`${baseUrl}/api/v1/gateway/transactions?id=${encodeURIComponent(p.transactionId)}`, {
            headers: { 'x-public-key': publicKey, 'x-secret-key': secretKey },
            cache: 'no-store',
          });
          if (res.status === 429) {
            gatewayError = 'HTTP 429';
            if (attempt === 0) { await sleep(3000); continue; }
            rateLimited = true;
            break;
          }
          if (res.ok) {
            const tx = await res.json();
            gatewayStatus = String(tx.status || '').toUpperCase() || null;
            gatewayAmount = Number(tx.amount || tx.chargeAmount || 0) || null;
            gatewayError = null;
          } else {
            gatewayError = `HTTP ${res.status}`;
          }
          break;
        } catch (e) {
          gatewayError = String(e);
          break;
        }
      }
      await sleep(700);
    }

    const paid = !!gatewayStatus && /PAID|APPROVED|COMPLETED|CONFIRMED/.test(gatewayStatus);
    const result: Record<string, unknown> = {
      createdAt: new Date(p.createdAt).toISOString(),
      transactionId: p.transactionId,
      email: maskEmail(email),
      plan: p.plan,
      total: p.total,
      affiliateCode: p.affiliateCode || null,
      gatewayStatus,
      gatewayAmount,
      gatewayError,
      userInDb: user ? { plan: user.plan, expires: user.plan_expires_at } : null,
      lostSale: paid && p.plan !== 'taxa_antecipacao' && belowPurchased,
    };

    // Taxas de saque pagas também passam pelo webhook (o registro da taxa é idempotente)
    if (reprocess && paid && (result.lostSale || p.plan === 'taxa_antecipacao')) {
      const res = await processWebhook(new Request('http://internal/api/webhooks/sigilopay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: p.transactionId, email, status: gatewayStatus }),
      }));
      const out = await res.json().catch(() => ({}));
      const { data: after } = await supabase.from('users').select('plan').eq('email', email).maybeSingle();
      result.reprocessed = { httpStatus: res.status, message: out.message || out.error || null, userPlanNow: after?.plan ?? null };
    }

    results.push(result);
  }

  return NextResponse.json({
    gateway: baseUrl,
    checked: results.length,
    reprocess,
    rateLimited,
    paidNotSaved: results.filter((r) => r.lostSale).length,
    results,
  });
}
