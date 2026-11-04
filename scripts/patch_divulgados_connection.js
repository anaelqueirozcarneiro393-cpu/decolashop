const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/divulgados.ts');
let code = fs.readFileSync(filePath, 'utf8');

const targetFunction = `export function getConnectedChannelInfo(channel: string): ConnectedChannelInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('decolashop_channel_connections');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    let key = channel.toLowerCase();
    if (key === 'mercadolivre') key = 'ml';
    
    const info = parsed[key] || (key === 'ml' ? parsed['mercadolivre'] : null);
    if (info && info.connected) {
      return info as ConnectedChannelInfo;
    }
    return null;
  } catch {
    return null;
  }
}`;

const replacementFunction = `export function getConnectedChannelInfo(channel: string, userEmail?: string): ConnectedChannelInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const keysToCheck: string[] = [];
    if (userEmail) {
      keysToCheck.push(\`decolashop_channel_connections_\${userEmail.toLowerCase().trim()}\`);
    }
    const storedEmail = localStorage.getItem('decolashop_user_email') || localStorage.getItem('decolashop_active_user_email');
    if (storedEmail) {
      keysToCheck.push(\`decolashop_channel_connections_\${storedEmail.toLowerCase().trim()}\`);
    }
    keysToCheck.push('decolashop_channel_connections');

    // Varre todas as chaves do localStorage para encontrar conexões salvas
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('decolashop_channel_connections') && !keysToCheck.includes(k)) {
        keysToCheck.push(k);
      }
    }

    let normKey = channel.toLowerCase().trim();
    if (normKey === 'mercadolivre') normKey = 'ml';

    for (const key of keysToCheck) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') continue;

      const info = parsed[normKey] || (normKey === 'ml' ? parsed['mercadolivre'] : null);
      if (info && info.connected) {
        return info as ConnectedChannelInfo;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function isChannelConnected(channel: string, userEmail?: string): boolean {
  return !!getConnectedChannelInfo(channel, userEmail);
}`;

if (code.includes(targetFunction)) {
  code = code.replace(targetFunction, replacementFunction);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Successfully upgraded getConnectedChannelInfo and added isChannelConnected.');
} else {
  console.log('Target function in divulgados.ts not found.');
}
