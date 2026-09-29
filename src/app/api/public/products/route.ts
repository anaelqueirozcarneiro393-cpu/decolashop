import { NextResponse } from 'next/server';
import { getProductsFromSupabase } from '@/app/actions';

export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const result = await getProductsFromSupabase();
    
    if (!result.success || !result.data) {
      throw new Error('Failed to fetch products');
    }

    // Convert string prices to numbers if needed and format
    const formattedProducts = result.data.map((p: any) => {
      let numPrice = 50.00;
      if (typeof p.price === 'string') {
        const cleanStr = p.price.replace('R$', '').replace(/\s/g, '').replace('.', '').replace(',', '.');
        numPrice = parseFloat(cleanStr) || 50.00;
      } else if (typeof p.price === 'number') {
        numPrice = p.price;
      }

      return {
        id: p.id,
        name: p.name || p.title,
        price: numPrice,
        image: p.image_url || p.url_imagem,
        shopeeLink: p.url || p.shopeeLink || '#',
        category: p.category || 'Geral',
        hype_score: p.hype_score || 90,
        commission: p.commission || `R$ ${(numPrice * 0.32).toFixed(2).replace('.', ',')}`,
        weight: (100 - (p.hype_score || 50)) / 100 // Generate a fake weight based on hype
      };
    });

    return NextResponse.json(formattedProducts, { status: 200, headers });
  } catch (error) {
    console.error("Error fetching from Supabase for public API:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500, headers });
  }
}

export async function OPTIONS() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  return new NextResponse(null, { status: 204, headers });
}
