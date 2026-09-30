import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, cpf, phone, password, plan, bumps, transactionId } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'E-mail obrigatório para ativação da conta.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();
    const userPlan = plan === 'monthly' ? 'monthly' : 'lifetime';

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          db: { schema: 'next_auth' }
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (userPlan === 'monthly' ? 30 : 3650)); // 10 years for lifetime

        // Check if user exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingUser) {
          await supabase
            .from('users')
            .update({
              name: cleanName,
              plan: userPlan,
              plan_expires_at: expiresAt.toISOString(),
              status: 'active',
              order_bumps: bumps || [],
              phone: phone || null,
              cpf: cpf || null,
              password: password || existingUser.password || 'decola123'
            })
            .eq('email', cleanEmail);
        } else {
          await supabase
            .from('users')
            .insert({
              email: cleanEmail,
              name: cleanName,
              plan: userPlan,
              plan_expires_at: expiresAt.toISOString(),
              status: 'active',
              order_bumps: bumps || [],
              phone: phone || null,
              cpf: cpf || null,
              password: password || 'decola123'
            });
        }
      } catch (dbErr: any) {
        console.warn('[Confirm Payment DB Warning]:', dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pagamento confirmado e conta ativada!',
      user: {
        email: cleanEmail,
        name: cleanName,
        plan: userPlan
      }
    });

  } catch (error: any) {
    console.error('[Confirm Payment Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao confirmar pagamento' },
      { status: 500 }
    );
  }
}
