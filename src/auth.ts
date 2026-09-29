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
        if (email === "admin") {
          email = "admin@decolashop.com";
        }

        if (BLOCKED_EMAILS.includes(email)) {
          return null;
        }

        const password = credentials.password as string | undefined;
        const purchaseCode = (credentials.purchaseCode as string | undefined)?.trim();

        // Explicit Admin check
        const isAdmin = 
          email === "admin@decolashop.com" || 
          email === "admin@newshop.com" || 
          email.includes("admin") ||
          purchaseCode?.toLowerCase() === "admin" ||
          purchaseCode?.toLowerCase() === "vip" ||
          password === "admin123";

        // Support demo plan or determination
        const requestedPlan = credentials.demoPlan as string | undefined;
        let userPlan = requestedPlan || (isAdmin || email.includes("vip") || email.includes("pro") || !!purchaseCode ? "yearly" : "free");

        // Try checking in Supabase next_auth.users table
        try {
          const supabaseAdmin = getSupabaseAdmin();
          if (supabaseAdmin) {
            const { data: dbUser } = await supabaseAdmin
              .from("users")
              .select("plan, plan_expires_at, name")
              .eq("email", email)
              .single();

            if (dbUser?.plan) {
              userPlan = dbUser.plan;
            }
          }
        } catch {
          // Continue with default plan if DB check is not reachable
        }

        const displayName = isAdmin 
          ? "Administrador DecolaShop"
          : email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        return {
          id: email,
          name: displayName,
          email: email,
          image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          plan: userPlan,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user }) {
      if (user.email && BLOCKED_EMAILS.includes(user.email.toLowerCase())) {
        return false;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.plan = (user as any).plan || "free";
      }
      if (trigger === "update" && session?.plan) {
        token.plan = session.plan;
      }
      // Refresh plan from Supabase occasionally
      if (token.email) {
        try {
          const supabaseAdmin = getSupabaseAdmin();
          if (supabaseAdmin) {
            const { data: dbUser } = await supabaseAdmin
              .from("users")
              .select("plan")
              .eq("email", token.email)
              .single();
            if (dbUser?.plan) {
              token.plan = dbUser.plan;
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
      }
      return session;
    },
  },
});
