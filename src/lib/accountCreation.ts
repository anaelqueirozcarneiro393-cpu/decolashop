import { getSupabaseAdmin, loadVerificationToken, saveVerificationToken } from '@/lib/supabaseAdmin';

/**
 * Busca a data exata de criação da conta de um usuário no Supabase.
 * Verifica tokens dedicados de criação, sync_state na nuvem, tokens de pagamento PIX,
 * vendas de afiliado registradas, data de expiração do plano (plan_expires_at) e metadados.
 */
export async function getAccountCreationTimestamp(email: string): Promise<number | null> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail) return null;

  try {
    // 0. Token imutável dedicado de criação de conta gravado no Supabase
    const dedicatedToken = await loadVerificationToken(`account_created:${cleanEmail}`);
    if (dedicatedToken) {
      const num = Number(dedicatedToken);
      if (!isNaN(num) && num > 0) {
        return num;
      }
    }

    // 0.1 Verifica no token persistente de sync_state na nuvem
    const syncStateRaw = await loadVerificationToken(`sync_state:${cleanEmail}`);
    if (syncStateRaw) {
      try {
        const syncObj = JSON.parse(syncStateRaw);
        if (typeof syncObj.accountCreatedAt === 'number' && syncObj.accountCreatedAt > 0) {
          await saveVerificationToken(`account_created:${cleanEmail}`, String(syncObj.accountCreatedAt));
          return syncObj.accountCreatedAt;
        }
      } catch {}
    }

    const supabase = getSupabaseAdmin('next_auth');
    if (!supabase) return null;

    // 1. Token de PIX pendente registrado na entrada do usuário
    const { data: pixToken } = await supabase
      .from('verification_tokens')
      .select('token')
      .eq('identifier', `pending_pix_email:${cleanEmail}`)
      .maybeSingle();

    if (pixToken?.token) {
      try {
        const p = JSON.parse(pixToken.token);
        if (typeof p.createdAt === 'number' && p.createdAt > 0) {
          await saveVerificationToken(`account_created:${cleanEmail}`, String(p.createdAt));
          return p.createdAt;
        }
      } catch {}
    }

    // 2. Venda de afiliado gravada para este comprador
    const { data: salesTokens } = await supabase
      .from('verification_tokens')
      .select('token')
      .like('identifier', 'affiliate_sale:%');

    if (salesTokens && salesTokens.length > 0) {
      for (const st of salesTokens) {
        try {
          const p = JSON.parse(st.token);
          if (p.customerEmail && p.customerEmail.toLowerCase().trim() === cleanEmail) {
            if (typeof p.createdAt === 'number' && p.createdAt > 0) {
              await saveVerificationToken(`account_created:${cleanEmail}`, String(p.createdAt));
              return p.createdAt;
            }
          }
        } catch {}
      }
    }

    // 3. Checa tokens de lead registrados
    const { data: leadTokens } = await supabase
      .from('verification_tokens')
      .select('token')
      .eq('identifier', `lead_affiliate:${cleanEmail}`)
      .maybeSingle();

    if (leadTokens?.token) {
      try {
        const p = JSON.parse(leadTokens.token);
        if (typeof p.createdAt === 'number' && p.createdAt > 0) {
          await saveVerificationToken(`account_created:${cleanEmail}`, String(p.createdAt));
          return p.createdAt;
        }
      } catch {}
    }

    // 4. Data calculada via plan_expires_at na tabela users
    const { data: dbUser } = await supabase
      .from('users')
      .select('plan, plan_expires_at, image')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (dbUser?.plan_expires_at) {
      const exp = new Date(dbUser.plan_expires_at).getTime();
      if (!isNaN(exp) && exp > 0) {
        let calculatedTs: number | null = null;
        if (dbUser.plan === 'monthly') {
          calculatedTs = exp - (30 * 24 * 60 * 60 * 1000);
        } else if (dbUser.plan === 'lifetime' && !dbUser.plan_expires_at.startsWith('2099')) {
          calculatedTs = exp - (3650 * 24 * 60 * 60 * 1000);
        }
        if (calculatedTs && calculatedTs > 0) {
          await saveVerificationToken(`account_created:${cleanEmail}`, String(calculatedTs));
          return calculatedTs;
        }
      }
    }

    // 5. Metadados salvos na coluna image
    if (dbUser?.image && dbUser.image.startsWith('{')) {
      try {
        const meta = JSON.parse(dbUser.image);
        const metaTs = meta.createdAt || meta.created_at;
        if (typeof metaTs === 'number' && metaTs > 0) {
          await saveVerificationToken(`account_created:${cleanEmail}`, String(metaTs));
          return metaTs;
        }
      } catch {}
    }
  } catch (err) {
    console.error('[ACCOUNT CREATION] Erro ao buscar data de criação:', err);
  }

  // Contas padrão de demonstração e administração
  if (cleanEmail === 'usuario@decolashop.com') {
    return Date.now() - (6 * 24 * 60 * 60 * 1000); // 6 dias atrás
  }
  if (cleanEmail === 'gerente@decolashop.com' || cleanEmail === 'admin@decolashop.com') {
    return Date.now() - (35 * 24 * 60 * 60 * 1000); // 35 dias atrás (liberado)
  }

  return null;
}

/**
 * Salva a data de criação de conta no Supabase de forma estritamente imutável.
 * Se já existir uma data registrada, mantém SEMPRE o timestamp mais antigo (Math.min),
 * garantindo que a carência nunca seja resetada ao trocar de aparelho ou relogar.
 */
export async function setAccountCreationTimestamp(email: string, ts: number): Promise<number> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail || !ts || isNaN(ts) || ts <= 0) return ts;

  try {
    const existing = await getAccountCreationTimestamp(cleanEmail);
    const finalTs = existing ? Math.min(existing, ts) : ts;
    await saveVerificationToken(`account_created:${cleanEmail}`, String(finalTs));
    return finalTs;
  } catch (err) {
    console.error('[ACCOUNT CREATION] Erro ao salvar data de criação:', err);
    return ts;
  }
}

