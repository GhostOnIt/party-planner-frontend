import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import { resolveRedirectAfterLogin } from '@/lib/authRedirect';
import type { AuthResponse, OtpRequiredResponse } from '@/types';

interface UseAuthMutationOptions {
  endpoint: string;
  /** Inclure remember_me dans le state passé à /verify-otp (cas du login) */
  includeRememberMe?: boolean;
}

/**
 * Hook commun aux mutations /auth/login et /auth/register.
 * Gère :
 *  - L'appel API
 *  - Le branchement OTP si le backend exige une 2FA
 *  - Le calcul de la redirection post-auth (sessionStorage > query > router state > /dashboard)
 *  - La persistance du token via le store auth
 */
export function useAuthMutation<TData>({ endpoint, includeRememberMe = false }: UseAuthMutationOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: TData) => {
      const response = await api.post<AuthResponse | OtpRequiredResponse>(endpoint, data);
      return response.data;
    },
    onSuccess: (data) => {
      const redirectTo = resolveRedirectAfterLogin(location);

      if ('requires_otp' in data && data.requires_otp) {
        const otpData = data as OtpRequiredResponse;
        navigate('/verify-otp', {
          replace: true,
          state: {
            identifier: otpData.identifier,
            type: 'login' as const,
            channel: otpData.channel,
            otp_id: otpData.otp_id,
            redirect: redirectTo,
            ...(includeRememberMe && { remember_me: otpData.remember_me ?? false }),
          },
        });
        return;
      }

      const authData = data as AuthResponse;
      setAuth(authData.user, authData.token);
      navigate(redirectTo, { replace: true });
    },
  });
}
