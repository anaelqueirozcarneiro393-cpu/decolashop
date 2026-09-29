/**
 * Google Services Integration
 * Handles Gemini (AI) and YouTube Data API calls.
 */

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SEARCH_CX = process.env.GOOGLE_SEARCH_CX;

/**
 * Generates ad copy using Gemini 1.5 Flash
 */
export async function generateGeminiAdCopy(productTitle: string, category: string) {
  if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY não configurada no ambiente.');
  }

  const prompt = `Você é um especialista em marketing digital para e-commerce (Shopee/Mercado Livre).
Gere 3 variações de anúncios persuasivos para o produto: "${productTitle}" da categoria "${category}".
Variação 1: Foco em Urgência e Escassez.
Variação 2: Foco em Prova Social e Tendência.
Variação 3: Foco em Benefícios e Estilo de Vida.
Use emojis e um tom viral. Mantenha cada copy curta e direta.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Erro 403: A "Generative Language API" não está ativada ou a chave de API é inválida/restrita.');
      }
      throw new Error(data.error?.message || 'Erro desconhecido no Gemini');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    console.error('Erro no Gemini:', error);
    throw error;
  }
}

/**
 * Searches for viral videos on YouTube related to a product
 */
export async function searchYouTubeTrends(query: string) {
  if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY não configurada.');
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query + ' shopee viral unboxing')}&type=video&key=${GOOGLE_API_KEY}`
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Erro 403: A "YouTube Data API v3" não está ativada ou a cota foi excedida.');
      }
      throw new Error(data.error?.message || 'Erro desconhecido no YouTube');
    }

    return data.items.map((item: any) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      thumbnail: item.snippet.thumbnails.high.url
    }));
  } catch (error: any) {
    console.error('Erro no YouTube:', error);
    throw error;
  }
}

/**
 * Google Custom Search (Optional / Requires CX)
 */
export async function searchGoogleWeb(query: string) {
  if (!GOOGLE_API_KEY || !SEARCH_CX) {
    return null; // Silently fail or handle as needed
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_CX}&q=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('Google Search 403: Verifique se o CX está correto ou se a pesquisa na web está ativa.');
        return null;
      }
      throw new Error(data.error?.message || 'Erro no Google Search');
    }

    return data.items;
  } catch (error) {
    console.error('Erro no Google Search:', error);
    return null;
  }
}
