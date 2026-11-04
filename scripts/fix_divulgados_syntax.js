const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/views/DivulgadosView.tsx');
let code = fs.readFileSync(filePath, 'utf8');

code = code.replaceAll(
  'onClick={() => setTrackingCampaign(null); setTrackingModalData(null)}',
  'onClick={() => { setTrackingCampaign(null); setTrackingModalData(null); }}'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Fixed DivulgadosView syntax.');
