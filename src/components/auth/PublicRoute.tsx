import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

function isValidRedirect(path: string | null): boolean {
  if (!path || typeof path !== 'string') return false;
  if (path.includes('//') || path.includes(':')) return false;
  return path.startsWith('/');
}

// /invite/{token} → /invitations (list page)
function resolveRedirect(path: string | null): string | null {
  if (!path || !isValidRedirect(path)) return path;
  if (path.startsWith('/invite/')) return '/invitations';
  return path;
}

export function PublicRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    // 1. Check ?redirect= URL param (e.g. /login?redirect=/event-created-for-you/xxx)
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get('redirect');
    const resolvedFromParam = resolveRedirect(redirectParam);
    if (resolvedFromParam) {
      return <Navigate to={resolvedFromParam} replace />;
    }

    // 2. Check location.state.redirect (e.g. /verify-otp state carries redirect from useLogin)
    const stateRedirect = (location.state as { redirect?: string } | null)?.redirect;
    const resolvedFromState = resolveRedirect(stateRedirect ?? null);
    if (resolvedFromState) {
      return <Navigate to={resolvedFromState} replace />;
    }

    // 3. Check sessionStorage (set by EventCreatedForYouPage / InviteByTokenPage before redirect)
    try {
      const saved = sessionStorage.getItem('redirect_after_login');
      if (saved && saved !== '/login') {
        const resolvedFromStorage = resolveRedirect(saved);
        if (resolvedFromStorage) {
          sessionStorage.removeItem('redirect_after_login');
          sessionStorage.removeItem('redirect_email');
          return <Navigate to={resolvedFromStorage} replace />;
        }
      }
    } catch {
      // ignore
    }

    // 4. Fallback: location.state.from (PrivateRoute redirect) or dashboard
    const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
