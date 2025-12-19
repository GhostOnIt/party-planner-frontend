import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type { Invitation } from '@/types';

interface InvitationsResponse {
  data: Invitation[];
  invitations?: Invitation[];
}

// List all received collaboration invitations
export function useInvitations() {
  return useQuery({
    queryKey: ['user', 'invitations'],
    queryFn: async (): Promise<Invitation[]> => {
      const response = await api.get<InvitationsResponse | Invitation[]>('/user/invitations');
      const responseData = response.data;

      // Handle array response
      if (Array.isArray(responseData)) {
        return responseData;
      }

      // Handle { invitations: [...] } response
      if (responseData && 'invitations' in responseData) {
        return responseData.invitations || [];
      }

      // Handle { data: [...] } response
      if (responseData && 'data' in responseData) {
        return responseData.data || [];
      }

      return [];
    },
  });
}

// Get pending invitations count
export function usePendingInvitationsCount() {
  return useQuery({
    queryKey: ['invitations', 'pending-count'],
    queryFn: async (): Promise<number> => {
      const response = await api.get('/invitations/pending-count');
      const responseData = response.data;

      if (typeof responseData === 'number') {
        return responseData;
      }
      if (responseData && 'count' in responseData) {
        return responseData.count;
      }

      return 0;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

// Accept invitation
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: number) => {
      const response = await api.post(`/user/invitations/${invitationId}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'collaborations'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// Reject invitation
export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: number) => {
      const response = await api.post(`/user/invitations/${invitationId}/reject`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'invitations'] });
    },
  });
}
