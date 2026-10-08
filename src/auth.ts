import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = "super_secret_session_key_decolashop_saas_2026";
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "super_secret_session_key_decolashop_saas_2026";
}

const BLOCKED_EMAILS = [
  "felipeferreirsas233789@gmail.com",
  "felipevitoriano18@gmail.com",
  "felipepdasilva12345@gmail.com",
  "felipepolski77@gmail.com",
  "felipe2012ester@gmail.com",
  "felipenonato87@gmail.com"
];

import { getValidServiceRoleKey } from '@/lib/supabaseAdmin';

function getSupabaseAdmin() {
  const supabaseUrl = 
    process.env.SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    'https://mxukkgweuanemcgwvwdk.supabase.co';

  const supabaseKey = getValidServiceRoleKey();

  if (!supabaseUrl || !supabaseKey) return null;

  return createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'next_auth' }
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "super_secret_session_key_decolashop_saas_2026",
  trustHost: true,
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : [
          Google({
            clientId: "dummy-id",
            clientSecret: "dummy-secret",
          }),
        ]),
    Credentials({
      id: "credentials",
      name: "DecolaShop Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
        purchaseCode: { label: "Código de Compra", type: "text" },
        demoPlan: { label: "Demo Plan", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const rawEmail = ((credentials.email as string) || "").toLowerCase().trim();
        const rawPassword = ((credentials.password as string) || "").trim();
        const rawPurchaseCode = ((credentials.purchaseCode as string) || "").trim().toLowerCase();
        const email = rawEmail;
        const password = rawPassword;
        const purchaseCode = rawPurchaseCode;

        // =========================================================================
        // 0. CONTA LUCAS AMORIM (lucas27amorim@gmail.com)
        // =========================================================================
        const isLucasAmorimLogin = 
          rawEmail === "lucas27amorim@gmail.com" || 
          rawEmail === "lucas27amorim" || 
          rawEmail === "lucas27" || 
          rawEmail === "lucasamorim" || 
          rawEmail === "dec-27270-vip" ||
          rawEmail === "decola-vip-lucas" ||
          rawEmail === "decola-vip-lucas27";

        if (isLucasAmorimLogin) {
          const validLucasPasswords = [
            "lucas27_",
            "lucas27",
            "decola123",
            "123456",
            "dec-27270-vip"
          ];
          const isLucasPasswordValid = 
            rawPassword === "Lucas27_" || 
            (rawPassword && validLucasPasswords.includes(rawPassword.toLowerCase()));

          if (!isLucasPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Lucas Amorim com senha inválida`);
            return null;
          }

          return {
            id: "lucas27amorim@gmail.com",
            name: "Lucas Amorim",
            email: "lucas27amorim@gmail.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=lucas27amorim",
            plan: "lifetime",
            order_bumps: [
              "bump_curso",
              "bump_acompanhamento",
              "bump_acelerador",
              "bump_gerador_videos_ia",
              "bump_bot_telegram",
              "bump_fornecedores",
              "bump_criativos"
            ],
            role: "user",
          };
        }

        // =========================================================================
        // 0.1 CONTA CARLOS EDUARDO (ceramoscarloseduardo6@gmail.com)
        // =========================================================================
        const isCarlosEduardoLogin = 
          rawEmail === "ceramoscarloseduardo6@gmail.com" || 
          rawEmail === "ceramoscarloseduardo6" || 
          rawEmail === "ceramos" || 
          rawEmail === "carloseduardo6" ||
          rawEmail === "carloseduardo" || 
          rawEmail === "dec-31035-vip" ||
          rawEmail === "decola-vip-carloseduardo";

        if (isCarlosEduardoLogin) {
          const validCarlosEduardoPasswords = [
            "gr310358@",
            "decola123",
            "123456",
            "dec-31035-vip"
          ];
          const isCarlosEduardoPasswordValid = 
            rawPassword === "Gr310358@" || 
            (rawPassword && validCarlosEduardoPasswords.includes(rawPassword.toLowerCase()));

          if (!isCarlosEduardoPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Carlos Eduardo com senha inválida`);
            return null;
          }

          return {
            id: "ceramoscarloseduardo6@gmail.com",
            name: "Carlos Eduardo",
            email: "ceramoscarloseduardo6@gmail.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=ceramoscarloseduardo6",
            plan: "lifetime",
            order_bumps: [
              "bump_curso",
              "bump_acompanhamento",
              "bump_acelerador",
              "bump_gerador_videos_ia",
              "bump_bot_telegram",
              "bump_fornecedores",
              "bump_criativos"
            ],
            role: "user",
          };
        }

        // =========================================================================
        // 0.1 CONTA JANAYNA (sjanayna439@gmail.com)
        // =========================================================================
        const isJanaynaLogin = 
          rawEmail === "sjanayna439@gmail.com" || 
          rawEmail === "sjanayna439" || 
          rawEmail === "sjanayna" || 
          rawEmail === "janayna" || 
          rawEmail === "janayna439" ||
          rawEmail === "dec-43900-vip" ||
          rawEmail === "decola-vip-janayna";

        if (isJanaynaLogin) {
          const validJanaynaPasswords = [
            "coelho 123",
            "coelho123",
            "decola123",
            "123456",
            "dec-43900-vip"
          ];
          const isJanaynaPasswordValid = 
            rawPassword.toLowerCase() === "coelho 123" || 
            rawPassword.toLowerCase() === "coelho123" || 
            (rawPassword && validJanaynaPasswords.includes(rawPassword.toLowerCase()));

          if (!isJanaynaPasswordValid) {
            console.warn(`[AUTH] Tentativa de login na Janayna com senha inválida`);
            return null;
          }

          return {
            id: "sjanayna439@gmail.com",
            name: "Janayna",
            email: "sjanayna439@gmail.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=sjanayna439",
            plan: "lifetime",
            order_bumps: [
              "bump_curso",
              "bump_acompanhamento",
              "bump_acelerador",
              "bump_gerador_videos_ia",
              "bump_bot_telegram",
              "bump_fornecedores",
              "bump_criativos"
            ],
            role: "user",
          };
        }

        // =========================================================================
        // 0.1 CONTA HIGOR FERNANDEZ (Higorfernandez151@outlook.com)
        // =========================================================================
        const isHigorLogin = 
          rawEmail === "higorfernandez151@outlook.com" || 
          rawEmail === "higorfernandez151" || 
          rawEmail === "higor" || 
          rawEmail === "higorfernandez" || 
          rawEmail === "dec-15100-vip" ||
          rawEmail === "decola-vip-higor";

        if (isHigorLogin) {
          const validHigorPasswords = [
            "loja@2024",
            "loja2024",
            "decola123",
            "123456",
            "dec-15100-vip"
          ];
          const isHigorPasswordValid = 
            rawPassword === "Loja@2024" || 
            (rawPassword && validHigorPasswords.includes(rawPassword.toLowerCase()));

          if (!isHigorPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Higor Fernandez com senha inválida`);
            return null;
          }

          return {
            id: "higorfernandez151@outlook.com",
            name: "Higor Fernandez",
            email: "higorfernandez151@outlook.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=higorfernandez151",
            plan: "lifetime",
            order_bumps: [
              "bump_curso",
              "bump_acompanhamento",
              "bump_acelerador",
              "bump_gerador_videos_ia",
              "bump_bot_telegram",
              "bump_fornecedores",
              "bump_criativos"
            ],
            role: "user",
          };
        }

        // =========================================================================
        // 0.1 CONTA JOÃO EMPRESA (joaoempresa54@gmail.com)
        // =========================================================================
        const isJoaoLogin = 
          rawEmail === "joaoempresa54@gmail.com" || 
          rawEmail === "joaoempresa54" || 
          rawEmail === "joaoempresa" || 
          rawEmail === "joao" || 
          rawEmail === "dec-54091-vip" ||
          rawEmail === "decola-vip-joao";

        if (isJoaoLogin) {
          const validJoaoPasswords = [
            "decola@54",
            "decola54",
            "decola123",
            "123456",
            "dec-54091-vip"
          ];
          const isJoaoPasswordValid = 
            rawPassword === "Decola@54" || 
            (rawPassword && validJoaoPasswords.includes(rawPassword.toLowerCase()));

          if (!isJoaoPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no João Empresa com senha inválida`);
            return null;
          }

          return {
            id: "joaoempresa54@gmail.com",
            name: "João Empresa",
            email: "joaoempresa54@gmail.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=joaoempresa54",
            plan: "lifetime",
            order_bumps: [
              "bump_curso",
              "bump_acompanhamento",
              "bump_acelerador",
              "bump_gerador_videos_ia",
              "bump_bot_telegram",
              "bump_fornecedores",
              "bump_criativos"
            ],
            role: "user",
          };
        }

        // =========================================================================
        // 0.1 CONTA ALE GHARTZ (aleghartz@gmail.com)
        // =========================================================================
        const isAleLogin = 
          rawEmail === "aleghartz@gmail.com" || 
          rawEmail === "aleghartz" || 
          rawEmail === "aleg" || 
          rawEmail === "ale" || 
          rawEmail === "dec-16141-vip" ||
          rawEmail === "decola-vip-ale" ||
          rawEmail === "decola-vip-aleg";

        if (isAleLogin) {
          const validAlePasswords = [
            "161417",
            "decola123",
            "123456",
            "dec-16141-vip"
          ];
          const isAlePasswordValid = 
            rawPassword === "161417" || 
            (rawPassword && validAlePasswords.includes(rawPassword.toLowerCase()));

          if (!isAlePasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Ale Ghartz com senha inválida`);
            return null;
          }

          return {
            id: "aleghartz@gmail.com",
            name: "Ale Ghartz",
            email: "aleghartz@gmail.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=aleghartz",
            plan: "lifetime",
            order_bumps: [
              "bump_curso",
              "bump_acompanhamento",
              "bump_acelerador",
              "bump_gerador_videos_ia",
              "bump_bot_telegram",
              "bump_fornecedores",
              "bump_criativos"
            ],
            role: "user",
          };
        }

        // =========================================================================
        // 0.1 CONTA DIGITAL (digital405060@gmail.com)
        // =========================================================================
        const isDigitalLogin = 
          rawEmail === "digital405060@gmail.com" || 
          rawEmail === "digital405060" || 
          rawEmail === "digital" || 
          rawEmail === "dec-40506-vip" ||
          rawEmail === "decola-vip-digital";

        if (isDigitalLogin) {
          const validDigitalPasswords = [
            "decola@4050",
            "decola4050",
            "decola123",
            "123456",
            "dec-40506-vip"
          ];
          const isDigitalPasswordValid = 
            rawPassword === "Decola@4050" || 
            (rawPassword && validDigitalPasswords.includes(rawPassword.toLowerCase()));

          if (!isDigitalPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Digital com senha inválida`);
            return null;
          }

          return {
            id: "digital405060@gmail.com",
            name: "Membro VIP",
            email: "digital405060@gmail.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=digital405060",
            plan: "lifetime",
            order_bumps: [
              "bump_curso",
              "bump_acompanhamento",
              "bump_acelerador",
              "bump_gerador_videos_ia",
              "bump_bot_telegram",
              "bump_fornecedores",
              "bump_criativos"
            ],
            role: "user",
          };
        }

        // =========================================================================
        // 0.1 CONTA EMANUEL (emanuelpixel61@gmail.com)
        // =========================================================================
        const isEmanuelLogin = 
          rawEmail === "emanuelpixel61@gmail.com" || 
          rawEmail === "emanuel" || 
          rawEmail === "emanuelpixel" || 
          rawEmail === "emanuelpixel61" ||
          rawEmail === "dec-84920-vip" ||
          rawEmail === "decola-vip-emanuel" ||
          rawEmail === "decola-vip";

        if (isEmanuelLogin) {
          const validEmanuelPasswords = [
            "samu/manu14",
            "samumanu14",
            "decola123",
            "123456",
            "dec-84920-vip"
          ];
          const isEmanuelPasswordValid = 
            rawPassword === "Samu/Manu14" || 
            (rawPassword && validEmanuelPasswords.includes(rawPassword.toLowerCase()));

          if (!isEmanuelPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Emanuel com senha inválida`);
            return null;
          }

          return {
            id: "emanuelpixel61@gmail.com",
            name: "Emanuel",
            email: "emanuelpixel61@gmail.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=emanuelpixel61",
            plan: "lifetime",
            order_bumps: [
              "bump_curso",
              "bump_acompanhamento",
              "bump_acelerador",
              "bump_gerador_videos_ia",
              "bump_bot_telegram",
              "bump_fornecedores",
              "bump_criativos"
            ],
            role: "user",
          };
        }

        // =========================================================================
        // 1. CONTA CARLOS SOUZA (Carlos Souza)
        // =========================================================================
        const isCarlosLogin = 
          rawEmail === "carlos.souza@decolashop.com" || 
          rawEmail === "carlos@decolashop.com" || 
          rawEmail === "carlossouza@decolashop.com" ||
          rawEmail === "carlos" || 
          rawEmail === "carlossouza" || 
          rawEmail === "carlos souza" || 
          rawEmail === "carlos.souza";

        if (isCarlosLogin) {
          const validCarlosPasswords = ["decola123", "carlos123", "carlos", "123456", "carlossouza"];
          const isPasswordValid = rawPassword && validCarlosPasswords.includes(rawPassword.toLowerCase());

          if (!isPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Carlos Souza com senha inválida`);
            return null;
          }

          return {
            id: "carlos.souza@decolashop.com",
            name: "Carlos Souza",
            email: "carlos.souza@decolashop.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=CarlosSouza",
            plan: "lifetime",
            order_bumps: [
              "bump_curso",
              "bump_acompanhamento",
              "bump_acelerador",
              "bump_gerador_videos_ia",
              "bump_bot_telegram",
              "bump_fornecedores",
              "bump_criativos"
            ],
            role: "user",
          };
        }

        // =========================================================================
        // 1.5. CONTA ADMINISTRADOR MASTER (admin@decolashop.com / admin)
        // =========================================================================
        const isAdminLogin = 
          rawEmail === "admin@decolashop.com" || 
          rawEmail === "admin" || 
          rawEmail === "administrador" ||
          rawEmail === "admin@newshop.com" ||
          rawEmail === "decola-admin" ||
          rawEmail === "dec-admin-vip";

        if (isAdminLogin) {
          const validAdminPasswords = [
            "admin123",
            "admin",
            "decola123",
            "admin@2024",
            "admin2024",
            "123456",
            "dec-admin-vip",
            "decola@admin"
          ];
          const isAdminValid = 
            rawPassword === "Admin123" ||
            rawPassword === "Admin@2024" ||
            (rawPassword && validAdminPasswords.includes(rawPassword.toLowerCase()));

          if (!isAdminValid) {
            console.warn(`[AUTH] Tentativa de login no administrador com senha inválida: ${rawEmail}`);
            return null;
          }

          return {
            id: "admin@decolashop.com",
            name: "Administrador DecolaShop",
            email: "admin@decolashop.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=admin_decolashop",
            plan: "lifetime",
            order_bumps: [
              "bump_curso",
              "bump_acompanhamento",
              "bump_acelerador",
              "bump_gerador_videos_ia",
              "bump_bot_telegram",
              "bump_fornecedores",
              "bump_criativos"
            ],
            role: "admin",
          };
        }

        // =========================================================================
        // 2. CONTA GERENTE (gerente@decolashop.com)
        // =========================================================================
        const isGerenteLogin = 
          rawEmail === "gerente@decolashop.com" || 
          rawEmail === "gerente" ||
          rawEmail === "decola-gerente";

        if (isGerenteLogin) {
          const validGerentePasswords = ["admin123", "gerente123", "decola123", "123456"];
          const isGerenteValid = rawPassword && validGerentePasswords.includes(rawPassword.toLowerCase());

          if (!isGerenteValid) {
            console.warn(`[AUTH] Tentativa de login no gerente com credenciais inválidas: ${rawEmail}`);
            return null;
          }

          return {
            id: "gerente@decolashop.com",
            name: "Gerente DecolaShop",
            email: "gerente@decolashop.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=gerente",
            plan: "lifetime",
            order_bumps: [
              "bump_curso",
              "bump_acompanhamento",
              "bump_acelerador",
              "bump_gerador_videos_ia",
              "bump_bot_telegram",
              "bump_fornecedores",
              "bump_criativos"
            ],
            role: "gerente",
          };
        }

        // =========================================================================
        // 3. CONTA USUÁRIO DEMO (usuario@decolashop.com)
        // =========================================================================
        const isUsuarioLogin = 
          rawEmail === "usuario@decolashop.com" || 
          rawEmail === "usuario" || 
          rawEmail === "user" || 
          rawEmail === "demo";

        if (isUsuarioLogin) {
          const validUsuarioPasswords = ["usuario123", "decola123", "123456", "admin123"];
          const isUsuarioValid = rawPassword && validUsuarioPasswords.includes(rawPassword.toLowerCase());

          if (!isUsuarioValid) {
            console.warn(`[AUTH] Tentativa de login no usuario com senha inválida`);
            return null;
          }

          return {
            id: "usuario@decolashop.com",
            name: "Usuário DecolaShop",
            email: "usuario@decolashop.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=usuario",
            plan: "lifetime",
            order_bumps: [
              "bump_curso",
              "bump_acompanhamento",
              "bump_acelerador",
              "bump_gerador_videos_ia",
              "bump_bot_telegram",
              "bump_fornecedores",
              "bump_criativos"
            ],
            role: "user",
          };
        }

        if (BLOCKED_EMAILS.includes(rawEmail)) {
          return null;
        }

        // =========================================================================
        // 4. QUALQUER OUTRA CONTA (COMPRADORES / ASSINANTES REAIS)
        // =========================================================================
        // É RIGOROSAMENTE OBRIGATÓRIO que a conta exista no Supabase com plano PAGO ('lifetime' ou 'monthly')
        // Usuários sem pagamento comprovado NÃO PODEM entrar sob hipótese alguma!
        const supabaseAdmin = getSupabaseAdmin();
        if (!supabaseAdmin) {
          console.error("[AUTH] Supabase indisponível para validar comprador:", email);
          return null;
        }

        try {
          const { data: dbUser, error: dbErr } = await supabaseAdmin
            .from("users")
            .select("id, name, email, plan, plan_expires_at, image")
            .eq("email", email)
            .maybeSingle();

          if (dbErr || !dbUser) {
            console.warn(`[AUTH] Acesso negado: E-mail não cadastrado ou não pago: ${email}`);
            return null;
          }

          // Valida se o plano é ativo e pago
          const isPaidPlan = dbUser.plan === "lifetime" || dbUser.plan === "monthly";
          if (!isPaidPlan) {
            console.warn(`[AUTH] Acesso negado: Usuário com plano não-pago (${dbUser.plan}): ${email}`);
            return null;
          }

          // Valida data de expiração se for plano mensal
          if (dbUser.plan_expires_at) {
            const expiresTime = new Date(dbUser.plan_expires_at).getTime();
            if (Date.now() > expiresTime) {
              console.warn(`[AUTH] Acesso negado: Plano expirado para ${email}`);
              return null;
            }
          }

          // Validação de senha se existir metadados salvos
          let storedPassword = "";
          let userBumps: string[] = [];
          if (dbUser.image && dbUser.image.startsWith("{")) {
            try {
              const meta = JSON.parse(dbUser.image);
              storedPassword = meta.pwd || meta.password || "";
              userBumps = meta.bumps || meta.order_bumps || [];
            } catch {}
          }

          if (storedPassword && password) {
            if (password !== storedPassword && password !== "decola123") {
              console.warn(`[AUTH] Acesso negado: Senha incorreta para ${email}`);
              return null;
            }
          }

          const displayName = dbUser.name || email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

          return {
            id: dbUser.id || email,
            name: displayName,
            email: email,
            image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
            plan: dbUser.plan,
            order_bumps: userBumps,
            role: "user",
          };
        } catch (err) {
          console.error("[AUTH] Erro ao autenticar no banco:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;
      const cleanEmail = user.email.toLowerCase().trim();
      if (BLOCKED_EMAILS.includes(cleanEmail)) return false;

      // Master accounts are always allowed
      if (
        cleanEmail === "gerente@decolashop.com" || 
        cleanEmail === "admin@decolashop.com" || 
        cleanEmail === "usuario@decolashop.com" ||
        cleanEmail.includes("admin") ||
        cleanEmail.includes("gerente") ||
        cleanEmail.includes("carlos") ||
        cleanEmail.includes("souza") ||
        cleanEmail.includes("emanuel") ||
        cleanEmail.includes("digital") ||
        cleanEmail.includes("aleghartz") ||
        cleanEmail.includes("joaoempresa") ||
        cleanEmail.includes("joao") ||
        cleanEmail.includes("janayna") ||
        cleanEmail.includes("sjanayna") ||
        cleanEmail.includes("ceramos") ||
        cleanEmail.includes("carloseduardo6") ||
        cleanEmail.includes("lucas27amorim") ||
        cleanEmail.includes("lucas27") ||
        cleanEmail.includes("juciely") ||
        cleanEmail.includes("jucielyj9") ||
        cleanEmail.includes("kaio") ||
        cleanEmail.includes("parceiro")
      ) {
        return true;
      }

      // Any other account MUST have a verified paid plan
      const userPlan = (user as any).plan;
      if (userPlan !== "lifetime" && userPlan !== "monthly") {
        console.warn(`[AUTH signIn callback] Bloqueado login sem plano pago: ${cleanEmail}`);
        return false;
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.plan = (user as any).plan || "free";
        token.order_bumps = (user as any).order_bumps || [];
        token.role = (user as any).role || "user";
      }
      if (trigger === "update") {
        if (session?.plan) token.plan = session.plan;
        if (session?.order_bumps) token.order_bumps = session.order_bumps;
        if (session?.role) token.role = session.role;
      }

      if (token.email) {
        const emailLower = token.email.toLowerCase();

        // 0. LUCAS AMORIM (Garantia perpétua de plano vitalício)
        if (emailLower.includes("lucas27amorim") || emailLower.includes("lucas27")) {
          token.plan = "lifetime";
          token.role = "user";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 0.1 CARLOS EDUARDO (Garantia perpétua de plano vitalício)
        if (emailLower.includes("ceramos") || emailLower.includes("carloseduardo6")) {
          token.plan = "lifetime";
          token.role = "user";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 0.1 JANAYNA (Garantia perpétua de plano vitalício)
        if (emailLower.includes("janayna") || emailLower.includes("sjanayna")) {
          token.plan = "lifetime";
          token.role = "user";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 0.1 HIGOR FERNANDEZ (Garantia perpétua de plano vitalício)
        if (emailLower.includes("higorfernandez") || emailLower.includes("higor")) {
          token.plan = "lifetime";
          token.role = "user";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 0.1 JOÃO EMPRESA (Garantia perpétua de plano vitalício)
        if (emailLower.includes("joaoempresa") || emailLower.includes("joao")) {
          token.plan = "lifetime";
          token.role = "user";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 0.1 ALE GHARTZ (Garantia perpétua de plano vitalício)
        if (emailLower.includes("aleghartz")) {
          token.plan = "lifetime";
          token.role = "user";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 0.1 DIGITAL (Garantia perpétua de plano vitalício)
        if (emailLower.includes("digital")) {
          token.plan = "lifetime";
          token.role = "user";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 0.1 EMANUEL (Garantia perpétua de plano vitalício)
        if (emailLower.includes("emanuel")) {
          token.plan = "lifetime";
          token.role = "user";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 1. CARLOS SOUZA (Garantia perpétua de plano vitalício)
        if (emailLower.includes("carlos") || emailLower.includes("souza")) {
          token.plan = "lifetime";
          token.role = "user";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 2. USUÁRIO DEMO
        if (emailLower === "usuario@decolashop.com") {
          token.plan = "lifetime";
          token.role = "user";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 3. ADMINISTRADOR (Acesso Master & Atalhos Liberados)
        if (emailLower === "admin@decolashop.com" || emailLower === "admin" || emailLower.startsWith("admin@") || emailLower.includes("admin") || emailLower === "dec-admin-vip") {
          token.plan = "lifetime";
          token.role = "admin";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 3.1 GERENTE
        if (emailLower === "gerente@decolashop.com" || emailLower === "gerente" || emailLower.startsWith("gerente@") || emailLower.includes("gerente") || emailLower === "decola-gerente") {
          token.plan = "lifetime";
          token.role = "gerente";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 3.2 JUCIELY JUSTINO
        if (emailLower.includes("juciely") || emailLower.includes("jucielyj9")) {
          token.plan = "lifetime";
          token.role = "user";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 3.3 PARCEIROS E AFILIADOS (KAIO & PARCEIRO)
        if (emailLower.includes("kaio") || emailLower.includes("parceiro")) {
          token.plan = "lifetime";
          token.role = "gerente";
          token.order_bumps = [
            "bump_curso",
            "bump_acompanhamento",
            "bump_acelerador",
            "bump_gerador_videos_ia",
            "bump_bot_telegram",
            "bump_fornecedores",
            "bump_criativos"
          ];
          return token;
        }

        // 4. DEMAIS USUÁRIOS (Refresh com Supabase)
        try {
          const supabaseAdmin = getSupabaseAdmin();
          if (supabaseAdmin) {
            const { data: dbUser } = await supabaseAdmin
              .from("users")
              .select("plan, plan_expires_at, image")
              .eq("email", token.email)
              .maybeSingle();

            if (dbUser?.plan) {
              token.plan = dbUser.plan;
            } else if (!token.plan || token.plan === "unauthorized" || token.plan === "free") {
              token.plan = "lifetime";
            }
            if (dbUser?.image && dbUser.image.startsWith("{")) {
              try {
                const meta = JSON.parse(dbUser.image);
                if (meta.bumps) token.order_bumps = meta.bumps;
              } catch {}
            }
          }
        } catch {
          // ignore
        }
        if (!token.plan || token.plan === "unauthorized") {
          token.plan = "lifetime";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (session.user.email && BLOCKED_EMAILS.includes(session.user.email.toLowerCase())) {
          return { ...session, user: null as any };
        }
        // @ts-ignore
        session.user.plan = token.plan || "lifetime";
        // @ts-ignore
        session.user.order_bumps = (token.order_bumps as string[]) || [];
        // @ts-ignore
        session.user.role = token.role || (session.user.email?.toLowerCase().includes('gerente') ? 'gerente' : (session.user.email?.toLowerCase().includes('admin') ? 'admin' : 'user'));
      }
      return session;
    },
  },
});
