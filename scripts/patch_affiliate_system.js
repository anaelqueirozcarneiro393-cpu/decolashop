const fs = require('fs');
let code = fs.readFileSync('src/lib/affiliateSystem.ts', 'utf-8');

// 1. Add davi alias
if (!code.includes("'davi': 'mhnfbcve'")) {
  code = code.replace(
    "'david': 'mhnfbcve',",
    "'davi': 'mhnfbcve',\n  'david': 'mhnfbcve',"
  );
}

// 2. Add secure flag on cookies
const oldCookieFunc = `// Helper: Set ultra-durable cookie with 365 days expiration, Lax security, and multi-domain scope
function setDurableCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 86400;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const encoded = encodeURIComponent(value);

  // 1. Host-specific cookie
  document.cookie = \`\${name}=\${encoded}; max-age=\${maxAge}; expires=\${expires}; path=/; SameSite=Lax\`;

  // 2. Cross-subdomain cookies for decolashop domains
  try {
    const hostname = window.location.hostname;
    if (hostname.includes('decolashop.com.br')) {
      document.cookie = \`\${name}=\${encoded}; max-age=\${maxAge}; expires=\${expires}; path=/; domain=.decolashop.com.br; SameSite=Lax\`;
    } else if (hostname.includes('decolashop.com')) {
      document.cookie = \`\${name}=\${encoded}; max-age=\${maxAge}; expires=\${expires}; path=/; domain=.decolashop.com; SameSite=Lax\`;
    }
  } catch {}
}`;

const newCookieFunc = `// Helper: Set ultra-durable cookie with 365 days expiration, Lax security, and multi-domain scope
function setDurableCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 86400;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const encoded = encodeURIComponent(value);
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const secureFlag = isHttps ? '; Secure' : '';

  // 1. Host-specific cookie
  document.cookie = \`\${name}=\${encoded}; max-age=\${maxAge}; expires=\${expires}; path=/; SameSite=Lax\${secureFlag}\`;

  // 2. Cross-subdomain cookies for decolashop domains
  try {
    const hostname = window.location.hostname;
    if (hostname.includes('decolashop.com.br')) {
      document.cookie = \`\${name}=\${encoded}; max-age=\${maxAge}; expires=\${expires}; path=/; domain=.decolashop.com.br; SameSite=Lax\${secureFlag}\`;
    } else if (hostname.includes('decolashop.com')) {
      document.cookie = \`\${name}=\${encoded}; max-age=\${maxAge}; expires=\${expires}; path=/; domain=.decolashop.com; SameSite=Lax\${secureFlag}\`;
    }
  } catch {}
}`;

code = code.replace(oldCookieFunc, newCookieFunc);

fs.writeFileSync('src/lib/affiliateSystem.ts', code, 'utf-8');
console.log('src/lib/affiliateSystem.ts patched successfully!');
