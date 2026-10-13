'use client';

import React, { useState } from 'react';
import { 
  Rocket, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  ArrowRight, 
  TrendingUp, 
  Package, 
  Truck, 
  Lock, 
  Star, 
  Zap, 
  Crown, 
  HelpCircle, 
  ChevronDown, 
  Clock, 
  DollarSign, 
  ShoppingBag,
  ExternalLink,
  Bot
} from 'lucide-react';
import SigilopayCheckoutModal from '@/components/checkout/SigilopayCheckoutModal';
import { signIn } from "next-auth/react";
import { toast } from 'react-hot-toast';

export default function LandingPageView() {
  const [selectedPlanModal, setSelectedPlanModal] = useState<'monthly' | 'lifetime' | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error('Informe e-mail e senha.');
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await signIn('credentials', {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword.trim(),
        redirect: false
      });
      if (res?.error) {
        toast.error('E-mail ou senha incorretos.');
      } else {
        toast.success('Login realizado com sucesso!');
        if (typeof window !== 'undefined') {
          localStorage.setItem('decolashop_user_email', loginEmail.trim().toLowerCase());
          window.location.reload();
        }
      }
    } catch {
      toast.error('Erro de conexão ao fazer login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const featuredProducts = [
    {
      name: "Smartwatch Ultra Series 9 Tela AMOLED",
      category: "Eletrônicos",
      cost: 42.00,
      sell: 149.90,
      profit: 107.90,
      sales: "5.420 vendas/mês",
      image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=600",
      supplier: "Polo Tech - Brás, SP"
    },
    {
      name: "Fone Bluetooth Gamer TWS Baixa Latência",
      category: "Acessórios",
      cost: 24.00,
      sell: 79.90,
      profit: 55.90,
      sales: "4.310 vendas/mês",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600",
      supplier: "Innova Tech - SP"
    },
    {
      name: "Câmera de Segurança 360 Wifi Espiã Noturna",
      category: "Segurança & Casa",
      cost: 28.00,
      sell: 89.90,
      profit: 61.90,
      sales: "6.890 vendas/mês",
      image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=600",
      supplier: "Global Mega SP"
    }
  ];

  const faqs = [
    {
      q: "Preciso ter CNPJ para começar?",
      a: "Não! Mais de 85% dos nossos membros começam 100% no CPF. Você cadastra sua chave Pix para receber os lucros e pode abrir CNPJ MEI apenas quando estiver faturando alto, se quiser."
    },
    {
      q: "Preciso comprar estoque antes?",
      a: "Não! No modelo de dropshipping nacional da DecolaShop, você só paga o custo de fábrica do produto quando o cliente final já tiver comprado e pago na sua loja. Você não arrisca 1 centavo com mercadoria parada."
    },
    {
      q: "Isso é um curso?",
      a: "Não! Nós não vendemos curso de 100 aulas teóricas. A DecolaShop é uma plataforma de trabalho prática: catálogo de fábricas em SP, ferramentas de IA para gerar anúncios e automação de pedidos. Dentro do painel tem apenas um tutorial rápido de 5 minutos mostrando onde clicar."
    },
    {
      q: "Como o produto é entregue para o cliente?",
      a: "Todos os fornecedores são nacionais com galpões físicos em São Paulo. Quando a venda entra, o fornecedor parceiro embala e despacha a encomenda pelos Correios ou transportadora em 24h a 48h com código de rastreio e nota fiscal."
    },
    {
      q: "Como e quando recebo meu lucro?",
      a: "O lucro de cada venda cai no seu painel financeiro e é liquidado diretamente na sua conta bancária via Pix. Você tem total controle e transparência de cada centavo faturado."
    },
    {
      q: "E se eu não gostar da plataforma?",
      a: "Você tem 7 dias de garantia incondicional protegida por lei. Se você entrar, olhar o catálogo e achar que não é pra você, basta um clique ou mensagem para receber 100% do seu dinheiro de volta sem perguntas."
    }
  ];

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 selection:bg-[#22c55e]/30 overflow-x-hidden font-sans">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#22c55e]/10 blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[400px] bg-[#10b981]/10 blur-[160px] pointer-events-none -z-10" />

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#080c14]/80 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#22c55e]/40 shadow-lg shadow-[#22c55e]/20 bg-black flex-shrink-0">
              <img src="/images/decolashop-icon.jpg" alt="DecolaShop" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Decola<span className="text-[#22c55e]">Shop</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#4ade80] border border-[#22c55e]/20 text-[9px] font-black uppercase tracking-wider">
                Dropshipping Nacional 🇧🇷
              </span>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              Já sou Membro
            </button>
            <button
              onClick={() => setSelectedPlanModal('monthly')}
              className="px-4 sm:px-5 py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-[#22c55e]/25 hover:shadow-xl hover:shadow-[#22c55e]/35 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Começar Agora</span>
              <ArrowRight size={14} className="stroke-[3]" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="pt-10 sm:pt-16 pb-14 sm:pb-20 px-4 sm:px-6 text-center max-w-5xl mx-auto relative">
        
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-[#22c55e]/30 text-white text-xs font-semibold mb-6 shadow-sm shadow-[#22c55e]/10 animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
          <span className="text-slate-300">Estoque Nacional • Galpões em São Paulo • Pronta Entrega</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
          Venda Produtos Virais <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-white via-[#4ade80] to-[#22c55e] bg-clip-text text-transparent">
            Sem Ter Estoque em Casa
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Conecte-se direto com as maiores fábricas e importadores de SP a preço de <strong>atacado</strong>. A DecolaShop minera os produtos que vendem, cria seus anúncios com IA e o fornecedor despacha pelos Correios. <strong>Você só fica com o lucro no seu Pix.</strong>
        </p>

        {/* CTAs & Guarantee */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => setSelectedPlanModal('monthly')}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] text-black font-black text-base rounded-2xl shadow-xl shadow-[#22c55e]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>QUERO COMEÇAR AGORA</span>
            <ArrowRight size={18} className="stroke-[3]" />
          </button>
          
          <button
            onClick={() => setSelectedPlanModal('lifetime')}
            className="w-full sm:w-auto px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Crown size={16} className="text-amber-400" />
            <span>Ver Plano Vitalício VIP (Sem Mensalidade)</span>
          </button>
        </div>

        {/* Micro Trust Proofs */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-[#22c55e]" />
            <span>7 Dias de Garantia Incondicional</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={16} className="text-[#22c55e]" />
            <span>Acesso Imediato ao Painel</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check size={16} className="text-[#22c55e]" />
            <span>Pode começar 100% no CPF</span>
          </div>
        </div>
      </section>

      {/* ================= VITRINE DE PRODUTOS & MATEMÁTICA DE LUCRO ================= */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[#0d121f]/60 border-y border-white/5 relative">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#4ade80] mb-2">
              <TrendingUp size={14} />
              <span>Margem de Lucro Real</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Veja o que você vai vender na prática
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Produtos minerados com alta procura diária nas redes, prontos no estoque dos fornecedores de SP:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((p, idx) => (
              <div 
                key={idx}
                className="bg-[#111726] border border-white/10 hover:border-[#22c55e]/40 rounded-3xl p-5 shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-44 rounded-2xl overflow-hidden mb-4 bg-black/40">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/10">
                      {p.category}
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-[#22c55e]/90 text-black font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                      {p.sales}
                    </div>
                  </div>

                  {/* Title & Supplier */}
                  <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug mb-1">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-4 flex items-center gap-1">
                    <Package size={12} className="text-[#22c55e]" />
                    <span>{p.supplier}</span>
                  </p>

                  {/* Profit Breakdown */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-3.5 space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Preço no Fornecedor:</span>
                      <span className="font-bold text-slate-300">R$ {p.cost.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Preço de Venda Médio:</span>
                      <span className="font-bold text-white">R$ {p.sell.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                      <span className="text-xs font-black text-[#4ade80]">Seu Lucro Líquido:</span>
                      <span className="text-base font-black text-[#22c55e]">
                        + R$ {p.profit.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPlanModal('monthly')}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-[#22c55e] text-slate-200 hover:text-black font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Ativar este produto</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-xs text-slate-400">
              *Mais de <strong>200+ produtos validados</strong> disponíveis no catálogo completo dentro da plataforma.
            </p>
          </div>
        </div>
      </section>

      {/* ================= COMO FUNCIONA EM 3 PASSOS ================= */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#22c55e] block mb-2">
            Simples, Rápido e Descomplicado
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Como funciona a operação no dia a dia
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {/* Step 1 */}
          <div className="bg-[#111726] border border-white/10 rounded-3xl p-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/15 text-[#4ade80] flex items-center justify-center font-black text-xl mb-4 border border-[#22c55e]/30">
              1
            </div>
            <h3 className="text-lg font-black text-white mb-2">Escolha os Produtos</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Você acessa o painel da DecolaShop e escolhe quais produtos quer colocar pra rodar. Todos já vêm com fotos profissionais, descrição pronta e margem calculada.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#111726] border border-white/10 rounded-3xl p-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/15 text-[#4ade80] flex items-center justify-center font-black text-xl mb-4 border border-[#22c55e]/30">
              2
            </div>
            <h3 className="text-lg font-black text-white mb-2">Venda Automática</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Você pode vender conectando sua conta do Mercado Livre, Shopee, TikTok Shop ou direto pelo WhatsApp usando nossos roteiros e anúncios de IA.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#111726] border border-white/10 rounded-3xl p-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-[#22c55e]/15 text-[#4ade80] flex items-center justify-center font-black text-xl mb-4 border border-[#22c55e]/30">
              3
            </div>
            <h3 className="text-lg font-black text-white mb-2">O Fornecedor Envia</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quando a venda acontece, a fábrica parceira em SP empacota e despacha pro cliente final pelos Correios em 24h a 48h. Você só faz o saque do seu lucro no Pix!
            </p>
          </div>
        </div>
      </section>

      {/* ================= TABELA COMPARATIVA (CHINA vs DECOLASHOP) ================= */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[#0d121f]/80 border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Por que a DecolaShop é diferente de tudo?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Veja a diferença entre fazer dropshipping tradicional da China versus o modelo nacional:
            </p>
          </div>

          <div className="bg-[#111726] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-2 p-4 sm:p-5 bg-white/5 border-b border-white/10 text-xs sm:text-sm font-black">
              <div className="text-red-400 flex items-center gap-1.5">
                <span>❌ Drop Tradicional (China / AliExpress)</span>
              </div>
              <div className="text-[#22c55e] flex items-center gap-1.5">
                <span>✅ DecolaShop (Nacional em SP)</span>
              </div>
            </div>

            <div className="divide-y divide-white/5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 p-4">
                <span className="text-slate-400">Demora de 25 a 45 dias para chegar</span>
                <span className="text-white font-bold">Entrega rápida em 2 a 5 dias pelos Correios</span>
              </div>
              <div className="grid grid-cols-2 p-4">
                <span className="text-slate-400">Taxas e impostos surpresa na alfândega</span>
                <span className="text-white font-bold">Sem nenhuma taxa surpresa (estoque já no Brasil)</span>
              </div>
              <div className="grid grid-cols-2 p-4">
                <span className="text-slate-400">Cliente revoltado pedindo reembolso</span>
                <span className="text-white font-bold">Cliente satisfeito e com código de rastreio nacional</span>
              </div>
              <div className="grid grid-cols-2 p-4">
                <span className="text-slate-400">Você precisa pagar curso caro de R$ 1.500</span>
                <span className="text-white font-bold">Ferramenta pronta por apenas R$ 89,90</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TABELA DE PREÇOS (OFERTA) ================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-5xl mx-auto" id="planos">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-[#22c55e] block mb-2">
            Investimento Acessível
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Escolha como você quer começar
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Sem pegadinhas ou mensalidades escondidas. Acesso imediato liberado na hora via Pix.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Card Mensal */}
          <div className="bg-[#111726] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  ⚡ Plano Mensal
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  Entrada
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-white">R$ 89,90</span>
                  <span className="text-xs text-slate-400">/ mês</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Perfeito para quem quer começar com o menor valor e testar na prática.
                </p>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#22c55e]" />
                  <span>Acesso completo à plataforma por 30 dias</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#22c55e]" />
                  <span>Catálogo de fornecedores de fábrica em SP</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#22c55e]" />
                  <span>Produtos minerados com alta margem</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#22c55e]" />
                  <span>Gerador de anúncios e títulos com IA</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#22c55e]" />
                  <span>7 dias de garantia incondicional</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setSelectedPlanModal('monthly')}
              className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>ATIVAR PLANO MENSAL</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card Vitalício VIP (O Mais Popular) */}
          <div className="bg-gradient-to-b from-[#111726] to-[#0d1624] border-2 border-[#22c55e] rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative shadow-2xl shadow-[#22c55e]/15 hover:shadow-[#22c55e]/25 transition-all">
            
            {/* Badge Popular */}
            <div className="absolute -top-3.5 right-6 bg-[#22c55e] text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              👑 MAIS ESCOLHIDO • PAGUE 1 VEZ
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#4ade80] flex items-center gap-1">
                  <Crown size={14} />
                  <span>Plano Vitalício VIP</span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#22c55e]/20 text-[#22c55e]">
                  SEM MENSALIDADE
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-slate-400 line-through font-bold">R$ 297</span>
                  <span className="text-3xl sm:text-4xl font-black text-white">R$ 179,90</span>
                </div>
                <p className="text-xs text-[#4ade80] font-semibold mt-1">
                  Pagamento único. Acesso vitalício para sempre.
                </p>
              </div>

              <ul className="space-y-3 text-xs text-slate-200 mb-8">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#22c55e]" />
                  <span><strong>Acesso permanente vitalício</strong> (nunca mais paga nada)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#22c55e]" />
                  <span>Todos os fornecedores nacionais em SP</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#22c55e]" />
                  <span>Produtos minerados atualizados para sempre</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#22c55e]" />
                  <span>Integração de canais (Mercado Livre, Shopee, TikTok)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#22c55e]" />
                  <span>Todas as ferramentas e IAs presentes e futuras</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-[#22c55e]" />
                  <span>7 dias de garantia incondicional</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setSelectedPlanModal('lifetime')}
              className="w-full py-4 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 hover:shadow-xl hover:shadow-[#22c55e]/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>GARANTIR VITALÍCIO VIP</span>
              <ArrowRight size={16} className="stroke-[3]" />
            </button>
          </div>

        </div>

        {/* Banner de Garantia */}
        <div className="mt-12 bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e] flex-shrink-0">
            <ShieldCheck size={36} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white mb-1">
              Garantia Blindada de 7 Dias (Risco Zero)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O Código de Defesa do Consumidor protege a sua decisão. Se você acessar a DecolaShop, fuçar o sistema todo e por qualquer motivo achar que não é pra você, basta um clique e o seu dinheiro é estornado no Pix na hora.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Perguntas Frequentes
          </h2>
          <p className="text-xs text-slate-400">
            Tire suas dúvidas antes de dar o primeiro passo:
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, idx) => (
            <div 
              key={idx}
              className="bg-[#111726] border border-white/10 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-[#4ade80] transition-colors cursor-pointer"
              >
                <span>{f.q}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-[#22c55e]' : ''}`} 
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-200">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/5 py-10 px-4 text-center text-xs text-slate-500 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-lg overflow-hidden bg-black">
            <img src="/images/decolashop-icon.jpg" alt="DecolaShop" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-slate-300">DecolaShop Tecnologia & E-commerce</span>
        </div>
        <p className="max-w-md mx-auto text-[11px] text-slate-500">
          Plataforma de intermediação logística, inteligência de mercado e automação de dropshipping nacional. Todos os direitos reservados.
        </p>
        <div>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="text-[11px] text-slate-400 hover:text-white underline underline-offset-4 cursor-pointer"
          >
            Já tem uma conta? Clique aqui para fazer login
          </button>
        </div>
      </footer>

      {/* ================= MODAL DE LOGIN (SE O USUÁRIO JÁ FOR CADASTRADO) ================= */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-sm w-full bg-[#111726] border border-white/15 rounded-3xl p-6 relative text-white shadow-2xl">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10"
            >
              ✕
            </button>
            <h3 className="text-xl font-black text-white mb-1">Entrar na DecolaShop</h3>
            <p className="text-xs text-slate-400 mb-5">Digite seu e-mail e senha de acesso.</p>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-[#0d121f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d121f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-xs uppercase tracking-wider transition-all cursor-pointer mt-2"
              >
                {isLoggingIn ? 'Entrando...' : 'Entrar no Painel'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DE CHECKOUT TRANSPARENTE ================= */}
      <SigilopayCheckoutModal
        isOpen={!!selectedPlanModal}
        onClose={() => setSelectedPlanModal(null)}
        defaultPlan={selectedPlanModal || 'monthly'}
        onSuccess={() => {
          setSelectedPlanModal(null);
          toast.success('🎉 Pagamento confirmado! Acesso liberado!');
        }}
      />

    </div>
  );
}
