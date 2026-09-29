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
  ShoppingBag
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-hot-toast';

interface SuppliersViewProps {
  onNavigate?: (view: any, product?: any) => void;
}

export default function SuppliersView({ onNavigate }: SuppliersViewProps) {
  const [filter, setFilter] = useState('Todos (8)');
  const [search, setSearch] = useState('');
  const [activated, setActivated] = useState<string[]>(['sportsfull']);

  const toggleActivate = (id: string, name: string) => {
    if (activated.includes(id)) {
      setActivated(activated.filter(i => i !== id));
      toast.success(`${name} desativado`);
    } else {
      setActivated([...activated, id]);
      toast.success(`🎉 ${name} ativado com sucesso! Produtos sincronizados.`);
    }
  };

  const suppliers = [
    {
      id: 'sportsfull',
      name: 'SportsFull - SP',
      address: 'Rua Doutor Luís da Fonseca Galvão, 231',
      category: 'ESPORTES',
      categoryColor: 'bg-red-50 text-red-600 border-red-200',
      verified: true,
      productsCount: '+2.850 produtos',
      description: 'Fardamentos personalizados, camisas de futebol oficiais e bolas para treino e competição',
      mainImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=300',
      highlights: [
        { name: 'Jogo de Camisas De J...', image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=100' },
        { name: 'Jogo De Camisas + ca...', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=100' },
        { name: 'Camiseta Oversized', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=100' },
      ],
    },
    {
      id: 'innova',
      name: 'Innova Partners - SP',
      address: 'Rua Barão Ladislau, 670 - Brás, São Paulo - SP',
      category: 'ELETRÔNICOS',
      categoryColor: 'bg-orange-50 text-orange-600 border-orange-200',
      verified: true,
      productsCount: '+3.840 produtos',
      description: 'Eletrônicos e eletrodomésticos de ponta',
      mainImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=300',
      highlights: [
        { name: 'Fone Bluetooth TWS...', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=100' },
        { name: 'SmartWatch W9 Pro', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=100' },
        { name: 'Mouse Gamer RGB 72...', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=100' },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 font-sans text-slate-800 pb-16">
      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-white via-orange-50/20 to-orange-100/30 rounded-3xl p-8 md:p-12 border border-orange-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#ee4d2d] text-[11px] font-black uppercase tracking-wider mb-3 border border-orange-200">
          <span>PLATAFORMA COM FORNECEDORES INTEGRADOS</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight max-w-3xl leading-tight">
          Conecte-se aos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ee4d2d] to-orange-500">Melhores Fornecedores</span> do Brasil
        </h1>

        <p className="text-xs text-gray-500 mt-3 max-w-2xl leading-relaxed">
          Catálogos oficiais auditados com estoque a pronta entrega, despacho em até 24h e integração direta para criar anúncios de alta conversão.
        </p>

        {/* 4 Stats Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 w-full max-w-3xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-gray-100 text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Despacho</span>
            <span className="text-xs font-black text-gray-900">Em até 24 horas</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-gray-100 text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Margens</span>
            <span className="text-xs font-black text-gray-900">Até 150% lucro</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-gray-100 text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Qualidade</span>
            <span className="text-xs font-black text-gray-900">100% Auditados</span>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-gray-100 text-left">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Canais</span>
            <span className="text-xs font-black text-gray-900">Shopee & ML</span>
          </div>
        </div>
      </div>

      {/* Filter and Categories Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:w-64 flex-shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar fornecedor por..."
            className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]/20 focus:border-[#ee4d2d]"
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
            'Brinquedos',
            'Sazonais',
            'Utilidades',
            'Cozinha',
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === cat
                  ? 'bg-[#ee4d2d] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-gray-900">
          Fornecedores Disponíveis (8)
        </h2>
        <span className="text-[11px] text-gray-400 font-medium">
          Estoque sincronizado em tempo real
        </span>
      </div>

      {/* Suppliers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((sup) => {
          const isAct = activated.includes(sup.id);
          return (
            <div 
              key={sup.id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:border-orange-200 transition-all"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  {/* Square Product Image */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/80 flex-shrink-0">
                    <SafeImage src={sup.mainImage} alt={sup.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${sup.categoryColor}`}>
                        {sup.category}
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verificado
                      </span>
                      <span className="text-[9px] font-bold text-gray-400">
                        {sup.productsCount}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-gray-900 truncate">{sup.name}</h3>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {sup.address}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {sup.description}
                </p>

                {/* Highlights Carousel Strip */}
                <div className="space-y-1.5 mb-6">
                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    DESTAQUES EM ALTA ROTAÇÃO:
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-gray-700">
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2 flex-1 overflow-hidden">
                      {sup.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-gray-50 border border-gray-100 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-lg overflow-hidden bg-white flex-shrink-0">
                            <SafeImage src={h.image} alt={h.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] font-bold text-gray-700 truncate">{h.name}</span>
                        </div>
                      ))}
                    </div>
                    <button className="text-gray-400 hover:text-gray-700">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleActivate(sup.id, sup.name)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                    isAct
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-black'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {isAct ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>FORNECEDOR ATIVADO</span>
                    </>
                  ) : (
                    <span>+ ATIVAR FORNECEDOR</span>
                  )}
                </button>

                <button
                  onClick={() => onNavigate && onNavigate('catalogo')}
                  className="py-2.5 px-3 rounded-xl bg-[#ee4d2d] hover:bg-[#d94121] text-white font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-md shadow-orange-500/20 active:scale-95"
                >
                  <span>Acessar Catálogo ({sup.productsCount})</span>
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
