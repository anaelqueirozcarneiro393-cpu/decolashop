'use client';

import React, { useState } from 'react';
import { Truck, ExternalLink, MessageCircle, ShieldCheck, Star, Users, MapPin, Zap, Lock } from 'lucide-react';
import { useSession } from 'next-auth/react';
import PaywallOverlay from './PaywallOverlay';
import { cn } from '@/lib/utils';

interface Supplier {
  id: string;
  name: string;
  category: string;
  location: string;
  type: 'Dropshipping Nacional' | 'Fábrica Direta (Brás/SP)' | 'Importação Direta' | 'Atacado Nacional';
  rating: number;
  minOrder: string;
  avgShippingDays: string;
  description: string;
  link: string;
  badge?: string;
}

const SUPPLIERS: Supplier[] = [
  {
    id: '1',
    name: 'Dropi / AliExpress Local',
    category: 'Eletrônicos & Casa',
    location: 'Brasil & China com estoque local',
    type: 'Dropshipping Nacional',
    rating: 4.9,
    minOrder: '1 unidade',
    avgShippingDays: '2 a 5 dias úteis',
    description: 'Integração direta com Shopify e Nuvemshop. Estoque com rastreio Correios válido no Brasil.',
    link: 'https://dropi.com.br',
    badge: 'TOP RECOMENDADO',
  },
  {
    id: '2',
    name: 'Mega Polo & Circuito das Compras SP',
    category: 'Moda, Acessórios & Calçados',
    location: 'Brás & Pari, São Paulo - SP',
    type: 'Fábrica Direta (Brás/SP)',
    rating: 4.8,
    minOrder: '6 a 12 peças',
    avgShippingDays: 'Pronta entrega',
    description: 'Catálogo de confeccionistas diretos do Brás com preços de fábrica para revenda no Mercado Livre e Shopee.',
    link: 'https://circuitodascompras.com.br',
    badge: 'PREÇO DE FÁBRICA',
  },
  {
    id: '3',
    name: 'Wiio Brasil Logistics',
    category: 'Gadgets & Utilidades',
    location: 'Shenzhen / São Paulo HUB',
    type: 'Dropshipping Nacional',
    rating: 4.7,
    minOrder: '1 unidade',
    avgShippingDays: '7 a 12 dias',
    description: 'Agente privado de sourcing com controle de qualidade e personalização de embalagem sob demanda.',
    link: 'https://wiio.io',
  },
  {
    id: '4',
    name: 'EstoqueBR Central de Distribuição',
    category: 'Cosméticos & Saúde',
    location: 'Curitiba - PR & Barueri - SP',
    type: 'Atacado Nacional',
    rating: 4.9,
    minOrder: 'R$ 300,00',
    avgShippingDays: '1 a 3 dias úteis',
    description: 'Fornecedor homologado Anvisa de cosméticos, perfumes e suplementos com alta margem de lucro.',
    link: 'https://estoquebr.com.br',
    badge: 'HOMOLOGADO ANVISA',
  },
  {
    id: '5',
    name: 'AliExpress Direct Choice (BR Warehouses)',
    category: 'Tech, Gamer & Home',
    location: 'Galpões em Cajamar & Louveira - SP',
    type: 'Importação Direta',
    rating: 4.8,
    minOrder: '1 unidade',
    avgShippingDays: '3 a 7 dias',
    description: 'Produtos de alta rotação já nacionalizados sem taxa de importação adicional e entrega ultra-rápida.',
    link: 'https://aliexpress.com',
  },
];

const COMMUNITIES = [
  {
    title: 'Comunidade WhatsApp: Alertas de Mineração VIP',
    members: '1.240 sellers ativos',
    description: 'Receba alertas diários de produtos com pico súbito de buscas no Google e TikTok Shop.',
    link: 'https://chat.whatsapp.com/invite',
    type: 'WhatsApp VIP',
  },
  {
    title: 'Canal Telegram: Fornecedores & Lotes Promocionais',
    members: '3.890 membros',
    description: 'Avisos de saldos de estoque e parcerias com galpões de atacado em São Paulo.',
    link: 'https://t.me/decolashop_vip',
    type: 'Telegram Alertas',
  },
  {
    title: 'Networking & Mastermind Shopee Brasil',
    members: 'Top 100 lojistas',
    description: 'Troca de estratégias de tráfego pago, criativos de anúncios e validação rápida.',
    link: 'https://discord.gg',
    type: 'Discord Mastermind',
  },
];

export default function SuppliersView() {
  const { data: session } = useSession();
  // @ts-ignore
  const plan = session?.user?.plan || 'free';
  const isFree = plan === 'free';
  const [filterType, setFilterType] = useState('Todos');

  const filteredSuppliers = filterType === 'Todos'
    ? SUPPLIERS
    : SUPPLIERS.filter(s => s.type.toLowerCase().includes(filterType.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold mb-3 border border-orange-500/20">
          <Truck className="w-3.5 h-3.5" />
          <span>Diretório Exclusivo DecolaShop</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Fornecedores Verificados & <span className="apex-gradient-text">Comunidades VIP</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Conecte-se com fabricantes do Brasil e do exterior, agentes de dropshipping nacional e grupos de inteligência.
        </p>
      </div>

      <div className="relative">
        {isFree && <PaywallOverlay />}

        <div className={cn("space-y-8", isFree && "blur-[7px] pointer-events-none opacity-60 select-none")}>
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['Todos', 'Dropshipping', 'Brás', 'Atacado', 'Importação'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  filterType === cat
                    ? 'bg-primary text-black border-primary font-black shadow-lg shadow-primary/20'
                    : 'bg-secondary/30 text-muted-foreground border-border/50 hover:bg-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="glass rounded-3xl p-6 border-border/50 flex flex-col justify-between hover:border-primary/40 transition-all group">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                        {supplier.type}
                      </span>
                      <h3 className="text-lg font-black text-white mt-2 group-hover:text-primary transition-colors">
                        {supplier.name}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <MapPin size={12} className="text-slate-400" /> {supplier.location}
                      </p>
                    </div>

                    {supplier.badge && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 rounded-lg">
                        {supplier.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {supplier.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Pedido Mínimo:</span>
                      <span className="font-extrabold text-white">{supplier.minOrder}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Prazo Médio Envio:</span>
                      <span className="font-extrabold text-emerald-400">{supplier.avgShippingDays}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={supplier.link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-secondary/50 hover:bg-primary hover:text-black text-white font-bold text-xs transition-all border border-border/50 group-hover:border-primary"
                >
                  <span>Acessar Fornecedor</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>

          {/* VIP Communities Section */}
          <div className="pt-6">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-white">
              <Users className="text-primary" size={22} /> Comunidades & Grupos Oficiais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COMMUNITIES.map((comm, idx) => (
                <div key={idx} className="glass-darker p-5 rounded-2xl border border-border/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                        {comm.type}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-semibold">{comm.members}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white mb-2">{comm.title}</h4>
                    <p className="text-xs text-muted-foreground mb-4">{comm.description}</p>
                  </div>

                  <a
                    href={comm.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-black font-extrabold text-xs transition-all border border-primary/20"
                  >
                    <MessageCircle size={14} />
                    <span>Entrar no Grupo</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
