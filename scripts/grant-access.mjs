import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'next_auth',
  },
});

async function grantAccess(email, planName) {
  let expiresAt = new Date();
  if (planName === 'mensal') {
    expiresAt.setDate(expiresAt.getDate() + 30);
  } else if (planName === 'yearly' || planName === 'anual') {
    expiresAt.setDate(expiresAt.getDate() + 365);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 10); // lifetime
  }
  
  const plan = planName === 'mensal' ? 'monthly' : (planName === 'anual' ? 'yearly' : 'lifetime');

  console.log(`Granting ${plan} access to ${email}...`);

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
    console.error(`❌ Error updating ${email}:`, error);
    return;
  }

  if (!data || data.length === 0) {
    console.log(`⚠️ User ${email} not found in next_auth.users. Saving to pending_purchases...`);
    const { error: insertError } = await supabase
      .from('pending_purchases')
      .insert({
        email: email,
        plan: plan,
        plan_expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error(`❌ Error inserting pending purchase for ${email}:`, insertError);
    } else {
      console.log(`✅ Pending purchase saved for ${email}`);
    }
  } else {
    console.log(`✅ Access granted for existing user ${email}`);
  }
}

async function main() {
  await grantAccess('raysabfc@gmail.com', 'mensal');
  await grantAccess('rf6439632@gmail.com', 'vitalício');
}

main();
