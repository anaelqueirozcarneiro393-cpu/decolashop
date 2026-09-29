'use client';

import React, { useState } from 'react';
import { Share2, CheckCircle2, RefreshCw, ExternalLink, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ConectarView() {
  const [channels, setChannels] = useState([
    {
      id: 'shopee',
      name: 'Shopee Brasil',
      type: 'Marketplace Principal',
      status: 'Conectado',
      active: true,
      lastSync: 'Há 2 minutos',
      salesTracked: 'R$ 2.290,35',
      logo: '🟠',
    },
    {
      id: 'ml',
      name: 'Mercado Livre',
      type: 'Marketplace',
      status: 'Desconectado',
      active: false,
      lastSync: '-',
      salesTracked: 'R$ 0,00',
      logo: '🟡',
    },
    {
      id: 'tiktok',
      name: 'TikTok Shop & Criadores',
      type: 'Social Commerce',
      status: 'Desconectado',
      active: false,
      lastSync: '-',
      salesTracked: 'R$ 0,00',
      logo: '⚫',
    },
    {
      id: 'nuvemshop',
      name: 'Nuvemshop / Shopify',
      type: 'E-commerce Próprio',
      status: 'Desconectado',
      active: false,
      lastSync: '-',
      salesTracked: 'R$ 0,00',
      logo: '🔵',
    },
  ]);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Estoque e vendas sincronizados com sucesso!');
    }, 1000);
  };

  const handleToggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => {
      if (c.id === id) {
        const nextActive = !c.active;
        toast.success(nextActive ? `${c.name} conectado com sucesso!` : `${c.name} desconectado`);
        return {
          ...c,
          active: nextActive,
          status: nextActive ? 'Conectado' : 'Desconectado',
          lastSync: nextActive ? 'Agora' : '-',
        };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
            <Share2 className="w-3.5 h-3.5" />
            <span>Hub de Integrações Multi-Canal</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Conexões & <span className="apex-gradient-text">Canais de Venda</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Conecte suas lojas e perfis de afiliados para sincronização automática de estoque e comissões.
          </p>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          <span>Sincronizar Estoque Agora</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {channels.map((chan) => (
          <div 
            key={chan.id} 
            className="glass rounded-3xl p-6 border border-border/50 flex flex-col justify-between hover:border-primary/40 transition-all"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{chan.logo}</span>
                  <div>
                    <h3 className="font-black text-white text-base">{chan.name}</h3>
                    <p className="text-xs text-muted-foreground">{chan.type}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  chan.active 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-white/5 text-slate-400 border-white/10'
                }`}>
                  {chan.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-3.5 rounded-2xl bg-white/5 border border-white/5 mb-6">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Última Sincronização:</span>
                  <span className="font-bold text-white">{chan.lastSync}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Vendas Rastreadas:</span>
                  <span className="font-extrabold text-emerald-400">{chan.salesTracked}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleToggleChannel(chan.id)}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all border ${
                chan.active
                  ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive hover:text-white'
                  : 'bg-primary text-black font-extrabold border-primary hover:bg-primary/90'
              }`}
            >
              {chan.active ? 'Desconectar Canal' : 'Conectar Canal'}
            </button>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl bg-secondary/30 border border-border/50 text-xs text-slate-300 flex items-center gap-3">
        <ShieldCheck size={24} className="text-primary flex-shrink-0" />
        <p>
          <strong className="text-foreground">Sincronização Segura via API Oficial:</strong> Seus dados de vendas são criptografados de ponta a ponta e as comissões são apuradas automaticamente a cada 15 minutos.
        </p>
      </div>
    </div>
  );
}
