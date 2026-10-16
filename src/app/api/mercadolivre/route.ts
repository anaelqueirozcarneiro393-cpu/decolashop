import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.MERCADOLIVRE_APP_ID || '3278352647379225';
    const clientSecret = process.env.MERCADOLIVRE_CLIENT_SECRET || '9OPZD3sQ8MRoJowcGft6bxKrqYA77A51';

    if (!clientId || !clientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Credenciais da plataforma Mercado Livre não configuradas.'
      }, { status: 400 });
    }

    const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.json({
        success: false,
        error: tokenData.message || 'Falha ao autenticar com API do Mercado Livre',
        details: tokenData
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Gateway Oficial Mercado Livre DecolaShop ativo com sucesso!',
      app_id: clientId,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erro interno na API do Mercado Livre'
    }, { status: 500 });
  }
}
