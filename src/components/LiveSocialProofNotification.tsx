'use client';

import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, ShoppingBag, ArrowUpRight, X } from 'lucide-react';

interface SocialProofEvent {
  id: string;
  name: string;
  location: string;
  action: string;
  amount: string;
  timeAgo: string;
  type: 'saque' | 'venda';
  avatarBg: string;
}

const NOTIFICATION_POOL: SocialProofEvent[] = [
  // Saques PIX
  { id: '1', name: 'Marcos S.', location: 'São Paulo - SP', action: 'acabou de sacar via PIX', amount: 'R$ 2.450,00', timeAgo: 'há 2 min', type: 'saque', avatarBg: 'from-emerald-500 to-green-600' },
  { id: '2', name: 'Juliana F.', location: 'Rio de Janeiro - RJ', action: 'solicitou saque PIX', amount: 'R$ 3.890,00', timeAgo: 'há 4 min', type: 'saque', avatarBg: 'from-cyan-500 to-blue-600' },
  { id: '3', name: 'Lucas M.', location: 'Belo Horizonte - MG', action: 'sacou via PIX instantâneo', amount: 'R$ 2.120,00', timeAgo: 'há 1 min', type: 'saque', avatarBg: 'from-purple-500 to-indigo-600' },
  { id: '4', name: 'Beatriz R.', location: 'Curitiba - PR', action: 'antecipou saldo e sacou', amount: 'R$ 4.350,00', timeAgo: 'há 7 min', type: 'saque', avatarBg: 'from-pink-500 to-rose-600' },
  { id: '5', name: 'Thiago P.', location: 'Campinas - SP', action: 'realizou saque PIX', amount: 'R$ 2.780,00', timeAgo: 'há 3 min', type: 'saque', avatarBg: 'from-amber-500 to-orange-600' },
  { id: '6', name: 'Camila D.', location: 'Brasília - DF', action: 'sacou via PIX BACEN', amount: 'R$ 3.150,00', timeAgo: 'há 5 min', type: 'saque', avatarBg: 'from-teal-500 to-emerald-600' },
  { id: '7', name: 'Rodrigo A.', location: 'Porto Alegre - RS', action: 'acabou de sacar via PIX', amount: 'R$ 2.940,00', timeAgo: 'há 2 min', type: 'saque', avatarBg: 'from-blue-500 to-indigo-600' },
  { id: '8', name: 'Fernanda G.', location: 'Goiânia - GO', action: 'transferiu para conta via PIX', amount: 'R$ 4.100,00', timeAgo: 'há 6 min', type: 'saque', avatarBg: 'from-fuchsia-500 to-pink-600' },
  { id: '9', name: 'Gabriel C.', location: 'Salvador - BA', action: 'solicitou saque PIX', amount: 'R$ 2.300,00', timeAgo: 'há 4 min', type: 'saque', avatarBg: 'from-emerald-500 to-teal-600' },
  { id: '10', name: 'Larissa V.', location: 'Florianópolis - SC', action: 'sacou via PIX instantâneo', amount: 'R$ 3.420,00', timeAgo: 'há 8 min', type: 'saque', avatarBg: 'from-violet-500 to-purple-600' },
  { id: '11', name: 'Matheus B.', location: 'Fortaleza - CE', action: 'acabou de sacar via PIX', amount: 'R$ 2.650,00', timeAgo: 'há 3 min', type: 'saque', avatarBg: 'from-amber-500 to-yellow-600' },
  { id: '12', name: 'Amanda S.', location: 'Recife - PE', action: 'antecipou saldo e sacou', amount: 'R$ 4.700,00', timeAgo: 'há 1 min', type: 'saque', avatarBg: 'from-rose-500 to-red-600' },
  { id: '13', name: 'Rafael N.', location: 'Santos - SP', action: 'sacou via PIX instantâneo', amount: 'R$ 2.250,00', timeAgo: 'há 5 min', type: 'saque', avatarBg: 'from-green-500 to-emerald-600' },
  { id: '14', name: 'Bruna T.', location: 'Ribeirão Preto - SP', action: 'acabou de sacar via PIX', amount: 'R$ 3.600,00', timeAgo: 'há 2 min', type: 'saque', avatarBg: 'from-cyan-500 to-sky-600' },
  { id: '15', name: 'Felipe K.', location: 'Manaus - AM', action: 'solicitou saque PIX', amount: 'R$ 2.890,00', timeAgo: 'há 9 min', type: 'saque', avatarBg: 'from-orange-500 to-amber-600' },
  { id: '16', name: 'Jéssica M.', location: 'Vitória - ES', action: 'transferiu via PIX', amount: 'R$ 3.950,00', timeAgo: 'há 4 min', type: 'saque', avatarBg: 'from-purple-500 to-fuchsia-600' },
  { id: '17', name: 'Diego L.', location: 'Natal - RN', action: 'acabou de sacar via PIX', amount: 'R$ 2.480,00', timeAgo: 'há 6 min', type: 'saque', avatarBg: 'from-blue-600 to-cyan-600' },
  { id: '18', name: 'Renata O.', location: 'Campo Grande - MS', action: 'antecipou saldo e sacou', amount: 'R$ 4.200,00', timeAgo: 'há 3 min', type: 'saque', avatarBg: 'from-emerald-600 to-green-500' },
  { id: '19', name: 'André W.', location: 'Joinville - SC', action: 'sacou via PIX instantâneo', amount: 'R$ 2.190,00', timeAgo: 'há 5 min', type: 'saque', avatarBg: 'from-indigo-500 to-blue-600' },
  { id: '20', name: 'Patrícia E.', location: 'São José dos Campos - SP', action: 'solicitou saque PIX', amount: 'R$ 3.730,00', timeAgo: 'há 7 min', type: 'saque', avatarBg: 'from-pink-600 to-rose-500' },
  { id: '21', name: 'Vinicius M.', location: 'Sorocaba - SP', action: 'acabou de sacar via PIX', amount: 'R$ 2.580,00', timeAgo: 'há 2 min', type: 'saque', avatarBg: 'from-teal-500 to-cyan-600' },
  { id: '22', name: 'Gabriela P.', location: 'Cuiabá - MT', action: 'sacou via PIX BACEN', amount: 'R$ 3.340,00', timeAgo: 'há 4 min', type: 'saque', avatarBg: 'from-emerald-500 to-green-600' },
  { id: '23', name: 'Carlos E.', location: 'Maceió - AL', action: 'antecipou saldo e sacou', amount: 'R$ 4.500,00', timeAgo: 'há 1 min', type: 'saque', avatarBg: 'from-amber-600 to-orange-500' },
  { id: '24', name: 'Letícia N.', location: 'Londrina - PR', action: 'solicitou saque PIX', amount: 'R$ 2.820,00', timeAgo: 'há 6 min', type: 'saque', avatarBg: 'from-violet-600 to-purple-500' },
  { id: '25', name: 'Marcelo F.', location: 'Uberlândia - MG', action: 'acabou de sacar via PIX', amount: 'R$ 3.090,00', timeAgo: 'há 3 min', type: 'saque', avatarBg: 'from-blue-500 to-teal-500' },

  // Vendas Aprovadas com Comissões
  { id: '26', name: 'Mariana C.', location: 'São Paulo - SP', action: 'Mini Câmera A9 gerou comissão', amount: '+ R$ 41,50', timeAgo: 'há 2 min', type: 'venda', avatarBg: 'from-emerald-500 to-green-500' },
  { id: '27', name: 'Bruno H.', location: 'Rio de Janeiro - RJ', action: 'Fone Bluetooth Pro gerou comissão', amount: '+ R$ 38,90', timeAgo: 'há 4 min', type: 'venda', avatarBg: 'from-cyan-500 to-blue-500' },
  { id: '28', name: 'Vanessa D.', location: 'Curitiba - PR', action: 'Smartwatch Ultra gerou comissão', amount: '+ R$ 67,20', timeAgo: 'há 1 min', type: 'venda', avatarBg: 'from-purple-500 to-pink-500' },
  { id: '29', name: 'Leonardo R.', location: 'Belo Horizonte - MG', action: 'Maquininha Dragão gerou comissão', amount: '+ R$ 29,80', timeAgo: 'há 3 min', type: 'venda', avatarBg: 'from-amber-500 to-orange-500' },
  { id: '30', name: 'Aline M.', location: 'Porto Alegre - RS', action: 'Projetor 4K gerou comissão', amount: '+ R$ 89,40', timeAgo: 'há 6 min', type: 'venda', avatarBg: 'from-rose-500 to-red-500' },
  { id: '31', name: 'Igor T.', location: 'Campinas - SP', action: 'Escova 5 em 1 gerou comissão', amount: '+ R$ 44,80', timeAgo: 'há 2 min', type: 'venda', avatarBg: 'from-emerald-500 to-teal-500' },
  { id: '32', name: 'Débora S.', location: 'Brasília - DF', action: 'Ring Light Pro gerou comissão', amount: '+ R$ 31,50', timeAgo: 'há 5 min', type: 'venda', avatarBg: 'from-indigo-500 to-purple-500' },
  { id: '33', name: 'Danilo P.', location: 'Goiânia - GO', action: 'Copo Térmico Inox gerou comissão', amount: '+ R$ 28,60', timeAgo: 'há 3 min', type: 'venda', avatarBg: 'from-teal-500 to-cyan-500' },
  { id: '34', name: 'Nathalia B.', location: 'Salvador - BA', action: 'Caixa de Som RGB gerou comissão', amount: '+ R$ 46,20', timeAgo: 'há 4 min', type: 'venda', avatarBg: 'from-fuchsia-500 to-pink-500' },
  { id: '35', name: 'Eduardo G.', location: 'Recife - PE', action: 'Câmera Veicular gerou comissão', amount: '+ R$ 52,80', timeAgo: 'há 7 min', type: 'venda', avatarBg: 'from-blue-500 to-indigo-500' },
  { id: '36', name: 'Bianca L.', location: 'Florianópolis - SC', action: 'Robô Aspirador gerou comissão', amount: '+ R$ 74,10', timeAgo: 'há 2 min', type: 'venda', avatarBg: 'from-emerald-500 to-green-600' },
  { id: '37', name: 'Renan C.', location: 'Fortaleza - CE', action: 'Microfone Lapela gerou comissão', amount: '+ R$ 33,60', timeAgo: 'há 5 min', type: 'venda', avatarBg: 'from-cyan-500 to-teal-600' },
  { id: '38', name: 'Flávia M.', location: 'Santos - SP', action: 'Suporte Celular Veicular comissão', amount: '+ R$ 22,40', timeAgo: 'há 3 min', type: 'venda', avatarBg: 'from-purple-600 to-pink-500' },
  { id: '39', name: 'Guilherme S.', location: 'Manaus - AM', action: 'Mini Teclado RGB gerou comissão', amount: '+ R$ 26,70', timeAgo: 'há 4 min', type: 'venda', avatarBg: 'from-amber-500 to-orange-600' },
  { id: '40', name: 'Carolina F.', location: 'Vitória - ES', action: 'Ring Light com Tripé comissão', amount: '+ R$ 35,90', timeAgo: 'há 6 min', type: 'venda', avatarBg: 'from-rose-500 to-pink-600' },
  { id: '41', name: 'Samuel B.', location: 'Caxias do Sul - RS', action: 'Lâmpada Caixa de Som comissão', amount: '+ R$ 39,20', timeAgo: 'há 1 min', type: 'venda', avatarBg: 'from-teal-500 to-emerald-600' },
  { id: '42', name: 'Isabela K.', location: 'Maringá - PR', action: 'Dispensador Automático comissão', amount: '+ R$ 27,50', timeAgo: 'há 4 min', type: 'venda', avatarBg: 'from-indigo-600 to-violet-500' },
  { id: '43', name: 'Lucas O.', location: 'Piracicaba - SP', action: 'Umidificador Ultrassônico comissão', amount: '+ R$ 34,80', timeAgo: 'há 2 min', type: 'venda', avatarBg: 'from-blue-600 to-cyan-500' },
  { id: '44', name: 'Daniela X.', location: 'Juiz de Fora - MG', action: 'Kit Pincéis Maquiagem comissão', amount: '+ R$ 31,90', timeAgo: 'há 5 min', type: 'venda', avatarBg: 'from-fuchsia-600 to-rose-500' },
  { id: '45', name: 'Murilo C.', location: 'Vila Velha - ES', action: 'Massageador Portátil comissão', amount: '+ R$ 42,30', timeAgo: 'há 3 min', type: 'venda', avatarBg: 'from-emerald-500 to-teal-500' },
];

export default function LiveSocialProofNotification() {
  const [currentEvent, setCurrentEvent] = useState<SocialProofEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let hideTimer: NodeJS.Timeout;
    let nextTimer: NodeJS.Timeout;

    const showNotification = () => {
      // Pick random event from pool
      const randomEvent = NOTIFICATION_POOL[Math.floor(Math.random() * NOTIFICATION_POOL.length)];
      setCurrentEvent(randomEvent);
      setIsVisible(true);

      // Hide after 6.5 seconds
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 6500);

      // Schedule next notification between 3 and 20 minutes (180s to 1200s)
      const randomIntervalSeconds = Math.floor(Math.random() * (1200 - 180 + 1)) + 180;
      nextTimer = setTimeout(showNotification, randomIntervalSeconds * 1000);
    };

    // First appearance after 15 seconds so the user can immediately preview it!
    const initialDelay = setTimeout(showNotification, 15000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, []);

  if (!currentEvent || !isVisible) return null;

  const isSaque = currentEvent.type === 'saque';

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
    >
      <div className="relative flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#0c111e]/95 border border-[#22c55e]/40 shadow-2xl shadow-[#22c55e]/20 backdrop-blur-2xl text-white">
        {/* Pulsing Avatar */}
        <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${currentEvent.avatarBg} flex items-center justify-center font-black text-xs text-white shadow-md shrink-0`}>
          <span>{currentEvent.name.slice(0, 2).toUpperCase()}</span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-[#0c111e] animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-[#0c111e]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="font-extrabold text-slate-200 truncate">{currentEvent.name}</span>
            <span>•</span>
            <span className="truncate">{currentEvent.location}</span>
          </div>

          <div className="text-xs font-bold text-white mt-0.5 leading-tight">
            <span>{currentEvent.action}: </span>
            <span className={isSaque ? "font-black text-[#4ade80]" : "font-black text-[#22c55e]"}>
              {currentEvent.amount}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${
              isSaque 
                ? 'bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30' 
                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
            }`}>
              {isSaque ? 'PIX Aprovado ⚡' : 'Comissão Recebida 💰'}
            </span>
            <span className="text-[9px] text-slate-400 font-medium">
              {currentEvent.timeAgo}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2.5 right-2.5 text-slate-500 hover:text-slate-200 transition-colors p-1"
          aria-label="Fechar notificação"
        >
          <X size={13} />
        </button>
      </div>
    </aside>
  );
}
