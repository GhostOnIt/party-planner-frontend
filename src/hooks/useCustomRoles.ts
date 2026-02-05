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

// --- User-scoped custom roles (managed in Settings only) ---

/** Role shape returned by GET /settings/roles (system + custom) */
export interface SettingsRole {
  id: number | string;
  name: string;
  description?: string | null;
  color?: string;
  is_system: boolean;
  permissions: string[];
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * All roles for Settings table: system roles + user's custom roles.
 */
export function useSettingsRoles() {
  return useQuery({
    queryKey: ['settings', 'roles'],
    queryFn: async () => {
      const response = await api.get<{ roles: SettingsRole[] }>('/settings/roles');
      return response.data;
    },
  });
}

export function useUserCustomRoles() {
  return useQuery({
    queryKey: ['settings', 'custom-roles'],
    queryFn: async () => {
      const response = await api.get<{ roles: CustomRole[] }>('/settings/custom-roles');
      return response.data;
    },
  });
}

export function useCreateUserCustomRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CustomRoleFormData) => {
      const response = await api.post<{ role: CustomRole }>('/settings/custom-roles', data);
      return response.data.role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'custom-roles'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useUpdateUserCustomRole(roleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<CustomRoleFormData>) => {
      const response = await api.put<{ role: CustomRole }>(
        `/settings/custom-roles/${roleId}`,
        data
      );
      return response.data.role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'custom-roles'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteUserCustomRole(roleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/settings/custom-roles/${roleId}`);
      return roleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['settings', 'custom-roles'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
