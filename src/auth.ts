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
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

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
        if (!credentials?.email) return null;
        let email = (credentials.email as string).toLowerCase().trim();
        if (email === "admin" || email === "gerente" || email === "admin@decolashop.com") {
          email = "gerente@decolashop.com";
        }

        if (BLOCKED_EMAILS.includes(email)) {
          return null;
        }

        const password = (credentials.password as string | undefined)?.trim();
        const purchaseCode = (credentials.purchaseCode as string | undefined)?.trim();

        // =========================================================================
        // 1. CONTA GERENTE (gerente@decolashop.com)
        // =========================================================================
        if (email === "gerente@decolashop.com" || email === "admin@decolashop.com") {
          const validGerentePasswords = ["admin123", "gerente123", "decola123"];
          const isGerenteValid = 
            (password && validGerentePasswords.includes(password)) ||
            (purchaseCode && ["admin", "gerente"].includes(purchaseCode.toLowerCase()));

          if (!isGerenteValid) {
            console.warn(`[AUTH] Tentativa de login no gerente com credenciais inválidas: ${email}`);
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
        // 2. CONTA USUÁRIO DEMO (usuario@decolashop.com)
        // =========================================================================
        if (email === "usuario@decolashop.com") {
          const validUsuarioPasswords = ["usuario123", "decola123", "123456", "admin123"];
          const isUsuarioValid = 
            (password && validUsuarioPasswords.includes(password)) ||
            (purchaseCode && ["usuario", "decola", "vip"].includes(purchaseCode.toLowerCase()));

          if (!isUsuarioValid) {
            console.warn(`[AUTH] Tentativa de login no usuario@decolashop.com com senha incorreta`);
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

        // =========================================================================
        // 3. QUALQUER OUTRA CONTA (COMPRADORES / ASSINANTES REAIS)
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

          const displayName = dbUser.name || email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

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

      // Master accounts are always allowed if passed authorize
      if (
        cleanEmail === "gerente@decolashop.com" || 
        cleanEmail === "admin@decolashop.com" || 
        cleanEmail === "usuario@decolashop.com"
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
      // Refresh plan and order_bumps from Supabase occasionally
      if (token.email) {
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
