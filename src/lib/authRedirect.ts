/**
 * Authentication Redirect URL Helper
 *
 * Environment-aware helper that determines the exact OAuth redirect destination:
 * - Production: uses the current deployed website origin (window.location.origin),
 *   or the configured VITE_APP_URL / VITE_SITE_URL environment variable.
 * - Local Development: uses http://localhost:3000 (or current localhost origin).
 *
 * This guarantees the application never forces localhost in production while
 * ensuring seamless local development support.
 */

export const getAuthRedirectUrl = (): string => {
  // 1. Explicitly configured production or custom application URL
  const envUrl =
    import.meta.env.VITE_APP_URL ||
    import.meta.env.VITE_SITE_URL ||
    (typeof process !== 'undefined' && process.env?.APP_URL);

  // If a valid HTTP(S) URL is configured in environment
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().startsWith('http')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // 2. Dynamic browser location origin (works for deployed Cloud Run, custom domain, or localhost)
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (origin && origin !== 'null' && origin.startsWith('http')) {
      return origin.replace(/\/+$/, '');
    }
  }

  // 3. Fallback default for local development
  return 'http://localhost:3000';
};
