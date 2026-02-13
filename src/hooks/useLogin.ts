import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse, LoginFormData, OtpRequiredResponse } from '@/types';

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

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await api.post<AuthResponse | OtpRequiredResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      if ('requires_otp' in data && data.requires_otp) {
        const otpData = data as OtpRequiredResponse;
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
        navigate('/verify-otp', {
          replace: true,
          state: {
            identifier: otpData.identifier,
            type: 'login' as const,
            channel: otpData.channel,
            otp_id: otpData.otp_id,
            redirect: redirectTo,
            remember_me: otpData.remember_me ?? false,
          },
        });
        return;
      }

      const authData = data as AuthResponse;
      setAuth(authData.user, authData.token);

      // Redirection après connexion : priorité à l’URL sauvegardée (déconnexion 401), puis state React, puis dashboard
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
