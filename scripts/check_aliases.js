const { createClient } = require('@supabase/supabase-js');
const targetUrl = 'https://chgttysabvuoxpujfuho.supabase.co';
const targetPub = 'sb_publishable_MK3ImGrf9HccrQgGTKVhzQ_-BiCjb-_';
const supabase = createClient(targetUrl, targetPub, { db: { schema: 'public' } });

async function check() {
  const { data: sales, error } = await supabase.from('verification_tokens').select('*').like('token', '%"affiliateCode":"davi"%');
  console.log('Matches with affiliateCode: davi ->', sales ? sales.length : 0);
  if (sales && sales.length) {
    sales.forEach(s => console.log(s.identifier, s.token));
  }
}
check();
