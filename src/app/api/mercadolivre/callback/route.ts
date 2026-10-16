import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.decolashop.com.br';

  if (error || !code) {
    console.error('[ML OAuth Callback Error]:', error, errorDescription);
    return NextResponse.redirect(`${baseUrl}/conectar?error=${encodeURIComponent(errorDescription || error || 'Autorização cancelada')}`);
  }

  try {
    const clientId = process.env.MERCADOLIVRE_APP_ID || '3278352647379225';
    const clientSecret = process.env.MERCADOLIVRE_CLIENT_SECRET || '9OPZD3sQ8MRoJowcGft6bxKrqYA77A51';
    
    // Determine the exact redirect URI registered in ML App
    const redirectUri = 'https://www.decolashop.com.br';

    const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[ML Token Exchange Failed]:', tokenData);
      return NextResponse.redirect(`${baseUrl}/conectar?error=${encodeURIComponent(tokenData.message || 'Falha ao trocar código do Mercado Livre')}`);
    }

    // Fetch the client's seller profile
    let clientName = 'Vendedor Mercado Livre';
    let clientEmail = '';
    let clientShopName = 'Minha Loja ML';
    let clientNickname = '';
    const sellerId = `MLB-${tokenData.user_id || Math.floor(1000000000 + Math.random() * 9000000000)}`;

    try {
      const userRes = await fetch(`https://api.mercadolibre.com/users/${tokenData.user_id}`, {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      });
      if (userRes.ok) {
        const u = await userRes.json();
        clientName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.nickname || clientName;
        clientEmail = u.email || '';
        clientShopName = u.company?.brand_name || u.nickname || clientShopName;
        clientNickname = u.nickname || '';
      }
    } catch (uErr) {
      console.warn('[ML User Fetch Warning]:', uErr);
    }

    const redirectParams = new URLSearchParams({
      ml_connected: 'success',
      shopName: clientShopName,
      name: clientName,
      email: clientEmail,
      sellerNickname: clientNickname,
      sellerId: sellerId
    });

    return NextResponse.redirect(`${baseUrl}/conectar?${redirectParams.toString()}`);
  } catch (err: any) {
    console.error('[ML Callback Fatal]:', err);
    return NextResponse.redirect(`${baseUrl}/conectar?error=${encodeURIComponent(err?.message || 'Erro inesperado na conexão')}`);
  }
}
