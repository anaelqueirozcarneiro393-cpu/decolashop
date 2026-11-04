const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/MarginSelectionModal.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add AlertTriangle to lucide-react
if (!code.includes('AlertTriangle')) {
  code = code.replace(
    'DollarSign\n} from \'lucide-react\';',
    'DollarSign,\n  AlertTriangle\n} from \'lucide-react\';'
  );
}

// 2. Add imports for next-auth and isChannelConnected
if (!code.includes('isChannelConnected')) {
  code = code.replace(
    "import { toast } from 'react-hot-toast';",
    "import { toast } from 'react-hot-toast';\nimport { useSession } from 'next-auth/react';\nimport { isChannelConnected } from '@/lib/divulgados';"
  );
}

// 3. Add useSession and userEmail inside component
const sessionTarget = "  const currencySymbol = isUsd ? 'US$' : 'R$';";
const sessionCode = "  const { data: session } = useSession();\n  const userEmail = session?.user?.email || undefined;\n  const currencySymbol = isUsd ? 'US$' : 'R$';";

if (code.includes(sessionTarget)) {
  code = code.replace(sessionTarget, sessionCode);
}

// 4. Add channelConnectionMap
const activeTarget = `  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannel) || channels[0];
  }, [channels, selectedChannel]);`;

const activeCode = `  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannel) || channels[0];
  }, [channels, selectedChannel]);

  const channelConnectionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const ch of channels) {
      map[ch.id] = isChannelConnected(ch.id, userEmail);
    }
    return map;
  }, [channels, userEmail]);

  const isCurrentChannelConnected = !!channelConnectionMap[selectedChannel];`;

if (code.includes(activeTarget)) {
  code = code.replace(activeTarget, activeCode);
}

// 5. In handleConfirm, check connection
const confirmTarget = `  const handleConfirm = () => {
    setIsSubmitting(true);
    try {`;

const confirmCode = `  const handleConfirm = () => {
    if (!isCurrentChannelConnected) {
      toast.error('⚠️ Sua loja ' + activeChannel.name + ' não está conectada! Conecte sua conta em Conectar Lojas antes de divulgar.', {
        icon: '⚠️',
        duration: 5000
      });
      return;
    }

    setIsSubmitting(true);
    try {`;

if (code.includes(confirmTarget)) {
  code = code.replace(confirmTarget, confirmCode);
}

// 6. In channel button, replace feeLabel with connection status pill
const feeTarget = `<span className="text-[9px] text-slate-500 font-medium">{ch.feeLabel}</span>`;
const feeCode = `<span className="text-[9px] font-bold">
                        {channelConnectionMap[ch.id] ? (
                          <span className="text-emerald-400">🟢 Conectada</span>
                        ) : (
                          <span className="text-amber-400">⚠️ Não conectada</span>
                        )}
                      </span>`;

if (code.includes(feeTarget)) {
  code = code.replace(feeTarget, feeCode);
}

// 7. Add warning banner below channels grid
const gridEndTarget = `          </div>
        </div>

        {/* Definição da Margem Dela */}`;

const gridEndCode = `          </div>

          {/* Aviso se a loja selecionada não estiver conectada */}
          {!isCurrentChannelConnected && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-300 min-w-0">
                <AlertTriangle size={16} className="shrink-0 text-amber-400" />
                <span className="truncate">Loja <strong>{activeChannel.name}</strong> não conectada</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('decolashop_navigate', { detail: 'conectar' }));
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-[11px] transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                Conectar Loja
              </button>
            </div>
          )}
        </div>

        {/* Definição da Margem Dela */}`;

if (code.includes(gridEndTarget)) {
  code = code.replace(gridEndTarget, gridEndCode);
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('MarginSelectionModal patched cleanly.');
