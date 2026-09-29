'use client';

import React, { useState } from 'react';
import { Play, CheckCircle2, Clock, BookOpen, Award, Sparkles, ChevronRight } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  module: string;
  completed: boolean;
  videoUrl: string;
  description: string;
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
  },
  {
    id: 2,
    title: 'Aula 02: Como Minerar Produtos Virais com Score 90+',
    duration: '14:20',
    module: 'Módulo 2: Garimpo & Análise',
    completed: true,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Entenda como interpretar o Google Trends, o Hype Score e métricas do YouTube para escolher produtos sem risco.',
  },
  {
    id: 3,
    title: 'Aula 03: Divulgação com IA - Criando Anúncios que Vendem',
    duration: '11:15',
    module: 'Módulo 3: Tráfego & IA',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Passo a passo para gerar copies persuasivas e banners profissionais usando o motor de IA do DecolaShop.',
  },
  {
    id: 4,
    title: 'Aula 04: Gerando Vídeos Virais para TikTok e Shopee Vídeos',
    duration: '16:50',
    module: 'Módulo 4: Vídeos Curtos',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Como usar roteiros magnéticos e ferramentas gratuitas de IA para criar vídeos que atingem 50k+ visualizações orgânicas.',
  },
  {
    id: 5,
    title: 'Aula 05: Sacando suas Comissões via PIX Instantâneo',
    duration: '06:10',
    module: 'Módulo 5: Financeiro',
    completed: false,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Tutorial de como cadastrar sua chave PIX no financeiro e solicitar a transferência das comissões acumuladas.',
  },
];

export default function VideoAulaView() {
  const [activeLesson, setActiveLesson] = useState<Lesson>(LESSONS[0]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Área de Membros • Formação Completa</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Vídeo Aulas & <span className="apex-gradient-text">Tutoriais Práticos</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Aprenda o método validado para faturar de 2 a 10 mil reais por mês com mineração e afiliação.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Video Player */}
        <div className="lg:col-span-8 space-y-4">
          <div className="w-full aspect-video rounded-3xl overflow-hidden bg-black/80 border border-border/50 relative shadow-2xl flex items-center justify-center">
            {/* Embedded mockup player */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent z-10 pointer-events-none" />
            <div className="text-center p-6 z-20 space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/90 text-black flex items-center justify-center mx-auto shadow-xl shadow-primary/30 cursor-pointer hover:scale-110 active:scale-95 transition-all">
                <Play size={24} fill="currentColor" className="ml-1" />
              </div>
              <h2 className="text-xl font-black text-white">{activeLesson.title}</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">{activeLesson.description}</p>
              <span className="inline-block text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Duração: {activeLesson.duration} • Qualidade Full HD 1080p
              </span>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 border border-border/50 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              {activeLesson.module}
            </span>
            <h3 className="text-lg font-black text-white">{activeLesson.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {activeLesson.description}
            </p>
          </div>
        </div>

        {/* Lesson List */}
        <div className="lg:col-span-4 glass rounded-3xl p-5 border border-border/50 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-xs font-black uppercase text-white tracking-wider">
              Aulas do Curso (5)
            </span>
            <span className="text-xs text-emerald-400 font-bold">2/5 Concluídas</span>
          </div>

          <div className="space-y-2">
            {LESSONS.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-start gap-3 group ${
                  activeLesson.id === lesson.id
                    ? 'bg-primary/15 border-primary text-white font-bold'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="pt-0.5">
                  {lesson.completed ? (
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  ) : (
                    <Play size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {lesson.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock size={10} /> {lesson.duration}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
