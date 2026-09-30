'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Send, HelpCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ReembolsoViewProps {
  onNavigate?: (view: any) => void;
}

export default function ReembolsoView({ onNavigate }: ReembolsoViewProps) {
  const [email, setEmail] = useState('nextshopsaas@gmail.com');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Informe o motivo da solicitação');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Solicitação registrada com sucesso');
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
      {onNavigate && (
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Voltar ao Painel
        </button>
      )}

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Garantia Incondicional de 7 Dias</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Central de <span className="apex-gradient-text">Garantia & Reembolso</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Sua satisfação ou seu dinheiro de volta. Processamento seguro e automático via CN Pay.
        </p>
      </div>

      <div className="glass rounded-3xl p-6 md:p-8 border border-border/50 space-y-6">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 size={48} className="text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Solicitação Recebida</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Nossa equipe financeira processará seu pedido em até 24 horas úteis. O comprovante será enviado para seu e-mail cadastrado.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Seu E-mail de Compra</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-secondary/30 border border-border/50 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Motivo do Reembolso</label>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Conte-nos o motivo para que possamos melhorar nossa plataforma..."
                className="w-full bg-secondary/30 border border-border/50 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-primary text-black font-extrabold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Enviando...' : 'Enviar Solicitação de Reembolso'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
