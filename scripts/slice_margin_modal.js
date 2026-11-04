const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/MarginSelectionModal.tsx');
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

const cleanLines = lines.slice(0, 459);
fs.writeFileSync(filePath, cleanLines.join('\n') + '\n', 'utf8');
console.log('Sliced MarginSelectionModal to line 459.');
