'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Award, 
  Sparkles, 
  ChevronRight, 
  Lock, 
  GraduationCap, 
  Flame 
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { hasOrderBump } from '@/lib/orderBumps';
import { toast } from 'react-hot-toast';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  module: string;
  completed: boolean;
  videoUrl: string;
  description: string;
  isFree?: boolean;
}

const LESSONS: Lesson[] = [
  {
    id: 1,
    title: 'Aula 01: Primeiros Passos e Conexão de Canais',
    duration: '08:45',
    module: 'Módulo 1: Onboarding Rápido',
    completed: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Aprenda a conectar sua conta da Shopee e verificar se o estoque e as vendas estão sincronizados.',
    isFree: true,
  },
  {
    id: 2,
    title: 'Aula 02: Como Minerar Produtos Virais com Score 90+',
    duration: '14:20',
    module: 'Módulo 1: Onboarding Rápido',
    completed: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Entenda como interpretar o Google Trends, o Hype Score e métricas do YouTube para escolher produtos sem risco.',
    isFree: true,
  },
  {
    id: 3,
    title: 'Aula 03: Divulgação com IA - Criando Anúncios que Vendem',
    duration: '11:15',
    module: 'Módulo 2: Tráfego & IA',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Passo a passo para gerar copies persuasivas e banners profissionais usando o motor de IA do DecolaShop.',
  },
  {
    id: 4,
    title: 'Aula 04: Gerando Vídeos Virais para TikTok e Shopee Vídeos',
    duration: '16:50',
    module: 'Módulo 2: Tráfego & IA',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Como usar roteiros magnéticos e ferramentas gratuitas de IA para criar vídeos que atingem 50k+ visualizações orgânicas.',
  },
  {
    id: 5,
    title: 'Aula 05: Sacando suas Comissões via PIX Instantâneo',
    duration: '06:10',
    module: 'Módulo 3: Financeiro & Escala',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Tutorial de como cadastrar sua chave PIX no financeiro e solicitar a transferência das comissões acumuladas.',
  },
  {
    id: 6,
    title: 'Aula 06: Escolhendo Fornecedores Homologados com Envio 24h',
    duration: '12:30',
    module: 'Módulo 3: Fornecedores & Logística',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Como selecionar distribuidores de alta confiabilidade no Brás e São Paulo para entrega imediata sem atrasos.',
  },
  {
    id: 7,
    title: 'Aula 07: Estratégia de Precificação & Margem de Lucro Real',
    duration: '15:40',
    module: 'Módulo 3: Financeiro & Escala',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Fórmula exata para calcular taxas da plataforma, custos de frete e garantir margem líquida acima de 40%.',
  },
  {
    id: 8,
    title: 'Aula 08: Criando Ofertas Irresistíveis no Mercado Livre',
    duration: '18:10',
    module: 'Módulo 4: Canais de Venda',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Técnicas de título SEO, reputação rápida e posicionamento orgânico na primeira página do Mercado Livre.',
  },
  {
    id: 9,
    title: 'Aula 09: Copywriting de Alta Conversão para Achadinhos',
    duration: '13:25',
    module: 'Módulo 4: Canais de Venda',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Gatilhos mentais de escassez e novidade que forçam o cliente a comprar por impulso no primeiro clique.',
  },
  {
    id: 10,
    title: 'Aula 10: Roteirização de Vídeos Curtos Hipnóticos',
    duration: '17:05',
    module: 'Módulo 5: Conteúdo Viral',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Estrutura dos 3 primeiros segundos (Gancho) para reter 80% do público e estourar o algoritmo do Reels e TikTok.',
  },
  {
    id: 11,
    title: 'Aula 11: Dominando Tráfego Pago no Meta Ads para Iniciantes',
    duration: '22:15',
    module: 'Módulo 6: Tráfego Pago',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Como subir sua primeira campanha de conversão no Facebook/Instagram Ads investindo apenas R$ 10 por dia.',
  },
  {
    id: 12,
    title: 'Aula 12: Anúncios no TikTok Ads com Baixo Orçamento',
    duration: '19:40',
    module: 'Módulo 6: Tráfego Pago',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Estratégias específicas para o algoritmo de lances do TikTok Ads focado em compras diretas.',
  },
  {
    id: 13,
    title: 'Aula 13: Estratégia de Remarketing e Recuperação de Vendas',
    duration: '14:50',
    module: 'Módulo 6: Tráfego Pago',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Como reimpactar clientes que visitaram o produto mas não concluíram o pedido com desconto exclusivo.',
  },
  {
    id: 14,
    title: 'Aula 14: Como Escalar de 10 para 100 Vendas por Dia',
    duration: '21:00',
    module: 'Módulo 7: Escala Avançada',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Checklist para multiplicar o faturamento sem perder margem nem ter problemas operacionais.',
  },
  {
    id: 15,
    title: 'Aula 15: Otimização de Catálogo e Teste A/B de Imagens',
    duration: '12:15',
    module: 'Módulo 7: Escala Avançada',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Como testar 3 fotos de capa diferentes e descobrir qual aumenta seu CTR em até 300%.',
  },
  {
    id: 16,
    title: 'Aula 16: Automação de Atendimento e Pós-Venda',
    duration: '16:30',
    module: 'Módulo 8: Operações',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Respostas automáticas para dúvidas frequentes que liberam seu tempo e aumentam avaliações 5 estrelas.',
  },
  {
    id: 17,
    title: 'Aula 17: Gestão Financeira, DRE e Fluxo de Caixa no E-commerce',
    duration: '18:50',
    module: 'Módulo 8: Operações',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Planilha prática de conciliação para acompanhar custos, comissões e lucro líquido com precisão cirúrgica.',
  },
  {
    id: 18,
    title: 'Aula 18: Como Lidar com Devoluções e Reembolsos Sem Prejuízo',
    duration: '11:45',
    module: 'Módulo 9: Blindagem & Suporte',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Fluxo oficial de garantia da plataforma para não perder mercadoria e proteger sua reputação.',
  },
  {
    id: 19,
    title: 'Aula 19: Estratégia dos Top 1% de Vendedores da DecolaShop',
    duration: '25:10',
    module: 'Módulo 9: Blindagem & Suporte',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Estudo de caso detalhado dos alunos que faturam mais de R$ 30.000 mensais com a ferramenta.',
  },
  {
    id: 20,
    title: 'Aula 20: Plano de Ação dos Próximos 90 Dias',
    duration: '20:00',
    module: 'Módulo 10: Conclusão & Certificado',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Roteiro diário com rotina de 30 minutos por dia para consolidar sua operação lucrativa e recorrente.',
  },
];

export default function VideoAulaView() {
  const { data: session } = useSession();
  const [activeLesson, setActiveLesson] = useState<Lesson>(LESSONS[0]);
  const [isUnlockedCourse, setIsUnlockedCourse] = useState(false);

  useEffect(() => {
    const checkBump = () => {
      setIsUnlockedCourse(hasOrderBump('bump_curso', session));
    };
    checkBump();
    window.addEventListener('decolashop_bumps_updated', checkBump);
    return () => window.removeEventListener('decolashop_bumps_updated', checkBump);
  }, [session]);

  const openCourseBumpModal = () => {
    window.dispatchEvent(new CustomEvent('decolashop_open_bump_modal', { 
      detail: { bumpId: 'bump_curso' } 
    }));
  };

  const handleSelectLesson = (lesson: Lesson) => {
    const isLocked = !isUnlockedCourse && !lesson.isFree;
    if (isLocked) {
      toast('🔒 Esta aula faz parte do Curso Completo (20 aulas). Desbloqueie agora!', {
        icon: '🎓',
      });
      openCourseBumpModal();
      return;
    }
    setActiveLesson(lesson);
  };

  const isCurrentLocked = !isUnlockedCourse && !activeLesson.isFree;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/10 text-[#4ade80] text-xs font-bold mb-3 border border-[#22c55e]/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Área de Membros • Formação Completa 20 Aulas</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-white">
            Vídeo Aulas & <span className="apex-gradient-text">Curso Completo</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Aprenda o método validado para faturar de 2 a 10 mil reais por mês com a ferramenta DecolaShop.
          </p>
        </div>

        {!isUnlockedCourse && (
          <button
            type="button"
            onClick={openCourseBumpModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <GraduationCap size={16} />
            <span>Desbloquear 20 Aulas (R$ 29,90)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Video Player */}
        <div className="lg:col-span-8 space-y-4">
          <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black/80 border border-white/10 relative shadow-2xl flex items-center justify-center">
            {isCurrentLocked ? (
              <div className="text-center p-6 z-20 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                  <Lock size={26} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Conteúdo Exclusivo do Order Bump
                  </span>
                  <h2 className="text-xl font-black text-white mt-2">{activeLesson.title}</h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Esta aula é liberada exclusivamente com o pacote <b>Curso Completo</b> (20 aulas passo a passo para dominar a ferramenta).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCourseBumpModal}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#4ade80] hover:to-[#22c55e] text-black font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-[#22c55e]/25 transition-all cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Desbloquear Curso Completo por R$ 29,90</span>
                </button>
              </div>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d121f] via-transparent to-transparent z-10 pointer-events-none" />
                <div className="text-center p-6 z-20 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#22c55e] text-black flex items-center justify-center mx-auto shadow-xl shadow-[#22c55e]/30 cursor-pointer hover:scale-110 active:scale-95 transition-all">
                    <Play size={24} fill="currentColor" className="ml-1" />
                  </div>
                  <h2 className="text-xl font-black text-white">{activeLesson.title}</h2>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">{activeLesson.description}</p>
                  <span className="inline-block text-[11px] text-[#4ade80] font-bold bg-[#22c55e]/10 px-3 py-1 rounded-full border border-[#22c55e]/20">
                    Duração: {activeLesson.duration} • Qualidade Full HD 1080p
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="bg-white/[0.02] rounded-3xl p-6 border border-white/10 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#4ade80]">
              {activeLesson.module}
            </span>
            <h3 className="text-lg font-black text-white">{activeLesson.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {activeLesson.description}
            </p>
          </div>
        </div>

        {/* Lesson List */}
        <div className="lg:col-span-4 bg-white/[0.02] rounded-3xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <span className="text-xs font-black uppercase text-white tracking-wider block">
                Grade do Curso ({LESSONS.length} Aulas)
              </span>
              <span className="text-[10px] text-slate-400">
                {isUnlockedCourse ? '✅ Curso Completo Ativado' : 'Aulas 1 e 2 gratuitas'}
              </span>
            </div>
            <span className="text-xs text-[#4ade80] font-bold">
              {isUnlockedCourse ? '20/20 Acessíveis' : '2/20 Liberadas'}
            </span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1 scrollbar-none">
            {LESSONS.map((lesson) => {
              const isLocked = !isUnlockedCourse && !lesson.isFree;
              const isSelected = activeLesson.id === lesson.id;

              return (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={`w-full p-3 rounded-2xl text-left border transition-all flex items-start gap-3 group cursor-pointer ${
                    isSelected
                      ? 'bg-[#22c55e]/15 border-[#22c55e] text-white font-bold'
                      : isLocked
                      ? 'bg-white/[0.01] border-white/5 text-slate-400 hover:border-amber-500/30'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    {isLocked ? (
                      <Lock size={15} className="text-amber-400" />
                    ) : lesson.completed ? (
                      <CheckCircle2 size={16} className="text-[#4ade80]" />
                    ) : (
                      <Play size={16} className="text-slate-400 group-hover:text-[#4ade80] transition-colors" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold line-clamp-2 leading-snug transition-colors ${
                      isLocked ? 'text-slate-400 group-hover:text-amber-300' : 'group-hover:text-[#4ade80]'
                    }`}>
                      {lesson.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={10} /> {lesson.duration}
                      </span>
                      {isLocked && (
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                          Order Bump
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
