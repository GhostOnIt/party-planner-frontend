import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse, LoginFormData } from '@/types';

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);

      // Redirection après connexion : priorité à l’URL sauvegardée (déconnexion 401), puis state React, puis dashboard
      let redirectTo = '/dashboard';
      try {
        const saved = sessionStorage.getItem('redirect_after_login');
        if (saved && saved !== '/login') {
          redirectTo = saved;
          sessionStorage.removeItem('redirect_after_login');
        } else {
          const state = location.state as { from?: { pathname?: string } } | null;
          if (state?.from?.pathname) redirectTo = state.from.pathname;
        }
      } catch {
        const state = location.state as { from?: { pathname?: string } } | null;
        if (state?.from?.pathname) redirectTo = state.from.pathname;
      }

      navigate(redirectTo, { replace: true });
    },
  });
}
