const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/views/DivulgadosView.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const targetStart = `      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (`;

const targetEnd = `        </div>
      )}

      {/* Campaign Details Modal */}`;

const startIndex = code.indexOf(targetStart);
const endIndex = code.indexOf(targetEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error('Target start or end not found!');
  process.exit(1);
}

const replacement = `      {/* Conteúdo Principal Alternado por Aba */}
      {activeMainTab === 'vendidos' ? (
        /* ========================================================================= */
        /* ABA 2: PRODUTOS VENDIDOS & RASTREIO (SEPARADOS POR PEDIDO, ÚLTIMOS 15)   */
        /* ========================================================================= */
        recentOrders.length === 0 ? (
          <div className="rounded-3xl p-12 bg-[#0d121f]/60 border border-white/10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mx-auto flex items-center justify-center text-cyan-400">
              <PackageCheck size={28} />
            </div>
            <h3 className="text-base font-bold text-white">Nenhum pedido vendido com envio pendente</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Assim que suas campanhas ativas realizarem vendas, os envios aparecerão aqui individualmente por pedido (limitado estritamente aos últimos 15 pedidos) com código de rastreio e prazo de entrega garantido de 7 dias.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveMainTab('divulgados')}
                className="px-4 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#22c55e]/20 hover:brightness-110 active:scale-95 transition-all"
              >
                <Megaphone size={14} />
                <span>Ver Anúncios Divulgados</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 mb-1">
              <div className="flex items-center gap-2">
                <PackageCheck size={16} className="text-cyan-400" />
                <span className="text-xs sm:text-sm font-black text-white">
                  Últimos Pedidos Despachados ({recentOrders.length})
                </span>
              </div>
              <span className="text-[10px] text-cyan-300 font-mono bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Últimos 15 pedidos
              </span>
            </div>

            {recentOrders.map((order) => {
              const isDelivered = order.shipping.isDelivered;
              const isUsd = order.currency === 'USD';
              const currencySym = isUsd ? 'US$' : 'R$';

              return (
                <div
                  key={order.id}
                  className="rounded-2xl p-3.5 sm:p-4 bg-[#0d121f]/90 border border-cyan-500/20 hover:border-cyan-500/40 transition-all shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3.5"
                >
                  {/* Left: Product image + Order Number + Destination */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                      <SafeImage
                        src={order.productImage}
                        alt={order.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                          {order.id}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {order.dateStr} às {order.timeStr}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-white/5 border-white/10 text-slate-300">
                          {order.channelLabel}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                        {order.productName}
                      </h4>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>Cliente: <strong className="text-slate-200">{order.customerName}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-cyan-400">
                          <MapPin size={10} /> {order.customerCity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Value & Net Profit */}
                  <div className="flex items-center gap-5 px-3 py-2 rounded-xl bg-black/40 border border-white/5 shrink-0 justify-between md:justify-start">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Valor Venda</span>
                      <span className="text-xs font-black text-white">
                        {currencySym} {order.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Lucro Líquido</span>
                      <span className="text-xs font-black text-emerald-400">
                        +{currencySym} {order.margin.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Status Envio</span>
                      <span className={\`text-[10px] font-black uppercase flex items-center gap-1 \${
                        isDelivered ? 'text-emerald-400' : 'text-cyan-300'
                      }\`}>
                        <span className={\`w-1.5 h-1.5 rounded-full \${isDelivered ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'}\`} />
                        {isDelivered ? 'Entregue (7d)' : order.shipping.statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Right: Carrier, Tracking code & Actions */}
                  <div className="flex items-center gap-2 justify-end shrink-0 flex-wrap">
                    <div className="hidden lg:flex flex-col text-right mr-1">
                      <span className="text-[9px] text-slate-400 font-mono">{order.shipping.carrier}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[11px] font-bold text-cyan-300">{order.shipping.trackingCode}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(order.shipping.trackingCode);
                            toast.success('Código copiado!');
                          }}
                          className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                          title="Copiar código de rastreio"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setTrackingModalData({
                        shipping: order.shipping,
                        name: order.productName,
                        image_url: order.productImage,
                        price: order.price,
                        orderId: order.id
                      })}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 text-white font-black text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Truck size={13} />
                      <span>Rastrear</span>
                    </button>

                    <button
                      onClick={() => handleSendWhatsAppNotification(order.productName, order.shipping)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Notificar cliente no WhatsApp"
                    >
                      <MessageCircle size={13} />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ========================================================================= */
        /* ABA 1: PRODUTOS DIVULGADOS (CARDS MINIMALISTAS E LIMPOS)                  */
        /* ========================================================================= */
        filteredCampaigns.length === 0 ? (
          <div className="rounded-3xl p-12 bg-[#0d121f]/60 border border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-slate-500">
              <Megaphone size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Nenhum produto divulgado encontrado</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {searchQuery 
                  ? 'Nenhum item corresponde ao termo pesquisado. Tente outra palavra-chave.' 
                  : regionFilter !== 'all'
                  ? \`Você ainda não possui produtos divulgados no filtro de região selecionado (\${regionFilter === 'USD' ? 'Exterior' : 'Brasil'}).\`
                  : 'Você ainda não possui anúncios divulgados. Escolha produtos no catálogo para divulgar com IA.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => onNavigate('catalogo')}
                className="px-4 py-2 rounded-xl bg-[#22c55e] text-black font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-[#22c55e]/20"
              >
                <Plus size={14} /> Ir para o Catálogo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCampaigns.map((camp) => {
              const isUsd = camp.currency === 'USD' || (typeof camp.price === 'string' && camp.price.includes('$') && !camp.price.includes('R$'));
              const currencySym = isUsd ? 'US$' : 'R$';
              const priceNum = typeof camp.price === 'number' 
                ? camp.price 
                : parseFloat(String(camp.price).replace(/[^0-9.]/g, '')) || 99.90;
              const marginNum = camp.sellerMargin !== undefined 
                ? camp.sellerMargin 
                : Math.round(priceNum * 0.35 * 100) / 100;
              const isActive = camp.status === 'active';

              return (
                <div
                  key={camp.id}
                  className={\`rounded-2xl p-3.5 sm:p-4 bg-[#0d121f]/90 border transition-all shadow-md backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3.5 \${
                    isActive
                      ? 'border-white/10 hover:border-[#22c55e]/30'
                      : 'border-white/5 opacity-70 hover:opacity-100 hover:border-amber-400/20'
                  }\`}
                >
                  {/* Left: Product Thumbnail + Title + Channel + Price/Margin */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                      <SafeImage
                        src={camp.image_url}
                        alt={camp.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 \${
                          camp.channel === 'mercadolivre'
                            ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/25'
                            : camp.channel === 'shopee'
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/25'
                            : camp.channel === 'tiktok'
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                        }\`}>
                          {camp.channel === 'mercadolivre' ? '🟡' : camp.channel === 'shopee' ? '🟠' : camp.channel === 'tiktok' ? '⚫' : '🌐'} {camp.channelLabel || 'Marketplace'}
                        </span>

                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 \${
                          isActive ? 'bg-[#22c55e]/15 text-[#4ade80]' : 'bg-amber-400/15 text-amber-300'
                        }\`}>
                          <span className={\`w-1.5 h-1.5 rounded-full \${isActive ? 'bg-[#22c55e] animate-pulse' : 'bg-amber-400'}\`} />
                          {isActive ? 'Ativo' : 'Pausado'}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                        {camp.name}
                      </h3>

                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="font-extrabold text-white">
                          {currencySym} {priceNum.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20 text-[11px]">
                          Lucro: +{currencySym} {marginNum.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center: 3 Compact Stats */}
                  <div className="flex items-center gap-5 px-3 py-2 rounded-xl bg-black/40 border border-white/5 shrink-0 justify-between md:justify-start text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Views</span>
                      <span className="font-bold text-white">{(camp.impressions || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Cliques</span>
                      <span className="font-bold text-white">{(camp.clicks || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Vendas</span>
                      <span className="font-extrabold text-[#4ade80]">{camp.salesCount || 0} ped.</span>
                    </div>
                  </div>

                  {/* Right: Clean 2-3 Actions */}
                  <div className="flex items-center gap-2 justify-end shrink-0">
                    <button
                      onClick={(e) => handleToggle(camp.id, e)}
                      className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border \${
                        isActive
                          ? 'bg-amber-400/10 text-amber-300 border-amber-400/25 hover:bg-amber-400/20'
                          : 'bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30 hover:bg-[#22c55e]/25'
                      }\`}
                    >
                      {isActive ? <Pause size={12} /> : <Play size={12} />}
                      <span>{isActive ? 'Pausar' : 'Retomar'}</span>
                    </button>

                    <a
                      href={camp.marketplaceItemUrl || \`https://shopee.com.br/search?keyword=\${encodeURIComponent(camp.name.split('(')[0].trim())}\`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      <span>Ver Anúncio</span>
                    </a>

                    <button
                      onClick={(e) => handleDelete(camp.id, e)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Excluir campanha"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}`;

const newCode = code.substring(0, startIndex) + replacement + code.substring(endIndex + targetEnd.length - '{/* Campaign Details Modal */}'.length);

fs.writeFileSync(filePath, newCode, 'utf8');
console.log('Successfully replaced DivulgadosView cards rendering with minimalist cards and 15-order list.');
