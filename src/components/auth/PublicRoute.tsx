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
    // Respect ?redirect= param (e.g. after login from /invite/{token} flow)
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get('redirect');
    const resolved = resolveRedirect(redirectParam);
    if (resolved) {
      return <Navigate to={resolved} replace />;
    }

    const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
