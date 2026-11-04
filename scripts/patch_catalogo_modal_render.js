const fs = require('fs');
const path = require('path');

// 1. Patch CatalogoView.tsx to render PublishingProgressModal
const catPath = path.join(__dirname, '../src/components/views/CatalogoView.tsx');
let catCode = fs.readFileSync(catPath, 'utf8');

const isCRLF = catCode.includes('\r\n');
if (isCRLF) catCode = catCode.replaceAll('\r\n', '\n');

const targetModal = `      {/* Modal de Seleção de Margem e Canal */}
      <MarginSelectionModal
        isOpen={!!marginModalProduct}
        onClose={() => setMarginModalProduct(null)}
        product={marginModalProduct}
        onConfirm={handleConfirmMargin}
        isUsd={isUsd}
      />`;

const replacementModal = `      {/* Modal de Seleção de Margem e Canal */}
      <MarginSelectionModal
        isOpen={!!marginModalProduct}
        onClose={() => setMarginModalProduct(null)}
        product={marginModalProduct}
        onConfirm={handleConfirmMargin}
        isUsd={isUsd}
      />

      {/* Modal de Carregamento e Publicação IA com Progresso em Tempo Real */}
      <PublishingProgressModal
        isOpen={!!publishingConfig}
        product={publishingConfig?.product || null}
        channelLabel={publishingConfig?.channelLabel || ''}
        isUsd={isUsd}
        onComplete={handlePublishComplete}
      />`;

if (catCode.includes(targetModal)) {
  catCode = catCode.replace(targetModal, replacementModal);
  console.log('Successfully added PublishingProgressModal to CatalogoView.tsx JSX!');
} else {
  console.error('targetModal not found in CatalogoView.tsx');
}

if (isCRLF) catCode = catCode.replaceAll('\n', '\r\n');
fs.writeFileSync(catPath, catCode, 'utf8');

// 2. Patch MarginSelectionModal.tsx to reset isSubmitting on open
const marginPath = path.join(__dirname, '../src/components/MarginSelectionModal.tsx');
let marginCode = fs.readFileSync(marginPath, 'utf8');

const isMarginCRLF = marginCode.includes('\r\n');
if (isMarginCRLF) marginCode = marginCode.replaceAll('\r\n', '\n');

const submittingTarget = `  const [isSubmitting, setIsSubmitting] = useState(false);`;
const submittingReplacement = `  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);`;

if (marginCode.includes(submittingTarget) && !marginCode.includes('if (isOpen) {\n      setIsSubmitting(false);')) {
  marginCode = marginCode.replace(submittingTarget, submittingReplacement);
  console.log('Added isSubmitting reset to MarginSelectionModal.tsx');
}

if (isMarginCRLF) marginCode = marginCode.replaceAll('\n', '\r\n');
fs.writeFileSync(marginPath, marginCode, 'utf8');
