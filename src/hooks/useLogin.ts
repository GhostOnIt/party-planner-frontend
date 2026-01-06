import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse, LoginFormData } from '@/types';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/useLogin.ts:13',message:'Login mutation - starting request',data:{email:data.email,hasPassword:!!data.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const response = await api.post<AuthResponse>('/auth/login', data);
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/useLogin.ts:16',message:'Login mutation - response received',data:{status:response.status,hasUser:!!response.data.user,hasToken:!!response.data.token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      return response.data;
    },
    onSuccess: (data) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/useLogin.ts:21',message:'Login mutation - onSuccess called',data:{hasUser:!!data.user,hasToken:!!data.token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      setAuth(data.user, data.token);
      navigate('/dashboard');
    },
    onError: (error) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'hooks/useLogin.ts:27',message:'Login mutation - onError called',data:{isAxiosError:error?.isAxiosError,status:error?.response?.status,message:error?.message,responseData:error?.response?.data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    },
  });
}
