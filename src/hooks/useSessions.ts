import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';

export interface UserSession {
  id: string;
  device: string;
  user_agent: string | null;
  ip_address: string | null;
  last_used_at: string | null;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

export function useSessions() {
  return useQuery({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      const response = await api.get<{ data: UserSession[] }>('/user/sessions');
      return response.data.data;
    },
  });
}

interface RevokeSessionResponse {
  message: string;
  current_session_revoked?: boolean;
}

export function useRevokeSession(options?: {
  onCurrentSessionRevoked?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.delete<RevokeSessionResponse>(
        `/user/sessions/${sessionId}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      if (data.current_session_revoked && options?.onCurrentSessionRevoked) {
        options.onCurrentSessionRevoked();
      }
    },
  });
}

interface RevokeOthersResponse {
  message: string;
  revoked_count: number;
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<RevokeOthersResponse>(
        '/user/sessions/revoke-others'
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
    },
  });
}
