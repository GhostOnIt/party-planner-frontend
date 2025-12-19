import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type {
  Collaborator,
  CollaboratorFilters,
  InviteCollaboratorFormData,
  CollaboratorRole,
} from '@/types';

// API response type
interface CollaboratorsApiResponse {
  data: Collaborator[];
  collaborators?: Collaborator[];
}

// Fetch collaborators list
export function useCollaborators(eventId: string, filters: CollaboratorFilters = {}) {
  return useQuery({
    queryKey: ['events', eventId, 'collaborators', filters],
    queryFn: async () => {
      const response = await api.get<CollaboratorsApiResponse | Collaborator[]>(
        `/events/${eventId}/collaborators`,
        { params: filters }
      );

      const responseData = response.data;

      // Handle array response: [...]
      if (Array.isArray(responseData)) {
        return { data: responseData };
      }

      // Handle { collaborators: [...] } response
      if (responseData && 'collaborators' in responseData) {
        return { data: responseData.collaborators || [] };
      }

      // Handle { data: [...] } response
      if (responseData && 'data' in responseData) {
        return responseData;
      }

      // Fallback
      return { data: [] };
    },
    enabled: !!eventId,
  });
}

// Invite a collaborator
export function useInviteCollaborator(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteCollaboratorFormData) => {
      const response = await api.post<Collaborator>(
        `/events/${eventId}/collaborators`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'collaborators'] });
    },
  });
}

// Update collaborator role
export function useUpdateCollaborator(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      collaboratorId,
      userId,
      role,
    }: {
      collaboratorId: number;
      userId?: number;
      role: CollaboratorRole;
    }) => {
      // Use userId for the route (backend expects user id)
      const userIdParam = userId || collaboratorId;
      const response = await api.put<Collaborator>(
        `/events/${eventId}/collaborators/${userIdParam}`,
        { role }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'collaborators'] });
    },
  });
}

// Remove collaborator
export function useRemoveCollaborator(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      // Backend expects user id, not collaborator id
      await api.delete(`/events/${eventId}/collaborators/${userId}`);
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'collaborators'] });
    },
  });
}

// Resend invitation
export function useResendInvitation(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      // Backend expects user id and route is /resend (not /resend-invitation)
      const response = await api.post(
        `/events/${eventId}/collaborators/${userId}/resend`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'collaborators'] });
    },
  });
}

// Leave event (for collaborator to remove themselves)
export function useLeaveEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(`/events/${eventId}/collaborators/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
