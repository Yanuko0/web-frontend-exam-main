const crypto = require('crypto');
const fontLoaderScript = require('./src/fontLoaderScript');

// Only the dev server (hot reload) is relaxed; any other NODE_ENV (production,
// staging, test...) gets the strict policy.
const isDev = process.env.NODE_ENV === 'development';

// The single inline script (the font loader) is allowed by its hash, so
// 'unsafe-inline' is not needed for scripts in production.
const fontScriptHash = `'sha256-${crypto.createHash('sha256').update(fontLoaderScript).digest('base64')}'`;

// Content Security Policy.
// - Scripts: same origin plus the hash above. (Next.js' __NEXT_DATA__ is a JSON data
//   block, not executable, so it is not subject to script-src.)
// - Styles: emotion/MUI and styled-jsx inject <style> tags, hence 'unsafe-inline'.
// - connect-src is 'self' on purpose: the browser only talks to this site's own API
//   (the data is proxied by src/pages/api), never to a third-party API directly.
// - img-src allows any https host because job photos are provided by the API.
const contentSecurityPolicy = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : `script-src 'self' ${fontScriptHash}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // HSTS pins the browser to HTTPS for this host, so it is only sent outside development
  // and without includeSubDomains/preload (add those deliberately once every subdomain
  // is known to serve HTTPS).
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this project (a lockfile elsewhere on the machine confuses detection).
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  // Locale-prefixed URLs (/en, /ja; zh-TW is the unprefixed default). Next.js reads
  // the Accept-Language header on "/" and redirects to the best match, and then
  // remembers the choice in the NEXT_LOCALE cookie. Keep in sync with src/i18n/config.js.
  i18n: {
    locales: ['zh-TW', 'en', 'ja'],
    defaultLocale: 'zh-TW',
    // Browser-language detection on '/' is on by default (Next.js 15 only accepts `false` here).
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // Linting runs separately with `yarn lint` (Airbnb).
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
