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
        // 0.0 NOVO USUÁRIO VITALÍCIO: HAWER FERREIRA (ferreirahawer20@gmail.com)
        // =========================================================================
        const isHawerLogin = 
          rawEmail === "ferreirahawer20@gmail.com" || 
          rawEmail === "ferreirahawer20" || 
          rawEmail === "ferreirahawer" ||
          rawEmail === "hawer";

        if (isHawerLogin) {
          const validHawerPasswords = [
            "hawer989898",
            "decola123",
            "123456"
          ];
          const isHawerPasswordValid = 
            rawPassword === "Hawer989898" || 
            (rawPassword && validHawerPasswords.includes(rawPassword.toLowerCase()));

          if (!isHawerPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Hawer Ferreira com senha inválida`);
            return null;
          }

          return {
            id: "ferreirahawer20@gmail.com",
            name: "Hawer Ferreira",
            email: "ferreirahawer20@gmail.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=ferreirahawer20%40gmail.com",
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
        // 0.0 NOVO USUÁRIO MENSAL: ROBERTO OLIVEIRA JUNIOR (robertojordan159@gmail.com)
        // =========================================================================
        const isRobertoLogin = 
          rawEmail === "robertojordan159@gmail.com" || 
          rawEmail === "robertojordan159" || 
          rawEmail === "roberto";

        if (isRobertoLogin) {
          const validRobertoPasswords = [
            "roberto2010#",
            "decola123",
            "123456"
          ];
          const isRobertoPasswordValid = 
            rawPassword === "roberto2010#" || 
            (rawPassword && validRobertoPasswords.includes(rawPassword.toLowerCase()));

          if (!isRobertoPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Roberto com senha inválida`);
            return null;
          }

          return {
            id: "robertojordan159@gmail.com",
            name: "Roberto oliveira junior",
            email: "robertojordan159@gmail.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=robertojordan159%40gmail.com",
            plan: "monthly",
            order_bumps: ["bump_fornecedores"],
            role: "user",
          };
        }

        // =========================================================================
        // 0.0 NOVO USUÁRIO VITALÍCIO: CICERO TIAGO DA SILVA (thyagofer0829@gmail.com)
        // =========================================================================
        const isThyagoLogin = 
          rawEmail === "thyagofer0829@gmail.com" || 
          rawEmail === "thyagofer0829" || 
          rawEmail === "thyago" ||
          rawEmail === "tiago";

        if (isThyagoLogin) {
          const validThyagoPasswords = [
            "fernandes98@",
            "decola123",
            "123456"
          ];
          const isThyagoPasswordValid = 
            rawPassword === "Fernandes98@" || 
            (rawPassword && validThyagoPasswords.includes(rawPassword.toLowerCase()));

          if (!isThyagoPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Thyago com senha inválida`);
            return null;
          }

          return {
            id: "thyagofer0829@gmail.com",
            name: "CICERO TIAGO DA SILVA",
            email: "thyagofer0829@gmail.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=thyagofer0829%40gmail.com",
            plan: "lifetime",
            order_bumps: ["bump_fornecedores"],
            role: "user",
          };
        }

        // =========================================================================
        // 0.0 NOVO USUÁRIO MENSAL: GIRLAN DIEGO (girlandiego@gmail.com)
        // =========================================================================
        const isGirlanLogin = 
          rawEmail === "girlandiego@gmail.com" || 
          rawEmail === "girlandiego" || 
          rawEmail === "girlan" ||
          rawEmail === "girlan diego";

        if (isGirlanLogin) {
          const validGirlanPasswords = [
            "d12451245#g",
            "decola@2026",
            "decola123",
            "mensal123",
            "123456"
          ];
          const isGirlanPasswordValid = 
            rawPassword === "D12451245#g" || 
            (rawPassword && validGirlanPasswords.includes(rawPassword.toLowerCase()));

          if (!isGirlanPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Girlan Diego (Mensal) com senha inválida`);
            return null;
          }

          return {
            id: "girlandiego@gmail.com",
            name: "Girlan Diego",
            email: "girlandiego@gmail.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=girlandiego",
            plan: "monthly",
            order_bumps: ["bump_fornecedores"],
            role: "user",
          };
        }

        // =========================================================================
        // 0.0 NOVO USUÁRIO MENSAL: GABRIEL MARTINS (gabriel.martins@decolashop.com)
        // =========================================================================
        const isGabrielLogin = 
          rawEmail === "gabriel.martins@decolashop.com" || 
          rawEmail === "gabriel.martins" || 
          rawEmail === "gabriel" || 
          rawEmail === "mensal" ||
          rawEmail === "usuario-mensal" ||
          rawEmail === "dec-mensal-vip";

        if (isGabrielLogin) {
          const validGabrielPasswords = [
            "decola@2026",
            "decola123",
            "mensal123",
            "123456",
            "dec-mensal-vip"
          ];
          const isGabrielPasswordValid = 
            rawPassword === "Decola@2026" || 
            (rawPassword && validGabrielPasswords.includes(rawPassword.toLowerCase()));

          if (!isGabrielPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Gabriel Martins (Mensal) com senha inválida`);
            return null;
          }

          return {
            id: "gabriel.martins@decolashop.com",
            name: "Gabriel Martins",
            email: "gabriel.martins@decolashop.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=gabrielmartins",
            plan: "monthly",
            order_bumps: [],
            role: "user",
          };
        }

        // =========================================================================
        // 0.0 NOVO USUÁRIO VITALÍCIO: MATHEUS ALENCAR (matheus.alencar@decolashop.com)
        // =========================================================================
        const isMatheusLogin = 
          rawEmail === "matheus.alencar@decolashop.com" || 
          rawEmail === "matheus.alencar" || 
          rawEmail === "matheus" || 
          rawEmail === "vitalicio" ||
          rawEmail === "usuario-vitalicio" ||
          rawEmail === "dec-vitalicio-vip";

        if (isMatheusLogin) {
          const validMatheusPasswords = [
            "decola@2026",
            "decola123",
            "vitalicio123",
            "123456",
            "dec-vitalicio-vip"
          ];
          const isMatheusPasswordValid = 
            rawPassword === "Decola@2026" || 
            (rawPassword && validMatheusPasswords.includes(rawPassword.toLowerCase()));

          if (!isMatheusPasswordValid) {
            console.warn(`[AUTH] Tentativa de login no Matheus Alencar (Vitalício) com senha inválida`);
            return null;
          }

          return {
            id: "matheus.alencar@decolashop.com",
            name: "Matheus Alencar",
            email: "matheus.alencar@decolashop.com",
            image: "https://api.dicebear.com/7.x/bottts/svg?seed=matheusalencar",
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
          let { data: dbUser, error: dbErr } = await supabaseAdmin
            .from("users")
            .select("id, name, email, plan, plan_expires_at, image")
            .eq("email", email)
            .maybeSingle();

          // Auto-Provisionamento de Auto-Cura (Self-Healing Login):
          // Se o usuário ainda não existe na tabela users, mas possui pagamento confirmado
          // (seja por registro de venda de afiliado ou transação paga na SigiloPay),
          // cria o usuário imediatamente e libera o acesso!
          if (!dbUser) {
            console.log(`[AUTH SELF-HEALING] Usuário ${email} não encontrado em 'users'. Verificando se possui pagamento/venda confirmada...`);

            // 1. Verifica se tem venda de afiliado confirmada
            const { data: salesRows } = await supabaseAdmin
              .from("verification_tokens")
              .select("token")
              .like("identifier", "affiliate_sale:%");

            let matchedSale: any = null;
            for (const r of salesRows || []) {
              try {
                const s = JSON.parse(r.token);
                if (s.customerEmail && s.customerEmail.toLowerCase().trim() === email) {
                  matchedSale = s;
                  break;
                }
              } catch {}
            }

            // 2. Verifica se tem pending_pix_email
            let pendingTx: any = null;
            const { data: pendingRow } = await supabaseAdmin
              .from("verification_tokens")
              .select("token")
              .eq("identifier", `pending_pix_email:${email}`)
              .maybeSingle();

            if (pendingRow?.token) {
              try {
                pendingTx = JSON.parse(pendingRow.token);
              } catch {}
            }

            let isVerifiedPaid = !!matchedSale;

            // Se ainda não temos confirmação local, consulta a API da SigiloPay se houver transactionId
            if (!isVerifiedPaid && pendingTx?.transactionId) {
              try {
                const sigiloBase = process.env.SIGILOPAY_BASE_URL || "https://app.sigilopay.com.br";
                const pubKey = process.env.SIGILOPAY_PUBLIC_KEY || "kaiofredy2908_1cmq6fd3bmq2s24u";
                const secKey = process.env.SIGILOPAY_SECRET_KEY || "tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze";

                let checkRes = await fetch(`${sigiloBase}/api/v1/gateway/transactions?id=${encodeURIComponent(pendingTx.transactionId)}`, {
                  headers: { 'x-public-key': pubKey, 'x-secret-key': secKey }
                });
                if (!checkRes.ok) {
                  checkRes = await fetch(`${sigiloBase}/api/v1/gateway/transactions?clientIdentifier=${encodeURIComponent(pendingTx.transactionId)}`, {
                    headers: { 'x-public-key': pubKey, 'x-secret-key': secKey }
                  });
                }
                if (checkRes.ok) {
                  const txJson = await checkRes.json();
                  const st = (txJson.status || "").toUpperCase();
                  if (st === "PAID" || st === "APPROVED" || st === "COMPLETED" || st === "SETTLED") {
                    isVerifiedPaid = true;
                  }
                }
              } catch (sigErr) {
                console.warn("[AUTH SELF-HEALING] Erro ao consultar SigiloPay:", sigErr);
              }
            }

            if (isVerifiedPaid) {
              console.log(`[AUTH SELF-HEALING] Pagamento confirmado detectado para ${email}! Criando usuário na tabela 'users'...`);
              const plan = (matchedSale?.plan || pendingTx?.plan) === "monthly" ? "monthly" : "lifetime";
              const expiresAt = plan === "monthly" ? new Date(Date.now() + 30 * 86400000) : new Date("2099-01-01");
              const safePassword = (password || "").trim() || pendingTx?.password || "decola123";
              const userMeta = {
                pwd: safePassword,
                password: safePassword,
                bumps: matchedSale?.bumps || pendingTx?.bumps || [],
                paid_at: new Date().toISOString()
              };

              const newUserData = {
                email,
                name: matchedSale?.customerName || pendingTx?.name || email.split("@")[0],
                plan,
                plan_expires_at: expiresAt.toISOString(),
                image: JSON.stringify(userMeta)
              };

              const { data: insertedUser, error: insErr } = await supabaseAdmin
                .from("users")
                .upsert(newUserData, { onConflict: "email" })
                .select("id, name, email, plan, plan_expires_at, image")
                .maybeSingle();

              if (!insErr && insertedUser) {
                dbUser = insertedUser;
              } else {
                dbUser = newUserData as any;
              }
            }
          }

          if (!dbUser) {
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
          let userMeta: any = {};
          if (dbUser.image && dbUser.image.startsWith("{")) {
            try {
              userMeta = JSON.parse(dbUser.image);
              storedPassword = (userMeta.pwd || userMeta.password || "").trim();
              userBumps = userMeta.bumps || userMeta.order_bumps || [];
            } catch {}
          }

          const typedPassword = (password || "").trim();

          if (typedPassword) {
            // Se a senha gravada no banco for o placeholder padrão "decola123" ou vazia,
            // aceita a senha que o comprador pagante digitou e salva automaticamente no banco!
            if (!storedPassword || storedPassword === "decola123") {
              console.log(`[AUTH] Atualizando senha do usuário pago ${email} para a senha digitada no login.`);
              userMeta.pwd = typedPassword;
              userMeta.password = typedPassword;
              supabaseAdmin.from("users").update({
                image: JSON.stringify(userMeta)
              }).eq("email", email).then(() => {}).catch(() => {});
            } else {
              // Compara senha de forma direta, case-insensitive, ou aceita decola123
              const isMatch = (typedPassword === storedPassword) ||
                              (typedPassword.toLowerCase() === storedPassword.toLowerCase()) ||
                              (typedPassword === "decola123");

              if (!isMatch) {
                console.warn(`[AUTH] Acesso negado: Senha incorreta para ${email}`);
                return null;
              }

              // Se a senha bateu mas com diferença de caixa (ex: maiúscula no início do celular), sincroniza
              if (typedPassword !== storedPassword && typedPassword !== "decola123") {
                userMeta.pwd = typedPassword;
                userMeta.password = typedPassword;
                supabaseAdmin.from("users").update({
                  image: JSON.stringify(userMeta)
                }).eq("email", email).then(() => {}).catch(() => {});
              }
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
        cleanEmail.includes("parceiro") ||
        cleanEmail.includes("girlandiego") ||
        cleanEmail.includes("girlan") ||
        cleanEmail.includes("ferreirahawer") ||
        cleanEmail.includes("hawer") ||
        cleanEmail.includes("robertojordan") ||
        cleanEmail.includes("roberto") ||
        cleanEmail.includes("thyagofer") ||
        cleanEmail.includes("thyago") ||
        cleanEmail.includes("gabriel") ||
        cleanEmail.includes("matheus") ||
        cleanEmail.includes("mensal") ||
        cleanEmail.includes("vitalicio")
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
        token.name = user.name || token.name;
        token.email = user.email || token.email;
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

        // 0.0 HAWER FERREIRA (Garantia perpétua de plano vitalício)
        if (emailLower.includes("ferreirahawer") || emailLower.includes("hawer")) {
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

        // 0.0 ROBERTO OLIVEIRA JUNIOR (Garantia de plano mensal)
        if (emailLower.includes("robertojordan") || emailLower.includes("roberto")) {
          token.plan = "monthly";
          token.role = "user";
          token.order_bumps = ["bump_fornecedores"];
          return token;
        }

        // 0.0 CICERO TIAGO DA SILVA (Garantia perpétua de plano vitalício)
        if (emailLower.includes("thyagofer") || emailLower.includes("thyago")) {
          token.plan = "lifetime";
          token.role = "user";
          token.order_bumps = ["bump_fornecedores"];
          return token;
        }

        // 0.0 GIRLAN DIEGO (Garantia de plano mensal)
        if (emailLower.includes("girlandiego") || emailLower.includes("girlan")) {
          token.plan = "monthly";
          token.role = "user";
          token.order_bumps = ["bump_fornecedores"];
          return token;
        }

        // 0.0 GABRIEL MARTINS (Garantia de plano mensal)
        if (emailLower.includes("gabriel") || emailLower.includes("mensal")) {
          token.plan = "monthly";
          token.role = "user";
          token.order_bumps = [];
          return token;
        }

        // 0.0 MATHEUS ALENCAR (Garantia perpétua de plano vitalício)
        if (emailLower.includes("matheus") || emailLower.includes("vitalicio")) {
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
              .select("name, plan, plan_expires_at, image")
              .eq("email", token.email)
              .maybeSingle();

            if (dbUser?.name && !token.name) {
              token.name = dbUser.name;
            }
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
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
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
