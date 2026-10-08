import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> | { code: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const rawCode = resolvedParams?.code || '';
  const cleanCode = rawCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

  let targetCode = cleanCode;
  if (cleanCode === 'kaio' || cleanCode === 'kaiofredy' || cleanCode === 'kaiofredy2908') {
    targetCode = 'rwjncwiofw';
  }

  const host = req.headers.get('host') || 'decolashop.com.br';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const targetUrl = `${proto}://${host}/?af=${encodeURIComponent(targetCode)}`;

  const response = NextResponse.redirect(targetUrl, { status: 307 });

  if (targetCode) {
    response.cookies.set('decolashop_af', targetCode, {
      path: '/',
      maxAge: 365 * 86400,
      sameSite: 'lax',
    });
  }

  return response;
}
