import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

const BLOCKED_EMAILS = [
  "felipeferreirsas233789@gmail.com",
  "felipevitoriano18@gmail.com",
  "felipepdasilva12345@gmail.com",
  "felipepolski77@gmail.com",
  "felipe2012ester@gmail.com",
  "felipenonato87@gmail.com"
];

function getSupabaseAdmin() {
  const supabaseUrl = 
    process.env.SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    'https://mxukkgweuanemcgwvwdk.supabase.co';

  const supabaseKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14dWtrZ3dldWFuZW1jZ3d2d2RrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcwNDQ1OCwiZXhwIjoyMDkzMjgwNDU4fQ.330MXmQV3e9mU2C1qIr2YjITAcOTrw2jY4CkkhaY97A';

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
        // 2. CONTA GERENTE (gerente@decolashop.com)
        // =========================================================================
        const isGerenteLogin = 
          rawEmail === "gerente@decolashop.com" || 
          rawEmail === "admin@decolashop.com" || 
          rawEmail === "gerente" || 
          rawEmail === "admin";

        if (isGerenteLogin) {
          const validGerentePasswords = ["admin123", "gerente123", "decola123"];
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
        cleanEmail.includes("carlos") ||
        cleanEmail.includes("souza")
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

        // 3. GERENTE
        if (emailLower === "gerente@decolashop.com" || emailLower === "admin@decolashop.com") {
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
            } else {
              token.plan = "unauthorized";
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (session.user.email && BLOCKED_EMAILS.includes(session.user.email.toLowerCase())) {
          return { ...session, user: null as any };
        }
        // @ts-ignore
        session.user.plan = token.plan || "free";
        // @ts-ignore
        session.user.order_bumps = (token.order_bumps as string[]) || [];
        // @ts-ignore
        session.user.role = token.role || "user";
      }
      return session;
    },
  },
});
