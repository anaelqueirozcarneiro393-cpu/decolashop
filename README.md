# 🚀 DecolaShop - SaaS de Inteligência de Mercado & Mineração de Produtos com IA

O **DecolaShop** (powered by **Apex Intelligence**) é uma plataforma SaaS full-stack desenvolvida para lojistas de e-commerce, afiliados e operadores de dropshipping (Shopee, Mercado Livre, Nuvemshop e Shopify) encontrarem produtos vencedores antes da concorrência e criarem anúncios de alta conversão usando Inteligência Artificial.

---

## 🌟 Funcionalidades do SaaS

1. **🔥 Minerador Live (Tendências em Tempo Real)**
   - Algoritmo que rastreia picos de demanda no Google Trends e YouTube.
   - Filtros por nicho: *Eletrônicos, Beleza, Setup Gamer, Cozinha, Casa & Decoração*.
   - **Hype Score (0 a 100)**: métrica proprietária que calcula velocidade de viralização e oportunidade.

2. **🤖 Gerador de Anúncios com Inteligência Artificial**
   - Criação instantânea de copies persuasivas focadas em conversão (AIDA e gancho direto) via **Google Gemini 2.5 Flash** com fallback automático de altíssima velocidade para **Groq (Llama 3.3 70B)**.
   - Gerador de artes e criativos para anúncios com Satori (`/api/ad-image`).

3. **📊 Calculadora de Margem & Lucro de E-commerce**
   - Simulação precisa de margem líquida, markup, ROI e taxa de plataforma (Shopee 14% + R$ 4, Mercado Livre Clássico/Premium, Amazon, Loja Própria).
   - Cálculo automático de impostos (Simples Nacional), custos de embalagem e CPA de tráfego pago.
   - Exportação de relatório de viabilidade com 1 clique.

4. **🚚 Diretório de Fornecedores Verificados & Comunidades VIP**
   - Lista curada de fornecedores diretos de fábrica (Mega Polo Brás, 25 de Março, Dropshipping Nacional com estoque no Brasil, Importação Direta AliExpress Choice).
   - Acesso a grupos VIP no WhatsApp, canais de alertas no Telegram e Mastermind.

5. **💳 Checkout Transparente CN Pay (Pix & Order Bumps)**
   - Integração direta e nativa via API CN Pay (`/api/cnpay/pix`) sem redirecionamento para checkout externo.
   - **Order Bumps irresistíveis** no modal com recálculo em tempo real (Lista de Fornecedores, Pack de Vídeos Virais, Robô Espião Telegram).
   - Geração dinâmica de QR Code Pix e Chave Copia e Cola instantâneos.
   - Webhook automático CN Pay (`/api/webhooks/cnpay`) que atualiza status no banco e libera acesso imediatamente.
   - Gating visual com efeito de desfoque elegante e modal de conversão.

6. **🔐 Autenticação Híbrida (NextAuth v5 + Supabase + 1-Clique Demo)**
   - Login com Google OAuth.
   - Login por E-mail & Senha.
   - **Acesso Rápido para Demonstração**: botões de 1 clique para testar tanto o modo VIP Completo quanto o modo Gratuito com Paywall.

---

## 🛠️ Tecnologias Utilizadas

- **Framework**: Next.js 16 (App Router com Turbopack)
- **Linguagem**: TypeScript & React 19
- **Estilização**: Tailwind CSS v4 com Glassmorphism e Dark Mode
- **Autenticação**: NextAuth.js v5 (Auth.js) com JWT e suporte Supabase
- **Banco de Dados**: Supabase (PostgreSQL)
- **IA Generativa**: Google Gemini 2.5 Flash & Groq (Llama 3.3)
- **Ícones**: Lucide React
- **Notificações**: React Hot Toast

---

## ⚡ Como Rodar Localmente

### 1. Entrar na pasta do projeto:
```bash
cd "C:\Users\Kauan\.gemini\antigravity\scratch\decolashop-saas"
```

### 2. Iniciar o servidor de desenvolvimento:
```bash
npm run dev
```

Abra no navegador em: **[http://localhost:3000](http://localhost:3000)**

### 3. Teste Imediato (Sem configurações extras):
Na tela de login, você verá a opção **"Acesso Rápido para Teste (1-Clique)"**:
- Clique em **"VIP Completo"** para navegar por todas as ferramentas, minerador e IA sem restrições.
- Clique em **"Modo Gratuito"** para vivenciar o funil de vendas e a tela de paywall da IronPay.

---

## 🔑 Variáveis de Ambiente

As chaves já estão configuradas no arquivo `.env` e `.env.local`:

```env
# Auth.js / NextAuth
AUTH_SECRET="any-secret-for-now-123"

# Supabase
SUPABASE_URL="https://...supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."
NEXT_PUBLIC_SUPABASE_URL="https://...supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# IA APIs
GEMINI_API_KEY="..."
GROQ_API_KEY="..."
```

---

## 🚢 Deploy em Produção (Vercel)

1. Suba o repositório para o GitHub ou GitLab.
2. Importe no [Vercel](https://vercel.com).
3. Adicione as variáveis de ambiente descritas acima.
4. No painel da **CN Pay** (ou IronPay), cadastre a URL do webhook apontando para:
   `https://seu-dominio.com.br/api/webhooks/cnpay`
5. Adicione no ambiente Vercel a variável `CNPAY_API_KEY` com o token gerado na sua conta CN Pay.
