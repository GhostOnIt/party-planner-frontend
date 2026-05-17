import type { Location } from 'react-router-dom';

export function isValidRedirect(path: string | null): boolean {
  if (!path || typeof path !== 'string') return false;
  if (path.includes('//') || path.includes(':')) return false;
  return path.startsWith('/invite/') || path.startsWith('/');
}

// When redirect is /invite/{token}, we go to /invitations (list page) instead
export function resolveRedirect(path: string | null): string | null {
  if (!path || !isValidRedirect(path)) return path;
  if (path.startsWith('/invite/')) return '/invitations';
  return path;
}

/**
 * Resolves the post-auth redirect path with priority:
 *   1. sessionStorage `redirect_after_login` (set by 401 interceptor)
 *   2. ?redirect= query param
 *   3. location.state.from.pathname (router redirect)
 *   4. /dashboard fallback
 *
 * Clears the sessionStorage entry once consumed.
 */
export function resolveRedirectAfterLogin(location: Location): string {
  let redirectTo = '/dashboard';

  try {
    const saved = sessionStorage.getItem('redirect_after_login');
    if (saved && saved !== '/login') {
      const resolved = resolveRedirect(saved);
      if (resolved) {
        redirectTo = resolved;
        sessionStorage.removeItem('redirect_after_login');
        sessionStorage.removeItem('redirect_email');
      }
    }
  } catch {
    // sessionStorage indisponible : on tombe sur les fallbacks ci-dessous
  }

  if (redirectTo === '/dashboard') {
    const params = new URLSearchParams(location.search);
    const resolved = resolveRedirect(params.get('redirect'));
    if (resolved) redirectTo = resolved;
  }

  if (redirectTo === '/dashboard') {
    const state = location.state as { from?: { pathname?: string } } | null;
    if (state?.from?.pathname) redirectTo = state.from.pathname;
  }

  return redirectTo;
}
