'use client';

import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-hot-toast';

interface SuppliersViewProps {
  onNavigate?: (view: any, product?: any) => void;
}

export default function SuppliersView({ onNavigate }: SuppliersViewProps) {
  const [filter, setFilter] = useState('Todos (8)');
  const [search, setSearch] = useState('');
  const [activated, setActivated] = useState<string[]>(['sportsfull', 'innova']);

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

  const filteredSuppliers = suppliers.filter((s) => {
    const matchFilter = filter === 'Todos (8)' || 
      (filter === 'Meus Ativos' && activated.includes(s.id)) ||
      s.category.toLowerCase() === filter.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 font-sans text-slate-100 pb-16">
      {/* Hero Header Card in Cyber Neon Style */}
      <div className="bg-[#0d121f]/90 rounded-3xl p-8 md:p-12 border border-[#22c55e]/30 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center">
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#22c55e]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[#10b981]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/15 text-[#4ade80] text-[11px] font-black uppercase tracking-wider mb-3 border border-[#22c55e]/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
          <ShieldCheck size={14} className="text-[#22c55e]" />
          <span>PLATAFORMA COM FORNECEDORES HOMOLOGADOS</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-3xl leading-tight">
          Conecte-se aos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22c55e] via-[#4ade80] to-[#10b981]">Melhores Fornecedores</span> do Brasil
        </h1>

        <p className="text-xs text-slate-400 mt-3 max-w-2xl leading-relaxed">
          Catálogos oficiais auditados com estoque a pronta entrega, despacho em até 24h e integração direta para criar anúncios de alta conversão.
        </p>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 w-full max-w-3xl">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-left hover:border-[#22c55e]/40 transition-colors">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
              <Clock size={11} className="text-[#22c55e]" /> Despacho
            </span>
            <span className="text-xs font-black text-white mt-0.5 block">Em até 24 horas</span>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-left hover:border-[#22c55e]/40 transition-colors">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
              <TrendingUp size={11} className="text-[#4ade80]" /> Margens
            </span>
            <span className="text-xs font-black text-white mt-0.5 block">Até 150% lucro</span>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-left hover:border-[#22c55e]/40 transition-colors">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
              <Award size={11} className="text-[#22c55e]" /> Qualidade
            </span>
            <span className="text-xs font-black text-white mt-0.5 block">100% Auditados</span>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-left hover:border-[#22c55e]/40 transition-colors">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
              <Truck size={11} className="text-[#4ade80]" /> Canais
            </span>
            <span className="text-xs font-black text-white mt-0.5 block">Shopee & TikTok</span>
          </div>
        </div>
      </div>

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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
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

      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <span>Fornecedores Verificados</span>
          <span className="text-xs text-[#22c55e] bg-[#22c55e]/15 px-2 py-0.5 rounded-full border border-[#22c55e]/30">
            {filteredSuppliers.length} ativos
          </span>
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">
          Estoque sincronizado em tempo real via API
        </span>
      </div>

      {/* Suppliers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSuppliers.map((sup) => {
          const isAct = activated.includes(sup.id);
          return (
            <div 
              key={sup.id}
              className="bg-[#0d121f]/90 rounded-3xl p-6 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-[#22c55e]/40 transition-all group"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  {/* Square Product Image */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                    <SafeImage src={sup.mainImage} alt={sup.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30">
                        {sup.category}
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
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
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
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
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs flex items-center justify-center gap-1 transition-all shadow-lg shadow-[#22c55e]/20 active:scale-95"
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
  );
}
