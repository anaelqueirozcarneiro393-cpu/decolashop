'use client';

import React, { useState, useEffect } from 'react';
import { Users, Loader2, ExternalLink, X } from 'lucide-react';

const initialGroups = [
  { name: "Shopee Brasil - Divulgue GRÁTIS", link: "https://www.facebook.com/groups/shopeebrasildivulgagratis/", desc: "Focado em divulgação gratuita de lojas e produtos Shopee." },
  { name: "Shopee Compradores e Vendedores Brasil", link: "https://www.facebook.com/groups/305406794104892/", desc: "Para compradores e vendedores — permite divulgar lojas e produtos." },
  { name: "Shopee BR (Promoções Online Oficial)", link: "https://www.facebook.com/groups/promocoesonlineoficial/", desc: "Troca de informações, ofertas, cupons e divulgação de lojas." },
  { name: "Afiliados Shopee Brasil", link: "https://www.facebook.com/groups/886879675616920/", desc: "Focado em afiliados para ajuda mútua e estratégias." },
  { name: "SHOPEE LOVERS", link: "https://www.facebook.com/groups/3793850497562212/", desc: "Para afiliados e compradores apaixonados pela Shopee — bom para divulgar achados." },
  { name: "Vendedores Shopee Brasil", link: "https://www.facebook.com/groups/Vendedores.Shopee/", desc: "Exclusivo para vendedores (verifique regras sobre anúncios)." },
  { name: "[OFICIAL] Grupo de Vendedores Shopee Brasil", link: "https://www.facebook.com/groups/vendedorshopeeoficial/", desc: "Espaço para vendedores cadastrados trocarem informações." },
  { name: "Vende Fácil Shopee", link: "https://gruposwhats.app/group/861054", desc: "Grupo de links para divulgação (busque nome atualizado)." }
];

export default function FindGroupsButton({ className, productName }: { className?: string; productName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [groups, setGroups] = useState(initialGroups);

  const shuffleArray = (array: any[]) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsLoading(true);
    
    // Simulate finding groups for 5 seconds
    setTimeout(() => {
      setGroups(shuffleArray(initialGroups));
      setIsLoading(false);
    }, 5000);
  };

  return (
    <>
      <button 
        onClick={handleOpen}
        className={`flex-1 px-4 py-3 bg-[#1877F2]/20 text-[#1877F2] hover:bg-[#1877F2]/30 border border-[#1877F2]/30 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${className || ''}`}
      >
        <Users size={18} />
        Achar Grupos
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0d121f] border border-white/10 w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
                <Users className="text-[#1877F2]" size={18} />
                Grupos de Divulgação
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 size={48} className="text-[#1877F2] animate-spin" />
                  <h4 className="text-xl font-bold animate-pulse text-foreground">Achando grupos...</h4>
                  <p className="text-muted-foreground text-sm text-center max-w-sm">
                    Estamos rastreando as melhores comunidades do Facebook e WhatsApp para o seu produto.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <p className="text-sm text-muted-foreground mb-4">
                    Encontramos <strong className="text-foreground">{groups.length} grupos</strong> de alta conversão para você divulgar este produto agora:
                  </p>
                  
                  {groups.map((group, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-secondary/20 border border-border/30 hover:border-[#1877F2]/50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-bold text-[#1877F2] flex items-center gap-2">
                          {group.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {group.desc}
                        </p>
                      </div>
                      <a 
                        href={group.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#1877F2] hover:bg-[#1877F2]/80 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        Entrar no Grupo <ExternalLink size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
