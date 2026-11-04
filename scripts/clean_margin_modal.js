const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/MarginSelectionModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const endToken = '  );\n}';
const endIdx = content.indexOf(endToken);
if (endIdx !== -1) {
  content = content.substring(0, endIdx + endToken.length) + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Truncated MarginSelectionModal.tsx cleanly at component end.');
} else {
  console.log('End token not found.');
}
