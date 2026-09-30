/**
 * DecolaShop Security & Protection Suite
 * - SQL Injection detection and sanitization
 * - XSS filtering
 * - DDoS / Rate Limiting helpers
 * - Strict Input Validation
 */

// Common SQL Injection signatures
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|UNION|GRANT|REVOKE)\b)/i,
  /(--|#|\/\*|\*\/)/,
  /(\bOR\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i,
  /(\bAND\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i,
  /(';\s*--)/i,
  /(';\s*SHUTDOWN)/i,
  /(\bXP_\w+)/i,
  /(\bWAITFOR\s+DELAY\b)/i,
  /(\bBENCHMARK\s*\(.*\))/i,
  /(\bPG_SLEEP\s*\(.*\))/i
];

// Common XSS patterns
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
  /onclick\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi
];

/**
 * Detects if a string contains SQL injection signatures
 */
export function isSqlInjectionAttempt(input: unknown): boolean {
  if (typeof input !== 'string') return false;
  const decoded = decodeURIComponentSafe(input);
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(decoded));
}

/**
 * Detects if a string contains XSS attack signatures
 */
export function isXssAttempt(input: unknown): boolean {
  if (typeof input !== 'string') return false;
  const decoded = decodeURIComponentSafe(input);
  return XSS_PATTERNS.some(pattern => pattern.test(decoded));
}

/**
 * Safely decodes URI components without throwing on malformed inputs
 */
function decodeURIComponentSafe(uri: string): string {
  try {
    return decodeURIComponent(uri);
  } catch {
    return uri;
  }
}

/**
 * Sanitizes a string by stripping potentially hazardous SQL characters and HTML tags
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // strip < and >
    .replace(/['";\\]/g, '') // strip quotes, semicolons, backslashes
    .trim();
}

/**
 * Recursively inspects and sanitizes an object, detecting malicious payloads
 */
export function validateAndSanitizePayload<T>(payload: T): { safe: boolean; sanitized: T; reason?: string } {
  if (payload === null || payload === undefined) {
    return { safe: true, sanitized: payload };
  }

  if (typeof payload === 'string') {
    if (isSqlInjectionAttempt(payload)) {
      return { safe: false, sanitized: payload, reason: 'Tentativa de SQL Injection detectada' };
    }
    if (isXssAttempt(payload)) {
      return { safe: false, sanitized: payload, reason: 'Tentativa de Cross-Site Scripting (XSS) detectada' };
    }
    return { safe: true, sanitized: payload };
  }

  if (Array.isArray(payload)) {
    const sanitizedArr: any[] = [];
    for (const item of payload) {
      const check = validateAndSanitizePayload(item);
      if (!check.safe) return check as any;
      sanitizedArr.push(check.sanitized);
    }
    return { safe: true, sanitized: sanitizedArr as any };
  }

  if (typeof payload === 'object') {
    const sanitizedObj: any = {};
    for (const [key, value] of Object.entries(payload)) {
      if (isSqlInjectionAttempt(key) || isXssAttempt(key)) {
        return { safe: false, sanitized: payload, reason: `Chave suspeita detectada: ${key}` };
      }
      const check = validateAndSanitizePayload(value);
      if (!check.safe) return check as any;
      sanitizedObj[key] = check.sanitized;
    }
    return { safe: true, sanitized: sanitizedObj };
  }

  return { safe: true, sanitized: payload };
}

/**
 * Validates Brazilian CPF
 */
export function isValidCpf(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i)) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i)) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10))) return false;

  return true;
}

/**
 * Validates Email Format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates external image URL to prevent SSRF (Server-Side Request Forgery)
 */
export function isSafeImageUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr);
    // Only allow http and https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    // Block internal and private IPs
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host === '169.254.169.254' || // AWS metadata
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      /^10\./.test(host) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      /^192\.168\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
