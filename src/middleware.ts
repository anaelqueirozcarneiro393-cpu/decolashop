import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { isSqlInjectionAttempt, isXssAttempt } from "@/lib/security";

// Maximum upload/payload size: 5MB (in bytes)
const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB

// In-Memory Rate Limiter (Sliding Window per IP)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

// Clean up expired IP entries every 2 minutes to prevent memory leaks
function cleanupRateLimits() {
  const now = Date.now();
  if (now - lastCleanup > 120_000) {
    for (const [ip, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
    lastCleanup = now;
  }
}

function checkRateLimit(ip: string, isApiRoute: boolean): { allowed: boolean; remaining: number; reset: number } {
  cleanupRateLimits();
  const now = Date.now();
  const windowMs = 60_000; // 1 minute window

  // Sensitive API routes (Auth, Checkout, Webhooks): max 30 req/min
  // General routes: max 120 req/min
  const maxRequests = isApiRoute ? 30 : 120;

  const key = `${ip}:${isApiRoute ? 'api' : 'web'}`;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, reset: Math.ceil((now + windowMs) / 1000) };
  }

  current.count++;
  if (current.count > maxRequests) {
    return { allowed: false, remaining: 0, reset: Math.ceil(current.resetTime / 1000) };
  }

  return { allowed: true, remaining: maxRequests - current.count, reset: Math.ceil(current.resetTime / 1000) };
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. MAXIMUM PAYLOAD SIZE CHECK (5MB LIMIT)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
    return NextResponse.json(
      {
        error: "Payload Too Large: O limite máximo para qualquer requisição ou arquivo é de 5MB.",
        maxSize: "5MB",
        status: 413
      },
      { status: 413 }
    );
  }

  // 2. SQL INJECTION & XSS ATTACK DETECTION IN URL & QUERY PARAMS
  const fullTarget = `${pathname}${search}`;
  if (isSqlInjectionAttempt(fullTarget) || isXssAttempt(search)) {
    console.warn(`[SECURITY ALERT] Tentativa de injeção bloqueada no IP: ${request.headers.get('x-forwarded-for') || 'desconhecido'} - URL: ${fullTarget}`);
    return NextResponse.json(
      {
        error: "Acesso bloqueado por segurança: assinatura suspeita de SQL Injection ou script malicioso detectada.",
        status: 403
      },
      { status: 403 }
    );
  }

  // 3. DDOS & FLOOD PROTECTION (RATE LIMITING)
  const isApiRoute = pathname.startsWith("/api/");
  const clientIp = 
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "127.0.0.1";

  const rateCheck = checkRateLimit(clientIp, isApiRoute);
  if (!rateCheck.allowed) {
    console.warn(`[DDOS / RATE LIMIT] IP ${clientIp} excedeu o limite de requisições em ${pathname}`);
    return NextResponse.json(
      {
        error: "Muitas requisições (Rate Limit Excedido). Proteção anti-DDoS ativa. Aguarde 60 segundos.",
        status: 429
      },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": isApiRoute ? "30" : "120",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateCheck.reset.toString(),
        }
      }
    );
  }

  // 4. SUPABASE SESSION UPDATE
  let response = await updateSession(request);
  if (!response) {
    response = NextResponse.next();
  }

  // 5. ESSENTIAL SECURITY HEADERS
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  
  // Rate limit tracking headers
  response.headers.set("X-RateLimit-Limit", isApiRoute ? "30" : "120");
  response.headers.set("X-RateLimit-Remaining", rateCheck.remaining.toString());

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
