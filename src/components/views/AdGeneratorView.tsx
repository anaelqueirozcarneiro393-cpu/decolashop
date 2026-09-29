'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Crown, 
  Search, 
  Check, 
  Share2, 
  Radio, 
  Flame, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Zap,
  ShoppingBag
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { toast } from 'react-hot-toast';
import { useSales } from '@/lib/salesContext';

interface AdGeneratorViewProps {
  product?: any;
  onNavigate: (view: any, product?: any) => void;
}

const catalogProducts = [
  {
    id: 'prod-1',
    name: 'Jogo de Camisas De Jogo Uniforme Futebol 53 Peça...',
    fullTitle: 'Jogo de Camisas De Jogo Uniforme Futebol 53 Peças Completo',
    price: 'R$ 1.489,90',
    category: 'Esportes',
    description: 'Fardamento esportivo completo com 53 peças (camisetas + calções) em tecido Dri-FIT com personalização de escudo, patrocínio e numeração profissional.',
    image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'prod-2',
    name: 'Jogo De Camisas + calção ...',
    fullTitle: 'Jogo De Camisas + Calção Futebol Amador 18 Peças',
    price: 'R$ 459,90',
    category: 'Esportes',
    description: 'Kit de jogo para equipe de society ou campo, tecido respirável com acabamento reforçado.',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'prod-3',
    name: 'Camiseta Oversized Pedri ...',
    fullTitle: 'Camiseta Oversized Pedri Streetwear Algodão 100%',
    price: 'R$ 49,90',
    category: 'Esportes',
    description: 'Camiseta estilo streetwear com estampa fotográfica em alta definição e modelagem premium.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'prod-4',
    name: 'Camiseta Blusa Algodão U...',
    fullTitle: 'Camiseta Blusa Algodão Unissex Básica Premium',
    price: 'R$ 44,90',
    category: 'Esportes',
    description: 'Camiseta unissex fio 30.1 penteado, gola canelada e toque aveludado.',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'prod-5',
    name: 'Jogo Uniforme Futebol Fa...',
    fullTitle: 'Jogo Uniforme Futebol Fábrica 22 Conjuntos',
    price: 'R$ 589,90',
    category: 'Esportes',
    description: 'Conjunto completo direto da fábrica para torneios amadores com tecido tecnológico.',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'prod-6',
    name: 'Nova Camisa De Futebol P...',
    fullTitle: 'Nova Camisa De Futebol Profissional Edição Especial',
    price: 'R$ 39,90',
    category: 'Esportes',
    description: 'Camisa oficial comemorativa de alta respirabilidade e detalhes sublimados.',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=300',
  },
];

const categories = ['Todos', 'Esportes', 'Eletrônicos', 'Cosméticos', 'Casa & Jardim', 'Brinquedos'];

export default function AdGeneratorView({ onNavigate }: AdGeneratorViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(catalogProducts[0]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishedNetwork, setPublishedNetwork] = useState('');
  const { addSale } = useSales();

  const filteredProducts = catalogProducts.filter((p) => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleStartPublishing = () => {
    setIsPublishing(true);
    setPublishProgress(10);
    setPublishedNetwork('Otimizando criativos com IA...');

    setTimeout(() => {
      setPublishProgress(35);
      setPublishedNetwork('Publicando no Kwai e TikTok Ads...');
    }, 700);

    setTimeout(() => {
      setPublishProgress(70);
      setPublishedNetwork('Propagando no Facebook, Instagram e WhatsApp...');
    }, 1500);

    setTimeout(() => {
      setPublishProgress(100);
      setPublishedNetwork('Finalizado! 6 redes conectadas e gerando tráfego.');
      setIsPublishing(false);
      const numericPrice = parseFloat(selectedProduct.price.replace('R$', '').replace('.', '').replace(',', '.').trim()) || 1489.90;
      addSale(selectedProduct.name, numericPrice, numericPrice * 0.25);
    }, 2400);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff0eb] text-[#ee4d2d] border border-[#fcd8cf] text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>INTELIGÊNCIA ARTIFICIAL</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Divulgação com IA
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Sua central inteligente para propagar produtos automaticamente por toda a internet.
        </p>
      </div>

      {/* Main Grid: Left Column (Credits & Selected) + Right Column (Step 1 Selection) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Créditos de IA */}
          <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ee4d2d]">
                  <Crown size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 leading-tight">
                    Créditos de IA
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    Acesso Ilimitado Liberado
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase bg-orange-100/70 text-[#ee4d2d] px-2 py-0.5 rounded-md">
                  ADMIN
                </span>
                <span className="text-[10px] font-black uppercase border border-orange-200 text-[#ee4d2d] px-2 py-0.5 rounded-md">
                  ∞ ILIMITADO
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500 font-medium">Status do Limite</span>
                <span className="text-[#ee4d2d] font-black">ILIMITADO (∞)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-orange-100 overflow-hidden">
                <div className="w-full h-full bg-[#ee4d2d] rounded-full" />
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              ✓ Conta de Administrador: Divulgações ilimitadas sem nenhum consumo de créditos.
            </p>

            <button className="w-full py-2.5 px-4 rounded-2xl bg-[#fff2ee] hover:bg-[#ffe7df] border border-[#ffd5c8] text-[#ee4d2d] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all">
              <Crown size={14} />
              <span>CRÉDITOS INFINITOS ATIVOS</span>
            </button>
          </div>

          {/* Card 2: Produto Selecionado */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-gray-700 uppercase tracking-wider">
              <ShoppingBag size={14} className="text-[#ee4d2d]" />
              <span>PRODUTO SELECIONADO</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                <SafeImage
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-gray-900 leading-snug line-clamp-2">
                  {selectedProduct.fullTitle}
                </h4>
                <p className="text-sm font-black text-[#ee4d2d] mt-1">
                  {selectedProduct.price}
                </p>
              </div>
            </div>

            {/* Quote box */}
            <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100">
              <p className="text-[11px] text-gray-500 italic leading-relaxed">
                "{selectedProduct.description}"
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Step 1 (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-black text-gray-900">
              Passo 1: Escolha o Produto & Divulgue com IA
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Selecione um produto do seu catálogo abaixo para que o algoritmo gere campanhas otimizadas.
            </p>
          </div>

          {/* Search & Categories Bar */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <div className="relative flex-shrink-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-28 focus:w-44 text-xs font-medium pl-8 pr-3 py-1.5 rounded-full border border-gray-200 focus:outline-none focus:border-[#ee4d2d] transition-all bg-gray-50"
                />
              </div>

              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#ee4d2d] text-white shadow-sm shadow-orange-500/20'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid (2 columns matching screenshot) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const isSelected = selectedProduct.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#ee4d2d] bg-orange-50/30 ring-1 ring-[#ee4d2d]/30'
                      : 'border-gray-200/80 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                      <SafeImage
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs font-black text-[#ee4d2d] mt-0.5">
                        {p.price}
                      </p>
                    </div>
                  </div>

                  {/* Radio selector icon */}
                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#ee4d2d] text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-gray-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Network Callout */}
          <p className="text-xs text-gray-700 leading-relaxed pt-2">
            Sua inteligência artificial integrada publicará automaticamente o produto selecionado em massa nas redes sociais:{' '}
            <strong className="text-gray-900 font-extrabold">Kwai</strong>,{' '}
            <strong className="text-gray-900 font-extrabold">TikTok</strong>,{' '}
            <strong className="text-gray-900 font-extrabold">Facebook</strong>,{' '}
            <strong className="text-gray-900 font-extrabold">WhatsApp</strong>,{' '}
            <strong className="text-gray-900 font-extrabold">Instagram</strong> e{' '}
            <strong className="text-gray-900 font-extrabold">Twitter</strong>.
          </p>

          {/* Big Action Button */}
          <button
            onClick={handleStartPublishing}
            disabled={isPublishing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#ee4d2d] to-[#f94d2f] hover:from-[#d73f20] hover:to-[#ee4d2d] text-white font-black text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all active:scale-[0.99] disabled:opacity-75"
          >
            {isPublishing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{publishedNetwork} ({publishProgress}%)</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>DIVULGAÇÃO AUTOMÁTICA (CONSOME 25%)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Card: Rede de Tráfego Global Ativa */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900">
            Rede de Tráfego Global Ativa
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            As publicações são distribuídas em perfis otimizados de nichos específicos para maximizar taxas de cliques.
          </p>
        </div>

        {/* Social Badges matching screenshot */}
        <div className="flex items-center gap-2 flex-wrap">
          {['Kwai', 'TikTok', 'Facebook', 'WhatsApp', 'Instagram', 'Twitter'].map((net) => (
            <div
              key={net}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-600"
            >
              <CheckCircle2 size={13} className="text-gray-400" />
              <span>{net}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
