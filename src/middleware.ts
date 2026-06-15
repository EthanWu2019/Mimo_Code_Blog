import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================
// Middleware for Mimo_Code_Blog
// Runs on every request before it reaches the route handler.
// ============================================================

// --- 1. In-memory rate limiter (per-isolate, good for dev/single-region) ---
// For multi-region production, swap with Redis/KV.
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60;       // 60 requests per minute per IP
const API_RATE_LIMIT_MAX = 30;   // 30 API requests per minute per IP

function checkRateLimit(ip: string, limit: number): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const key of Array.from(rateLimit.keys())) {
      const val = rateLimit.get(key)!;
      if (now > val.resetAt) rateLimit.delete(key);
    }
  }, 300_000);
}

// --- 2. Bot detection ---
const BLOCKED_BOTS = [
  'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'blexbot',
  'screaming frog', 'crawlbot', 'bytespider', 'gptbot',
  'chatgpt-user', 'ccbot', 'anthropic', 'claudebot',
  'cohere-ai', 'meta-externalagent', 'facebookbot',
];

const ALLOWED_BOTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot',
  'baiduspider', 'yandexbot', 'applebot',
];

function isBlockedBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  // Allow good bots (SEO)
  if (ALLOWED_BOTS.some(b => lower.includes(b))) return false;
  // Block scrapers and AI crawlers
  return BLOCKED_BOTS.some(b => lower.includes(b));
}

// --- 3. Security headers ---
function securityHeaders(headers: Headers): void {
  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');
  // Prevent MIME sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  // XSS protection (legacy browsers)
  headers.set('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Permissions policy — disable unused browser features
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  // Strict transport security (1 year, include subdomains)
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Content Security Policy
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.neon.tech wss://*.neon.tech",
      "frame-ancestors 'none'",
    ].join('; ')
  );
}

// --- 4. Cache headers ---
function cacheHeaders(path: string, headers: Headers): void {
  // Static assets (images, fonts, css, js) — cache 1 year
  if (/\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|otf|css|js)$/.test(path)) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Next.js static chunks — cache 1 year
  else if (path.startsWith('/_next/static/')) {
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // API routes — no cache (dynamic)
  else if (path.startsWith('/api/')) {
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  // HTML pages — revalidate every 60s (stale-while-revalidate)
  else {
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  }
}

// --- 5. Request logging ---
function logRequest(req: NextRequest, startTime: number, status: number): void {
  const duration = Date.now() - startTime;
  const method = req.method;
  const path = req.nextUrl.pathname;
  const ua = req.headers.get('user-agent')?.substring(0, 60) || 'unknown';

  // Only log API routes and page navigations (not static assets)
  if (path.startsWith('/api/') || (!path.startsWith('/_next/') && !path.includes('.'))) {
    const emoji = status >= 400 ? '❌' : status >= 300 ? '↗️' : '✅';
    console.log(`${emoji} ${method} ${path} ${status} ${duration}ms | ${ua}`);
  }
}

// ============================================================
// Main middleware
// ============================================================
export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1';
  const ua = request.headers.get('user-agent') || '';

  // --- Block bad bots ---
  if (isBlockedBot(ua)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // --- Rate limiting ---
  const isApi = pathname.startsWith('/api/');
  const limit = isApi ? API_RATE_LIMIT_MAX : RATE_LIMIT_MAX;
  if (!checkRateLimit(ip, limit)) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests. Please slow down.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
    );
  }

  // --- Proceed with response ---
  const response = NextResponse.next();

  // --- Apply headers ---
  securityHeaders(response.headers);
  cacheHeaders(pathname, response.headers);

  // --- Log request ---
  logRequest(request, startTime, 200);

  return response;
}

// --- Matcher: only run on non-static paths ---
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
