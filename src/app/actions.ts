'use server';

import { searchYouTubeTrends } from '@/lib/google-services';
import { supabase } from '@/lib/supabase';
import { mockProducts } from '@/lib/mockData';

/**
 * Action to generate ad copy using Groq AI
 */
export async function generateAdAction(productTitle: string, category: string): Promise<{ success: boolean; copy?: string; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  const prompt = `Você é um copywriter de elite especialista em e-commerce e conversão.
Crie um anúncio persuasivo e altamente focado em vendas para o produto: "${productTitle}" da categoria "${category}".

Use a estrutura de copy focada em conversão:
1. Uma 'Hook' (Gancho) forte na primeira linha para chamar atenção.
2. Destaque o problema que o produto resolve ou o desejo que ele atende.
3. Crie 3 bullet points curtos e magnéticos com os principais benefícios (use emojis minimalistas como 💎, ✨, ✔️).
4. Crie senso de urgência ou escassez de forma elegante.
5. Finalize com um Call to Action (CTA) claro e direto ordenando o clique.

O tom deve ser premium e sofisticado, mas com energia de vendas direta. Não seja poético demais. Vá direto ao ponto.`;

  const premiumFailsafeCopy = `💎 EXCLUSIVO: ${productTitle}

Transforme sua rotina com o design premium e a eficiência que você merece. Nossa nova linha de ${category} acabou de chegar e já é um sucesso absoluto.

✨ Por que você precisa disso hoje?
- Qualidade superior com acabamento de luxo
- Design exclusivo que se destaca
- Durabilidade garantida para uso contínuo

🎁 Oferta Especial Limitada: Garanta o seu antes que o estoque esgote. 
Frete expresso disponível para todo o Brasil.

👉 Clique no link abaixo e descubra a diferença de ter o melhor em suas mãos.`;

  // 1. Try Gemini
  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'Você é um copywriter premium de e-commerce.' }]
          },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          return { success: true, copy: generatedText };
        }
      } else {
        console.warn("Gemini API returned error, attempting Groq fallback:", data.error?.message);
      }
    } catch (error: any) {
      console.error("Gemini Generation Error, attempting Groq fallback:", error);
    }
  }

  // 2. Try Groq Fallback
  if (groqApiKey) {
    try {
      console.log("Calling Groq fallback for ad copy generation...");
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "Você é um copywriter premium de e-commerce." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (response.ok) {
        const generatedText = data.choices?.[0]?.message?.content;
        if (generatedText) {
          console.log("Groq fallback successful!");
          return { success: true, copy: generatedText };
        }
      } else {
        console.warn("Groq API returned error:", data.error?.message);
      }
    } catch (error: any) {
      console.error("Groq Generation Error:", error);
    }
  }

  // 3. Failsafe Mockup (Never fail the UI)
  console.warn("Both Gemini and Groq failed. Returning failsafe copy.");
  return { success: true, copy: premiumFailsafeCopy };
}

/**
 * Action to refresh product trends from YouTube
 */
export async function refreshYouTubeTrendsAction(query: string) {
  try {
    const videos = await searchYouTubeTrends(query);
    return { success: true, videos };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Action to generate an AI image prompt based on the product and copy
 */
export async function generateAdImagePromptAction(productTitle: string, copyContext: string): Promise<{ success: boolean; prompt?: string; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;
  const fallbackPrompt = "luxurious minimalist marble studio with warm lighting";

  const prompt = `You are an expert prompt engineer. Create a very short, descriptive background scene prompt in ENGLISH for a product: "${productTitle}". 
The scene should be premium, aesthetic, and suitable as a background for this product. 
DO NOT include the product itself in the description, only the background environment/setting. 
Maximum length: 10 words. 
Output ONLY the English prompt. Example: "luxurious marble podium with studio lighting" or "neon cyberpunk street at night".`;

  // 1. Try Gemini
  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: 'You are an expert prompt engineer.' }]
          },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        let generatedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedPrompt) {
          generatedPrompt = generatedPrompt.replace(/["\n]/g, '').trim();
          return { success: true, prompt: generatedPrompt };
        }
      } else {
        console.warn("Gemini Prompt API returned error, attempting Groq fallback:", data.error?.message);
      }
    } catch (error: any) {
      console.error("Gemini Prompt Generation Error, attempting Groq fallback:", error);
    }
  }

  // 2. Try Groq Fallback
  if (groqApiKey) {
    try {
      console.log("Calling Groq fallback for image prompt generation...");
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: "You are an expert prompt engineer." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (response.ok) {
        let generatedPrompt = data.choices?.[0]?.message?.content;
        if (generatedPrompt) {
          console.log("Groq prompt fallback successful!");
          generatedPrompt = generatedPrompt.replace(/["\n]/g, '').trim();
          return { success: true, prompt: generatedPrompt };
        }
      } else {
        console.warn("Groq Prompt API returned error:", data.error?.message);
      }
    } catch (error: any) {
      console.error("Groq Prompt Generation Error:", error);
    }
  }

  // 3. Failsafe fallback prompt
  console.warn("Both Gemini and Groq failed for prompt. Returning fallback.");
  return { success: true, prompt: fallbackPrompt };
}

/**
 * Action to fetch products from Supabase
 */
export async function getProductsFromSupabase(): Promise<{ success: boolean; data: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('Product')
      .select('*')
      .order('hype_score', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn("Supabase returned empty or error, using mock fallback:", error?.message);
      return { success: true, data: mockProducts };
    }
    
    // Map ID to id and other Supabase columns to frontend compatibility
    const mappedData = data.map((item: any) => ({
      ...item,
      id: item.ID?.toString() || item.id,
      image_url: item.url_imagem || item.image_url,
      name: item.nome_do_produto || item.name || item.title,
      price: item.preco_estimado || item.price,
      title: item.nome_do_produto || item.name || item.title,
    }));

    return { success: true, data: mappedData };
  } catch (error: any) {
    console.warn("Supabase fetch exception, using mock fallback:", error.message);
    return { success: true, data: mockProducts };
  }
}
