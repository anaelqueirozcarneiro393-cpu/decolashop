'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw, 
  Zap, 
  CreditCard, 
  Server, 
  ArrowRight,
  Flame,
  Radio,
  ExternalLink,
  Lock,
  Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { GatewayType, GatewaySystemConfig } from '@/lib/gatewayConfig';

interface GatewaySwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GATEWAY_CARDS = [
  {
    id: 'sigilopay' as GatewayType,
    name: 'SigiloPay',
    subtitle: 'Gateway Primário Atual',
    badge: 'Atual',
    badgeColor: 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/30',
    icon: Zap,
    description: 'Gateway nativo oficial com split automático de comissões, afiliados e taxas de antecipação.',
    features: ['Split de Afiliados', 'Webhook Instantâneo', 'Taxas de Saque'],
  },
  {
    id: 'cnpay' as GatewayType,
    name: 'CNpay',
    subtitle: 'Gateway Oficial Homologado',
    badge: 'API v1 Ativa',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    icon: CreditCard,
    description: 'Processadora oficial CN Pay (v1) via PIX com liquidação rápida, conciliação e webhooks.',
    features: ['Pix Imediato', 'API v1 Homologada', 'Docs Oficiais'],
  },
  {
    id: 'vpay' as GatewayType,
    name: 'Vpay',
    subtitle: 'Gateway Oficial Homologado',
    badge: 'API v1 Ativa',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: Server,
    description: 'Processadora oficial VPay via PIX com autenticação Bearer token, liquidação e saldo online.',
    features: ['Pix Imediato', 'Token Bearer', 'Saldo D+0'],
  },
];

export default function GatewaySwitcherModal({ isOpen, onClose }: GatewaySwitcherModalProps) {
  const { data: session } = useSession();
  const rawEmail = session?.user?.email || (typeof window !== 'undefined' ? localStorage.getItem('decolashop_user_email') || '' : '');
  const userEmail = rawEmail.toLowerCase().trim();
  const userRole = (((session?.user as any)?.role) || (typeof window !== 'undefined' ? localStorage.getItem('decolashop_user_role') || '' : '')).toLowerCase();

  const isGerenteOrAdmin = 
    userEmail === 'gerente@decolashop.com' ||
    userEmail === 'admin@decolashop.com' ||
    userEmail.startsWith('gerente@') ||
    userEmail.startsWith('admin@') ||
    userEmail.includes('gerente') ||
    userEmail.includes('admin') ||
    userRole === 'gerente' ||
    userRole === 'admin';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testingGateway, setTestingGateway] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [key: string]: { success: boolean; message: string } }>({});

  const [config, setConfig] = useState<GatewaySystemConfig | null>(null);
  const [selectedActive, setSelectedActive] = useState<GatewayType>('sigilopay');
  const [smartFailover, setSmartFailover] = useState(true);
  const [fallbackGateway, setFallbackGateway] = useState<GatewayType>('cnpay');

  // Credenciais SigiloPay
  const [sigiloPub, setSigiloPub] = useState('');
  const [sigiloSec, setSigiloSec] = useState('');
  const [sigiloUrl, setSigiloUrl] = useState('https://app.sigilopay.com.br');

  // Credenciais CNpay (https://painel.appcnpay.com/docs/v1)
  const [cnpayKey, setCnpayKey] = useState('iamironman2001m_fo5jmrxbcscjli5u');
  const [cnpaySec, setCnpaySec] = useState('wucvyumqql79c74kl08a94ezjeep8bbkg3a81ti3je2girowkxdvqby6czfz0j6n');
  const [cnpayUrl, setCnpayUrl] = useState('https://painel.appcnpay.com/api/v1');

  // Credenciais Vpay (https://vpay-api.onrender.com/api)
  const [vpayId, setVpayId] = useState('vp_82c63bcb1e4e93243ea6643fcd7a4c90');
  const [vpaySec, setVpaySec] = useState('15f4a8308c85551bcdd6d4ff5f0a6b5aad58bf090b06d633902980ad18e733a2');
  const [vpayUrl, setVpayUrl] = useState('https://vpay-api.onrender.com/api');

  // Carrega configuração salva
  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/gerente/gateway-config?email=${encodeURIComponent(userEmail || 'gerente@decolashop.com')}`);
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setSelectedActive(data.config.activeGateway || 'sigilopay');
        setSmartFailover(Boolean(data.config.smartFailover));
        setFallbackGateway(data.config.fallbackGateway || 'cnpay');

        // SigiloPay
        setSigiloPub(data.config.gateways?.sigilopay?.publicKey || '');
        setSigiloSec(data.config.gateways?.sigilopay?.secretKey || '');
        setSigiloUrl(data.config.gateways?.sigilopay?.baseUrl || 'https://app.sigilopay.com.br');

        // CNpay
        setCnpayKey(data.config.gateways?.cnpay?.publicKey || data.config.gateways?.cnpay?.apiKey || 'iamironman2001m_fo5jmrxbcscjli5u');
        setCnpaySec(data.config.gateways?.cnpay?.secretKey || 'wucvyumqql79c74kl08a94ezjeep8bbkg3a81ti3je2girowkxdvqby6czfz0j6n');
        setCnpayUrl(data.config.gateways?.cnpay?.baseUrl || 'https://painel.appcnpay.com/api/v1');

        // Vpay
        setVpayId(data.config.gateways?.vpay?.apiKey || data.config.gateways?.vpay?.clientId || 'vp_82c63bcb1e4e93243ea6643fcd7a4c90');
        setVpaySec(data.config.gateways?.vpay?.apiSecret || data.config.gateways?.vpay?.clientSecret || '15f4a8308c85551bcdd6d4ff5f0a6b5aad58bf090b06d633902980ad18e733a2');
        setVpayUrl(data.config.gateways?.vpay?.baseUrl || 'https://vpay-api.onrender.com/api');
      }
    } catch (err) {
      console.error('Erro ao carregar configurações de gateway:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isGerenteOrAdmin) {
      fetchConfig();
    }
  }, [isOpen, isGerenteOrAdmin]);

  const handleTestGateway = async (gatewayId: GatewayType) => {
    setTestingGateway(gatewayId);
    try {
      const credentials: any = {};
      if (gatewayId === 'sigilopay') {
        credentials.publicKey = sigiloPub;
        credentials.secretKey = sigiloSec;
        credentials.baseUrl = sigiloUrl;
      }
      if (gatewayId === 'cnpay') {
        credentials.publicKey = cnpayKey || 'iamironman2001m_fo5jmrxbcscjli5u';
        credentials.apiKey = cnpayKey || 'iamironman2001m_fo5jmrxbcscjli5u';
        credentials.secretKey = cnpaySec || 'wucvyumqql79c74kl08a94ezjeep8bbkg3a81ti3je2girowkxdvqby6czfz0j6n';
        credentials.baseUrl = cnpayUrl || 'https://painel.appcnpay.com/api/v1';
      }
      if (gatewayId === 'vpay') {
        credentials.apiKey = vpayId || 'vp_82c63bcb1e4e93243ea6643fcd7a4c90';
        credentials.apiSecret = vpaySec || '15f4a8308c85551bcdd6d4ff5f0a6b5aad58bf090b06d633902980ad18e733a2';
        credentials.clientId = vpayId || 'vp_82c63bcb1e4e93243ea6643fcd7a4c90';
        credentials.clientSecret = vpaySec || '15f4a8308c85551bcdd6d4ff5f0a6b5aad58bf090b06d633902980ad18e733a2';
        credentials.baseUrl = vpayUrl || 'https://vpay-api.onrender.com/api';
      }

      const res = await fetch('/api/gerente/gateway-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail || 'gerente@decolashop.com',
          gateway: gatewayId,
          credentials
        })
      });

      const data = await res.json();
      setTestResult(prev => ({
        ...prev,
        [gatewayId]: {
          success: Boolean(data.success),
          message: data.message || data.error || 'Teste finalizado.'
        }
      }));

      if (data.success) {
        toast.success(`Teste ${gatewayId.toUpperCase()}: Conexão bem-sucedida!`);
      } else {
        toast.error(`Aviso ${gatewayId.toUpperCase()}: ${data.error || 'Verifique as credenciais'}`);
      }
    } catch (err: any) {
      setTestResult(prev => ({
        ...prev,
        [gatewayId]: {
          success: false,
          message: err.message || 'Erro de rede ao testar.'
        }
      }));
      toast.error('Erro de conexão ao testar gateway.');
    } finally {
      setTestingGateway(null);
    }
  };

  const handleSaveAndSwitch = async () => {
    setIsSaving(true);
    try {
      const payload = {
        email: userEmail || 'gerente@decolashop.com',
        activeGateway: selectedActive,
        smartFailover,
        fallbackGateway,
        gateways: {
          sigilopay: {
            publicKey: sigiloPub || 'kaiofredy2908_1cmq6fd3bmq2s24u',
            secretKey: sigiloSec || 'tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze',
            baseUrl: sigiloUrl || 'https://app.sigilopay.com.br'
          },
          cnpay: {
            publicKey: cnpayKey || 'iamironman2001m_fo5jmrxbcscjli5u',
            apiKey: cnpayKey || 'iamironman2001m_fo5jmrxbcscjli5u',
            secretKey: cnpaySec || 'wucvyumqql79c74kl08a94ezjeep8bbkg3a81ti3je2girowkxdvqby6czfz0j6n',
            baseUrl: cnpayUrl || 'https://painel.appcnpay.com/api/v1'
          },
          vpay: {
            apiKey: vpayId || 'vp_82c63bcb1e4e93243ea6643fcd7a4c90',
            apiSecret: vpaySec || '15f4a8308c85551bcdd6d4ff5f0a6b5aad58bf090b06d633902980ad18e733a2',
            clientId: vpayId || 'vp_82c63bcb1e4e93243ea6643fcd7a4c90',
            clientSecret: vpaySec || '15f4a8308c85551bcdd6d4ff5f0a6b5aad58bf090b06d633902980ad18e733a2',
            baseUrl: vpayUrl || 'https://vpay-api.onrender.com/api'
          }
        }
      };

      const res = await fetch('/api/gerente/gateway-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          `🚀 Gateway ativo alterado para [${selectedActive.toUpperCase()}] com sucesso!`,
          { duration: 5000, icon: '⚡' }
        );
        window.dispatchEvent(new CustomEvent('decolashop_gateway_changed', { detail: { activeGateway: selectedActive } }));
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        toast.error(data.error || 'Erro ao salvar configuração.');
      }
    } catch (err: any) {
      toast.error('Erro de conexão ao salvar gateway.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  if (!isGerenteOrAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="bg-[#0d121f] rounded-2xl p-6 border border-red-500/30 text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-white font-bold mb-1">Acesso Restrito</h3>
          <p className="text-slate-400 text-xs mb-4">Esta área é restrita exclusivamente à conta Gerente.</p>
          <button onClick={onClose} className="px-4 py-2 bg-white/10 rounded-xl text-white text-xs font-bold">
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0a0e1a] border border-[#22c55e]/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(34,197,94,0.15)] space-y-6 max-h-[92vh] overflow-y-auto text-white">
        
        {/* Glow de ambientação */}
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Topo do Modal */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#22c55e]/25 to-cyan-500/15 border border-[#22c55e]/40 flex items-center justify-center text-[#4ade80] shadow-lg shadow-[#22c55e]/20">
              <Layers size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Gestão de Gateways Autorizados
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30">
                  Exclusivo Gerente
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Alterne entre os gateways oficiais da plataforma: <strong>SigiloPay</strong>, <strong>CNpay</strong> e <strong>Vpay</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Atual do Gateway */}
        <div className="p-4 rounded-2xl bg-[#0f1628] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22c55e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22c55e]"></span>
            </span>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Gateway Ativo no Sistema:</span>
              <span className="text-base font-black text-white capitalize flex items-center gap-1.5">
                {selectedActive === 'sigilopay' && 'SigiloPay (Nativo Oficial)'}
                {selectedActive === 'cnpay' && 'CNpay (Gateway Alternativo 1)'}
                {selectedActive === 'vpay' && 'Vpay (Gateway Alternativo 2)'}
                <span className="text-[10px] px-2 py-0.2 rounded-md bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 font-bold uppercase">
                  OPERANDO
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTestGateway(selectedActive)}
              disabled={testingGateway === selectedActive}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCw size={12} className={testingGateway === selectedActive ? 'animate-spin' : ''} />
              <span>Testar Conexão</span>
            </button>
          </div>
        </div>

        {/* Grid dos 3 Gateways Autorizados */}
        <div className="space-y-3 relative z-10">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Selecione o Gateway Ativo para Cobranças e Recargas:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {GATEWAY_CARDS.map((gw) => {
              const isSelected = selectedActive === gw.id;
              const Icon = gw.icon;
              return (
                <div
                  key={gw.id}
                  onClick={() => setSelectedActive(gw.id)}
                  className={`rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between text-left relative group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#22c55e]/15 to-transparent border-[#22c55e] shadow-[0_0_25px_rgba(34,197,94,0.15)] ring-1 ring-[#22c55e]/50'
                      : 'bg-black/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-[#22c55e]/20 text-[#4ade80]' : 'bg-white/5 text-slate-300'
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white leading-tight">{gw.name}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">{gw.subtitle}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${gw.badgeColor}`}>
                          {gw.badge}
                        </span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-[#22c55e] text-black' : 'border border-white/20'
                        }`}>
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {gw.description}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {gw.features.slice(0, 1).map((feat, idx) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-mono">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestGateway(gw.id);
                      }}
                      disabled={testingGateway === gw.id}
                      className="text-[10px] text-slate-400 hover:text-[#4ade80] font-bold underline transition-colors cursor-pointer"
                    >
                      {testingGateway === gw.id ? 'Testando...' : 'Testar'}
                    </button>
                  </div>

                  {/* Feedback do Teste */}
                  {testResult[gw.id] && (
                    <div className={`mt-2 p-2 rounded-xl text-[10px] font-semibold leading-snug border ${
                      testResult[gw.id].success 
                        ? 'bg-[#22c55e]/10 text-[#4ade80] border-[#22c55e]/30' 
                        : 'bg-red-500/10 text-red-300 border-red-500/30'
                    }`}>
                      {testResult[gw.id].message}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Painel de Credenciais do Gateway Selecionado */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={13} className="text-[#22c55e]" />
              Credenciais de API ({selectedActive.toUpperCase()}):
            </span>
            <span className="text-[10px] text-slate-400">Armazenamento Criptografado</span>
          </div>

          {selectedActive === 'sigilopay' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Public Key SigiloPay
                </label>
                <input
                  type="text"
                  value={sigiloPub || 'kaiofredy2908_1cmq6fd3bmq2s24u'}
                  onChange={(e) => setSigiloPub(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#22c55e]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Secret Key SigiloPay
                </label>
                <input
                  type="password"
                  value={sigiloSec || 'tzlk0xxe8t4dybi2t0o1udw1ckczp01a4a9hbgptalozcan5hh0r59qw41seo3ze'}
                  onChange={(e) => setSigiloSec(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#22c55e]"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Endpoint URL
                </label>
                <input
                  type="text"
                  value={sigiloUrl || 'https://app.sigilopay.com.br'}
                  onChange={(e) => setSigiloUrl(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>
          )}

          {selectedActive === 'cnpay' && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Chave Pública (Client ID)
                  </label>
                  <input
                    type="text"
                    value={cnpayKey}
                    onChange={(e) => setCnpayKey(e.target.value)}
                    placeholder="iamironman2001m_fo5jmrxbcscjli5u"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Chave Privada (Client Secret)
                  </label>
                  <input
                    type="password"
                    value={cnpaySec}
                    onChange={(e) => setCnpaySec(e.target.value)}
                    placeholder="wucvyumqql79c74kl08a94ezjeep8bbkg3a81ti3je2girowkxdvqby6czfz0j6n"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Base URL CNpay
                  </label>
                  <input
                    type="text"
                    value={cnpayUrl || 'https://painel.appcnpay.com/api/v1'}
                    onChange={(e) => setCnpayUrl(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="text-cyan-400 font-mono">Documentação oficial homologada: API v1 REST via headers x-public-key e x-secret-key</span>
                <a 
                  href="https://painel.appcnpay.com/docs/v1" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[#22c55e] hover:underline"
                >
                  <ExternalLink size={10} />
                  Ver Manual da API CNpay
                </a>
              </div>
            </div>
          )}

          {selectedActive === 'vpay' && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    x-api-key (Chave Pública)
                  </label>
                  <input
                    type="text"
                    value={vpayId}
                    onChange={(e) => setVpayId(e.target.value)}
                    placeholder="vp_82c63bcb1e4e93243ea6643fcd7a4c90"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    x-api-secret (Chave Privada)
                  </label>
                  <input
                    type="password"
                    value={vpaySec}
                    onChange={(e) => setVpaySec(e.target.value)}
                    placeholder="15f4a8308c85551bcdd6d4ff5f0a6b5aad58bf090b06d633902980ad18e733a2"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Base URL Vpay
                  </label>
                  <input
                    type="text"
                    value={vpayUrl || 'https://vpay-api.onrender.com/api'}
                    onChange={(e) => setVpayUrl(e.target.value)}
                    placeholder="https://vpay-api.onrender.com/api"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="text-purple-400 font-mono">Autenticação Bearer Token via POST /v1/auth/token com expiração de 1h</span>
                <span className="text-slate-400">Escopos: pix.cobranca.criar, transacoes.ler, saldo.ler</span>
              </div>
            </div>
          )}
        </div>

        {/* Smart Failover entre SigiloPay, CNpay e Vpay */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-[#22c55e]/25 flex items-start justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#22c55e]" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Smart Failover (Contingência Automática)
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#22c55e]/20 text-[#4ade80] font-bold">
                RECOMENDADO
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed max-w-xl">
              Caso o gateway principal (ex: SigiloPay) fique fora do ar ou apresente lentidão (&gt;5s), o sistema direciona automaticamente o Pix para o gateway de contingência sem interromper a compra do cliente.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span>Fallback de Contingência:</span>
              <select
                value={fallbackGateway}
                onChange={(e) => setFallbackGateway(e.target.value as GatewayType)}
                className="bg-black/60 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer"
              >
                <option value="cnpay">CNpay (Alternativo 1)</option>
                <option value="vpay">Vpay (Alternativo 2)</option>
                <option value="sigilopay">SigiloPay (Nativo)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSmartFailover(!smartFailover)}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 mt-1 ${
              smartFailover ? 'bg-[#22c55e]' : 'bg-slate-700'
            }`}
          >
            <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-md ${
              smartFailover ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Botão de Salvar e Ativar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 relative z-10">
          <p className="text-[11px] text-slate-400">
            A troca entra em vigor instantaneamente em todo o sistema (Upgrades, Recargas e Antecipações).
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 sm:w-auto px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSaveAndSwitch}
              disabled={isSaving}
              className="w-2/3 sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#22c55e] via-emerald-500 to-[#16a34a] hover:brightness-110 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-[#22c55e]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RotateCw size={14} className="animate-spin" />
                  <span>Salvando Gateway...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Ativar Gateway Agora</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
