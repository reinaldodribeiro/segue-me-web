/**
 * Syncs the auth token to a client-accessible cookie so that Next.js
 * Edge Middleware can read it and redirect unauthenticated requests
 * before the page renders.
 *
 * This is intentionally NOT an HttpOnly cookie — the middleware needs
 * to read it on the server side, and the client manages the lifecycle
 * (set on login, clear on logout).
 *
 * TTL matches a reasonable session window (7 days).
 */

const COOKIE_NAME = 'authToken';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export function syncAuthCookie(token: string | null): void {
  if (typeof document === 'undefined') return;
  if (token) {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; SameSite=Strict; max-age=${MAX_AGE}`;
  } else {
    document.cookie = `${COOKIE_NAME}=; path=/; SameSite=Strict; max-age=0`;
  }
}
