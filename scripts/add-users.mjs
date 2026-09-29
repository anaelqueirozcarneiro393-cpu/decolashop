import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'next_auth',
  },
});

async function main() {
  const emails = [
    "andreiarosariotorres@gmail.com",
    "edenilton02011@gmail.com",
    "alineelen2026@gmail.com"
  ];

  const plan = 'yearly';
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 10);

  for (const email of emails) {
    // Try to update existing user
    const { data, error } = await supabase
      .from('users')
      .update({
        plan: plan,
        plan_expires_at: expiresAt.toISOString(),
      })
      .eq('email', email)
      .select();

    if (error) {
      console.error(`Erro ao atualizar ${email}:`, error);
      continue;
    }

    if (!data || data.length === 0) {
      // Insert into pending
      const { error: insertError } = await supabase
        .from('pending_purchases')
        .insert({
          email: email,
          plan: plan,
          plan_expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error(`Erro ao inserir pendente ${email}:`, insertError);
      } else {
        console.log(`Pendente adicionado: ${email}`);
      }
    } else {
      console.log(`Usuário atualizado: ${email}`);
    }
  }
}

main();
