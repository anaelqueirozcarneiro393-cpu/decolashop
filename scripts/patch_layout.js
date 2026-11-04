const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf-8');

// 1. Add davi alias in layout.tsx
if (!code.includes("'davi': 'mhnfbcve'")) {
  code = code.replace(
    "'david': 'mhnfbcve',",
    "'davi': 'mhnfbcve',\n                      'david': 'mhnfbcve',"
  );
}

// 2. Add Secure flag to cookies in layout.tsx
code = code.replace(
  "document.cookie = 'decolashop_af=' + clean + '; max-age=' + d + '; expires=' + exp + '; path=/; SameSite=Lax';",
  "var sec = window.location.protocol === 'https:' ? '; Secure' : '';\n                      document.cookie = 'decolashop_af=' + clean + '; max-age=' + d + '; expires=' + exp + '; path=/; SameSite=Lax' + sec;"
);
code = code.replace(
  "document.cookie = 'decolashop_af=' + clean + '; max-age=' + d + '; expires=' + exp + '; path=/; domain=.decolashop.com.br; SameSite=Lax';",
  "document.cookie = 'decolashop_af=' + clean + '; max-age=' + d + '; expires=' + exp + '; path=/; domain=.decolashop.com.br; SameSite=Lax' + sec;"
);
code = code.replace(
  "document.cookie = 'decolashop_af=' + clean + '; max-age=' + d + '; expires=' + exp + '; path=/; domain=.decolashop.com; SameSite=Lax';",
  "document.cookie = 'decolashop_af=' + clean + '; max-age=' + d + '; expires=' + exp + '; path=/; domain=.decolashop.com; SameSite=Lax' + sec;"
);

fs.writeFileSync('src/app/layout.tsx', code, 'utf-8');
console.log('src/app/layout.tsx patched successfully!');
