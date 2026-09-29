import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'next_auth',
  },
});

async function main() {
  const usersToUpdate = [
    { email: "edenilton02011@gmail.com", plan: "monthly", days: 30 },
    { email: "andreiarosariotorres@gmail.com", plan: "yearly", days: 365 },
    { email: "alineelen2026@gmail.com", plan: "monthly", days: 30 }
  ];

  for (const u of usersToUpdate) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + u.days);

    // Update in users table
    const { data, error } = await supabase
      .from('users')
      .update({
        plan: u.plan,
        plan_expires_at: expiresAt.toISOString(),
      })
      .eq('email', u.email)
      .select();

    if (error) {
      console.error(`Erro ao atualizar ${u.email} em users:`, error);
    }

    if (!data || data.length === 0) {
      // Update in pending_purchases table
      const { data: pData, error: pError } = await supabase
        .from('pending_purchases')
        .update({
          plan: u.plan,
          plan_expires_at: expiresAt.toISOString(),
        })
        .eq('email', u.email)
        .select();

      if (pError) {
        console.error(`Erro ao atualizar pendente ${u.email}:`, pError);
      } else {
        console.log(`Pendente ajustado: ${u.email} para ${u.plan}`);
      }
    } else {
      console.log(`Usuário ajustado: ${u.email} para ${u.plan}`);
    }
  }
}

main();
