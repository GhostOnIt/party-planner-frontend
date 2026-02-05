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

      // If the user was redirected to /login from a protected route,
      // return them to that route after successful login.
      const state = location.state as { from?: Location } | null;
      const redirectTo = state?.from?.pathname || '/dashboard';

      navigate(redirectTo, { replace: true });
    },
  });
}
