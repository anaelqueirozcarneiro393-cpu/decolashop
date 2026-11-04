const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/MarginSelectionModal.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add AlertTriangle and useSession imports
if (!code.includes('AlertTriangle')) {
  code = code.replace(
    "DollarSign\n} from 'lucide-react';",
    "DollarSign,\n  AlertTriangle\n} from 'lucide-react';"
  );
}

if (!code.includes("from 'next-auth/react'")) {
  code = code.replace(
    "import { toast } from 'react-hot-toast';",
    "import { toast } from 'react-hot-toast';\nimport { useSession } from 'next-auth/react';\nimport { isChannelConnected } from '@/lib/divulgados';"
  );
}

// 2. Add session and connection map inside component
const sessionInjectionTarget = `  const currencySymbol = isUsd ? 'US$' : 'R$';`;
const sessionInjection = `  const { data: session } = useSession();
  const userEmail = session?.user?.email || undefined;
  const currencySymbol = isUsd ? 'US$' : 'R$';`;

if (code.includes(sessionInjectionTarget) && !code.includes('const { data: session } = useSession();')) {
  code = code.replace(sessionInjectionTarget, sessionInjection);
}

// 3. Compute channelConnectionMap
const connectionMapTarget = `  const activeChannel = useMemo(() => {
    return channels.find(c => c.id === selectedChannel) || channels[0];
  }, [channels, selectedChannel]);`;

const connectionMapCode = `  const activeChannel = useMemo(() => {
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

if (code.includes(connectionMapTarget)) {
  code = code.replace(connectionMapTarget, connectionMapCode);
}

// 4. Update handleConfirm to block publishing if unconnected
const confirmTarget = `  const handleConfirm = () => {
    setIsSubmitting(true);
    try {`;

const confirmReplacement = `  const handleConfirm = () => {
    if (!isCurrentChannelConnected) {
      toast.error(\`⚠️ Sua loja \${activeChannel.name} não está conectada! Conecte sua loja na aba "Conectar Lojas" para poder divulgar.\`, {
        icon: '⚠️',
        duration: 5000
      });
      return;
    }

    setIsSubmitting(true);
    try {`;

if (code.includes(confirmTarget)) {
  code = code.replace(confirmTarget, confirmReplacement);
}

// 5. Update channel button in the grid to display connected pill
const channelButtonFeeTarget = `<span className="text-[9px] text-slate-500 font-medium">{ch.feeLabel}</span>`;
const channelButtonFeeReplacement = `<span className="text-[9px] text-slate-500 font-medium">
                        {channelConnectionMap[ch.id] ? (
                          <span className="text-emerald-400 font-bold">🟢 Conectada</span>
                        ) : (
                          <span className="text-amber-400 font-bold">⚠️ Não conectada</span>
                        )}
                      </span>`;

if (code.includes(channelButtonFeeTarget)) {
  code = code.replace(channelButtonFeeTarget, channelButtonFeeReplacement);
}

// 6. Add warning banner below channels grid
const gridCloseTarget = `          </div>
        </div>

        {/* Definição da Margem Dela */}`;

const gridCloseReplacement = `          </div>

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

if (code.includes(gridCloseTarget)) {
  code = code.replace(gridCloseTarget, gridCloseReplacement);
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('MarginSelectionModal.tsx patched successfully.');
