import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse, RegisterFormData } from '@/types';

function isValidRedirect(path: string | null): boolean {
  if (!path || typeof path !== 'string') return false;
  if (path.includes('//') || path.includes(':')) return false;
  return path.startsWith('/invite/') || path.startsWith('/');
}

// When redirect is /invite/{token}, we go to /invitations (list page) instead
function resolveRedirect(path: string | null): string | null {
  if (!path || !isValidRedirect(path)) return path;
  if (path.startsWith('/invite/')) return '/invitations';
  return path;
}

export function useRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);

      // Same redirect logic as login: 1) sessionStorage, 2) ?redirect=, 3) state, 4) dashboard
      let redirectTo = '/dashboard';
      try {
        const saved = sessionStorage.getItem('redirect_after_login');
        if (saved && saved !== '/login') {
          const resolved = resolveRedirect(saved);
          if (resolved) {
            redirectTo = resolved;
            sessionStorage.removeItem('redirect_after_login');
          }
        }
        if (redirectTo === '/dashboard') {
          const params = new URLSearchParams(location.search);
          const redirectParam = params.get('redirect');
          const resolved = resolveRedirect(redirectParam);
          if (resolved) redirectTo = resolved;
        }
        if (redirectTo === '/dashboard') {
          const state = location.state as { from?: { pathname?: string } } | null;
          if (state?.from?.pathname) redirectTo = state.from.pathname;
        }
      } catch {
        const params = new URLSearchParams(location.search);
        const redirectParam = params.get('redirect');
        const resolved = resolveRedirect(redirectParam);
        if (resolved) redirectTo = resolved;
        if (redirectTo === '/dashboard') {
          const state = location.state as { from?: { pathname?: string } } | null;
          if (state?.from?.pathname) redirectTo = state.from.pathname;
        }
      }

      navigate(redirectTo, { replace: true });
    },
  });
}
