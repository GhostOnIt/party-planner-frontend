import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type { Collaboration } from '@/types';

interface CollaborationsResponse {
  data: Collaboration[];
  collaborations?: Collaboration[];
}

// List all collaborations (events where user is collaborator)
export function useCollaborations() {
  return useQuery({
    queryKey: ['user', 'collaborations'],
    queryFn: async (): Promise<Collaboration[]> => {
      const response = await api.get<CollaborationsResponse | Collaboration[]>('/user/collaborations');
      const responseData = response.data;

      // Handle array response
      if (Array.isArray(responseData)) {
        return responseData;
      }

      // Handle { collaborations: [...] } response
      if (responseData && 'collaborations' in responseData) {
        return responseData.collaborations || [];
      }

      // Handle { data: [...] } response
      if (responseData && 'data' in responseData) {
        return responseData.data || [];
      }

      return [];
    },
  });
}

// Leave a collaboration
export function useLeaveCollaboration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: number) => {
      await api.delete(`/user/collaborations/${eventId}`);
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'collaborations'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
