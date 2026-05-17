import { useAuthMutation } from './useAuthMutation';
import type { LoginFormData } from '@/types';

export function useLogin() {
  return useAuthMutation<LoginFormData>({ endpoint: '/auth/login', includeRememberMe: true });
}
