import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import { getCollaboratorPermissions } from '@/utils/collaboratorPermissions';
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
      roles,
    }: {
      collaboratorId: number;
      userId?: number;
      roles: CollaboratorRole[];
    }) => {
      // Use userId for the route (backend expects user id)
      const userIdParam = userId || collaboratorId;
      const response = await api.put<Collaborator>(
        `/events/${eventId}/collaborators/${userIdParam}`,
        { roles }
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

// Get current user permissions for an event
// Get current user permissions for an event
export function useCurrentUserPermissions(eventId: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['events', eventId, 'user-permissions', user?.id],
    queryFn: async () => {
      // This could be a separate API endpoint, but for now we'll use the collaborators data
      const collaboratorsResponse = await api.get(`/events/${eventId}/collaborators`);
      const collaborators = collaboratorsResponse.data?.data || collaboratorsResponse.data?.collaborators || collaboratorsResponse.data || [];

      // Check if user is in collaborators list
      const userCollaborator = collaborators.find((c: any) => c.user_id === user?.id);

      if (userCollaborator) {
        return getCollaboratorPermissions(userCollaborator);
      }

      // If user is not in collaborators list, they might be the owner
      // For now, assume they have owner permissions if they can access this endpoint
      return {
        canManage: true,
        canInvite: true,
        canEditRoles: true,
        canRemoveCollaborators: true,
        canCreateCustomRoles: true,
        canView: true,
        canEdit: true,
        canDelete: true,
        isOwner: true,
        isCoordinator: false,
        effectiveRole: 'Propriétaire',
        effectiveRoleColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      };
    },
    enabled: !!eventId && !!user?.id,
  });
}

// Get user permissions for an event (new unified hook)
export function useEventPermissions(eventId: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['events', eventId, 'permissions', user?.id],
    queryFn: async (): Promise<{
      permissions: string[];
      role: string;
      is_owner: boolean;
      user_permissions: {
        canManage: boolean;
        canInvite: boolean;
        canEditRoles: boolean;
        canRemoveCollaborators: boolean;
        canCreateCustomRoles: boolean;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        isOwner: boolean;
        isCoordinator: boolean;
        effectiveRole: string;
      };
    }> => {
      try {
        // Try to use the dedicated permissions endpoint
        const response = await api.get(`/events/${eventId}/permissions`);
        return response.data;
      } catch (error) {
        // Fallback to the old method using collaborators
        const collaboratorsResponse = await api.get(`/events/${eventId}/collaborators`);
        const collaborators = collaboratorsResponse.data?.data || collaboratorsResponse.data?.collaborators || collaboratorsResponse.data || [];

        const userCollaborator = collaborators.find((c: any) => c.user_id === user?.id);

        if (userCollaborator) {
          const userPermissions = getCollaboratorPermissions(userCollaborator);
          return {
            permissions: [], // Will be populated when backend endpoint is ready
            role: userPermissions.effectiveRole,
            is_owner: userPermissions.isOwner,
            user_permissions: userPermissions,
          };
        }

        // Owner permissions
        const ownerPermissions = {
          canManage: true,
          canInvite: true,
          canEditRoles: true,
          canRemoveCollaborators: true,
          canCreateCustomRoles: true,
          canView: true,
          canEdit: true,
          canDelete: true,
          isOwner: true,
          isCoordinator: false,
          effectiveRole: 'Propriétaire',
        };

        return {
          permissions: [], // Will be populated when backend endpoint is ready
          role: 'Propriétaire',
          is_owner: true,
          user_permissions: ownerPermissions,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!eventId && !!user?.id,
  });
}

// Get available roles for assignment
export function useAvailableRoles() {
  return useQuery({
    queryKey: ['roles', 'available'],
    queryFn: async () => {
      const response = await api.get<{ roles: Array<{
        value: string;
        label: string;
        description: string;
        color: string;
        icon: string;
      }> }>('/roles/available');

      return response.data;
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
