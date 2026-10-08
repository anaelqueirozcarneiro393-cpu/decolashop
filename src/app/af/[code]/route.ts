import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> | { code: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const rawCode = resolvedParams?.code || '';
  const cleanCode = rawCode.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

  const host = req.headers.get('host') || 'decolashop.com.br';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const targetUrl = `${proto}://${host}/?af=${encodeURIComponent(cleanCode)}`;

  const response = NextResponse.redirect(targetUrl, { status: 307 });

  if (cleanCode) {
    response.cookies.set('decolashop_af', cleanCode, {
      path: '/',
      maxAge: 365 * 86400,
      sameSite: 'lax',
    });
  }

  return response;
}
