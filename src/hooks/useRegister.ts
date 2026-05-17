import { useAuthMutation } from './useAuthMutation';
import type { RegisterFormData } from '@/types';

export function useRegister() {
  return useAuthMutation<RegisterFormData>({ endpoint: '/auth/register' });
}
