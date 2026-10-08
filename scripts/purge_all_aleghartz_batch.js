const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mxukkgweuanemcgwvwdk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A';
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'next_auth' },
  auth: { persistSession: false }
});

async function purgeAll() {
  let totalPurged = 0;
  while (true) {
    const { data, error } = await supabase
      .from('verification_tokens')
      .select('identifier')
      .ilike('token', '%aleghartz%')
      .limit(500);

    if (error || !data || data.length === 0) {
      console.log('Nenhum outro registro de teste encontrado!');
      break;
    }

    console.log(`Encontrados ${data.length} registros para deletar...`);
    const ids = data.map(r => r.identifier);
    const { error: delError } = await supabase
      .from('verification_tokens')
      .delete()
      .in('identifier', ids);

    if (delError) {
      console.error('Erro ao deletar:', delError);
      break;
    }

    totalPurged += data.length;
    console.log(`Total deletado até agora: ${totalPurged}`);
  }
  console.log(`✅ FIM: ${totalPurged} registros de teste deletados com sucesso!`);
}

purgeAll();
