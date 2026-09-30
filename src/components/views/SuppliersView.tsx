'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Search, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  ShoppingBag,
  Clock,
  TrendingUp,
  Award,
  Lock,
  Phone,
  Download,
  ExternalLink,
  Flame
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { hasOrderBump } from '@/lib/orderBumps';
import { SECRET_SUPPLIERS_50 } from '@/lib/secretSuppliers';

interface SuppliersViewProps {
  onNavigate?: (view: any, product?: any) => void;
}

export default function SuppliersView({ onNavigate }: SuppliersViewProps) {
  const { data: session } = useSession();
  const [filter, setFilter] = useState('Todos (8)');
  const [search, setSearch] = useState('');
  const [activated, setActivated] = useState<string[]>(['sportsfull', 'innova']);
  const [isUnlockedSecret, setIsUnlockedSecret] = useState(false);

  useEffect(() => {
    const checkBump = () => {
      setIsUnlockedSecret(hasOrderBump('bump_fornecedores', session));
    };
    checkBump();
    window.addEventListener('decolashop_bumps_updated', checkBump);
    return () => window.removeEventListener('decolashop_bumps_updated', checkBump);
  }, [session]);

  const openBumpModal = () => {
    window.dispatchEvent(new CustomEvent('decolashop_open_bump_modal', { 
      detail: { bumpId: 'bump_fornecedores' } 
    }));
  };

  const toggleActivate = (id: string, name: string) => {
    if (activated.includes(id)) {
      setActivated(activated.filter(i => i !== id));
      toast(`${name} desativado`);
    } else {
      setActivated([...activated, id]);
      toast.success(`🎉 ${name} ativado com sucesso! Estoque sincronizado.`);
    }
  };

  const suppliers = [
    {
      id: 'sportsfull',
      name: 'SportsFull Distribuidora Oficial - SP',
      address: 'Rua Doutor Luís da Fonseca Galvão, 231 - São Paulo - SP',
      category: 'ESPORTES',
      verified: true,
      productsCount: '+2.850 produtos',
      description: 'Maior polo de fardamentos esportivos, camisas de time dry-fit personalizáveis, artigos de treino e acessórios para futebol com envio imediato.',
      mainImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=300',
      highlights: [
        { name: 'Jogo de Camisas De Jogo 53P', image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=150' },
        { name: 'Camiseta Oversized Streetwear', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=150' },
        { name: 'Kit Uniforme Futebol Amador', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=150' },
      ],
    },
    {
      id: 'innova',
      name: 'Innova Partners Tech Hub - SP',
      address: 'Rua Barão Ladislau, 670 - Brás, São Paulo - SP',
      category: 'ELETRÔNICOS',
      verified: true,
      productsCount: '+3.840 produtos',
      description: 'Eletrônicos inteligentes, smartwatches serie 8 e 9, fones bluetooth ANC e projetores 4K de alta conversão importados com nota fiscal.',
      mainImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300',
      highlights: [
        { name: 'Mini Projetor Portátil 4K', image: 'https://images.unsplash.com/photo-1535016120720-40c646bebbdc?auto=format&fit=crop&q=80&w=150' },
        { name: 'Smartwatch Serie 8 Ultra Pro', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=150' },
        { name: 'Fone Bluetooth Pro Wireless', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=150' },
      ],
    },
    {
      id: 'lumina',
      name: 'Lumina Beauty Cosméticos & Skincare',
      address: 'Av. Paulista, 1078 - Bela Vista, São Paulo - SP',
      category: 'COSMÉTICOS',
      verified: true,
      productsCount: '+1.420 produtos',
      description: 'Linha completa de perfumes, body splash virais, escovas alisadoras e produtos de estética certificados pela ANVISA prontos para o TikTok Shop.',
      mainImage: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=300',
      highlights: [
        { name: 'Escova Alisadora 3 em 1 Ionizada', image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=150' },
        { name: 'Kit Body Splash Obsession', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=150' },
        { name: 'Sérum Facial Vitamina C Ultra', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=150' },
      ],
    },
    {
      id: 'hometech',
      name: 'HomeTech Prime Casa & Decoração',
      address: 'Rua das Flores, 450 - Mooca, São Paulo - SP',
      category: 'CASA & JARDIM',
      verified: true,
      productsCount: '+2.100 produtos',
      description: 'Painéis ripados autocolantes, fitas de LED inteligentes, organizadores e luminárias de monitor para setup gamer e home office.',
      mainImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=300',
      highlights: [
        { name: 'Kit Painel Ripado Decoração', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=150' },
        { name: 'Lâmpada Barra LED Monitor RGB', image: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=150' },
        { name: 'Umidificador Ultrassônico Flame', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=150' },
      ],
    },
  ];

  const isSecretTab = filter.includes('Lista Secreta');

  const filteredSuppliers = suppliers.filter((s) => {
    const matchFilter = filter === 'Todos (8)' || 
      (filter === 'Meus Ativos' && activated.includes(s.id)) ||
      s.category.toLowerCase() === filter.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredSecret = SECRET_SUPPLIERS_50.filter((s) => {
    return s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.region.toLowerCase().includes(search.toLowerCase()) ||
      s.specialty.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 font-sans text-slate-100 pb-16">
      {/* Hero Header Card */}
      <div className="bg-[#0d121f]/90 rounded-3xl p-6 md:p-10 border border-[#22c55e]/30 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#22c55e]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[#10b981]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] text-[11px] font-black uppercase tracking-wider mb-3 border border-[#22c55e]/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
          <ShieldCheck size={14} className="text-[#22c55e]" />
          <span>PLATAFORMA COM FORNECEDORES HOMOLOGADOS</span>
        </div>

        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight max-w-3xl leading-tight">
          Conecte-se aos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#10b981]">Melhores Fornecedores</span> do Brasil
        </h1>

        <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Catálogos auditados com estoque a pronta entrega, despacho em até 24h e integração direta para criar anúncios de alta conversão.
        </p>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-6 w-full max-w-3xl">
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
              <Clock size={11} className="text-[#22c55e]" /> Despacho
            </span>
            <span className="text-xs font-black text-white mt-0.5 block">Em até 24 horas</span>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
              <TrendingUp size={11} className="text-[#4ade80]" /> Margens
            </span>
            <span className="text-xs font-black text-white mt-0.5 block">Até 150% lucro</span>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
              <Award size={11} className="text-[#22c55e]" /> Qualidade
            </span>
            <span className="text-xs font-black text-white mt-0.5 block">100% Auditados</span>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-left">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
              <Truck size={11} className="text-[#4ade80]" /> Canais
            </span>
            <span className="text-xs font-black text-white mt-0.5 block">Shopee & TikTok</span>
          </div>
        </div>
      </div>

      {/* Exclusive Order Bump Banner if NOT unlocked */}
      {!isUnlockedSecret && (
        <div className="bg-gradient-to-r from-amber-500/15 via-[#22c55e]/15 to-amber-500/15 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Lock size={20} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
                  ORDER BUMP VIP
                </span>
                <h3 className="text-sm font-black text-white">
                  Lista Secreta: 50 Maiores Fornecedores Nacionais
                </h3>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                WhatsApp direto de importadores do Brás, Santa Ifigênia e SC com despacho 24h sem risco de taxa de alfândega.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openBumpModal}
            className="shrink-0 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-[#22c55e] text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>DESBLOQUEAR POR R$ 19,90</span>
          </button>
        </div>
      )}

      {/* Filter and Categories Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:w-72 flex-shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar fornecedor por nome, cidade..."
            className="w-full bg-[#0d121f] border border-white/10 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-[#22c55e] focus:ring-1 focus:ring-[#22c55e]/30 transition-all placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none">
          {/* Special Order Bump Tab */}
          <button
            onClick={() => setFilter('👑 Lista Secreta 50')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === '👑 Lista Secreta 50'
                ? 'bg-gradient-to-r from-amber-400 to-[#22c55e] text-black font-black shadow-lg shadow-amber-500/20'
                : isUnlockedSecret
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-white'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <span>👑 Lista Secreta 50</span>
            {isUnlockedSecret ? (
              <span className="text-[9px] bg-black/40 px-1.5 py-0.2 rounded-full font-bold">Liberada</span>
            ) : (
              <Lock size={11} className="text-amber-400" />
            )}
          </button>

          {[
            'Todos (8)',
            'Meus Ativos',
            'Esportes',
            'Eletrônicos',
            'Cosméticos',
            'Casa & Jardim',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filter === cat
                  ? 'bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-black shadow-md shadow-[#22c55e]/25 font-black'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ================= SECRET SUPPLIERS TAB ================= */}
      {isSecretTab ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>50 Maiores Fornecedores Nacionais Direto de Fábrica</span>
                <span className="text-xs text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {filteredSecret.length} disponíveis
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Contatos diretos de WhatsApp para dropshipping nacional e atacado com despacho em 24h.
              </p>
            </div>

            {isUnlockedSecret && (
              <button
                type="button"
                onClick={() => toast.success('Planilha com os 50 Fornecedores baixada com sucesso!')}
                className="py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/15 cursor-pointer"
              >
                <Download size={13} />
                <span>Exportar Planilha (Excel/CSV)</span>
              </button>
            )}
          </div>

          {!isUnlockedSecret ? (
            /* GATED LOCK VIEW FOR SECRET SUPPLIERS */
            <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-[#0d121f] p-6 sm:p-12 text-center">
              {/* Blurred background preview */}
              <div className="absolute inset-0 opacity-20 filter blur-sm pointer-events-none p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECRET_SUPPLIERS_50.slice(0, 4).map((s, idx) => (
                  <div key={idx} className="bg-black/50 p-4 rounded-xl text-left border border-white/10">
                    <div className="font-bold text-white">{s.name}</div>
                    <div className="text-xs text-slate-400">{s.region} • {s.category}</div>
                    <div className="text-xs text-[#22c55e] mt-2">WhatsApp: (11) 98421-••••</div>
                  </div>
                ))}
              </div>

              {/* Foreground Lock Message */}
              <div className="relative z-10 max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/20">
                  <Lock size={28} />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">
                    Conteúdo Exclusivo do Order Bump
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Você precisa ter adquirido o pacote <strong>Lista Secreta: 50 Maiores Fornecedores Nacionais</strong> para visualizar os contatos de WhatsApp e endereços de despacho imediato.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left text-xs space-y-1.5">
                  <div className="text-amber-300 font-black text-[11px]">O que está incluído na Lista Secreta:</div>
                  <div className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                    <Check size={12} className="text-[#22c55e]" /> WhatsApp direto de 50 donos de distribuidoras do Brás e SC
                  </div>
                  <div className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                    <Check size={12} className="text-[#22c55e]" /> Estoque físico no Brasil sem risco de taxa de importação
                  </div>
                  <div className="text-slate-300 flex items-center gap-1.5 text-[11px]">
                    <Check size={12} className="text-[#22c55e]" /> Despacho express em até 24h para seus clientes
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openBumpModal}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#22c55e] to-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>DESBLOQUEAR LISTA SECRETA POR R$ 19,90</span>
                </button>
              </div>
            </div>
          ) : (
            /* UNLOCKED FULL SECRET SUPPLIERS LIST */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSecret.map((supplier) => (
                <div 
                  key={supplier.id}
                  className="bg-[#0d121f] border border-[#22c55e]/30 hover:border-[#22c55e] rounded-2xl p-4.5 shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30">
                        {supplier.category}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <Clock size={11} /> {supplier.dispatchTime}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white group-hover:text-[#4ade80] transition-colors">
                      {supplier.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-[#22c55e]" /> {supplier.region}
                    </p>

                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                      {supplier.specialty}
                    </p>

                    <div className="mt-2 text-[10px] text-slate-400 font-semibold">
                      Mínimo: <span className="text-slate-200">{supplier.minOrder}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="text-[11px] text-[#4ade80] font-mono font-bold flex items-center gap-1">
                      <Phone size={12} /> WhatsApp Verificado
                    </div>

                    <a
                      href={`https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent('Olá! Sou membro VIP do DecolaShop e gostaria de receber a tabela de produtos para dropshipping e pronta entrega.')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-3 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-xs flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-[#22c55e]/20"
                    >
                      <span>Conversar</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* STANDARD SUPPLIERS VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <span>Fornecedores Verificados Padrão</span>
              <span className="text-xs text-[#22c55e] bg-[#22c55e]/15 px-2 py-0.5 rounded-full border border-[#22c55e]/30">
                {filteredSuppliers.length} ativos
              </span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              Estoque sincronizado em tempo real via API
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSuppliers.map((sup) => {
              const isAct = activated.includes(sup.id);
              return (
                <div
                  key={sup.id}
                  className="bg-[#0d121f] rounded-3xl p-5 border border-white/10 hover:border-[#22c55e]/50 transition-all duration-300 shadow-xl flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                        <SafeImage src={sup.mainImage} alt={sup.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-[#22c55e]/15 text-[#4ade80] text-[9px] font-black uppercase tracking-wider border border-[#22c55e]/30">
                            Verificado
                          </span>
                          <span className="text-[9px] font-bold text-slate-400">
                            {sup.productsCount}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-white truncate">{sup.name}</h3>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={11} className="text-[#22c55e]" /> {sup.address}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {sup.description}
                    </p>

                    {/* Highlights Carousel Strip */}
                    <div className="space-y-1.5 mb-6">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        DESTAQUES EM ALTA ROTAÇÃO:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {sup.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-black/40 border border-white/5 min-w-0">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-black flex-shrink-0">
                              <SafeImage src={h.image} alt={h.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 truncate">{h.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => toggleActivate(sup.id, sup.name)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                        isAct
                          ? 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/50 font-black shadow-[0_0_10px_rgba(34,197,94,0.15)]'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {isAct ? (
                        <>
                          <CheckCircle2 size={13} className="text-[#22c55e]" />
                          <span>FORNECEDOR ATIVADO</span>
                        </>
                      ) : (
                        <span>+ ATIVAR FORNECEDOR</span>
                      )}
                    </button>

                    <button
                      onClick={() => onNavigate && onNavigate('catalogo')}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs flex items-center justify-center gap-1 transition-all shadow-lg shadow-[#22c55e]/20 active:scale-95 cursor-pointer"
                    >
                      <span>Acessar Catálogo</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
