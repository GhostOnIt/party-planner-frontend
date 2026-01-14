import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type { CustomRole, PermissionModule, CustomRoleFormData } from '@/types';

// Fetch custom roles for an event
export function useCustomRoles(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'roles'],
    queryFn: async () => {
      const response = await api.get<{ roles: CustomRole[] }>(
        `/events/${eventId}/roles`
      );
      return response.data;
    },
    enabled: !!eventId,
  });
}

// Fetch permissions
export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await api.get<{ permissions: PermissionModule[] }>(
        '/permissions'
      );
      return response.data;
    },
  });
}

// Create custom role
export function useCreateCustomRole(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CustomRoleFormData) => {
      const response = await api.post<CustomRole>(
        `/events/${eventId}/roles`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'collaborators'] });
    },
  });
}

// Update custom role
export function useUpdateCustomRole(eventId: string, roleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CustomRoleFormData>) => {
      const response = await api.put<CustomRole>(
        `/events/${eventId}/roles/${roleId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'collaborators'] });
    },
  });
}

// Delete custom role
export function useDeleteCustomRole(eventId: string, roleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/events/${eventId}/roles/${roleId}`);
      return roleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'collaborators'] });
    },
  });
}
