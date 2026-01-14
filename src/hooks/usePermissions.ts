import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

export interface EventPermissions {
  permissions: string[];
  role: string;
  is_owner: boolean;
  can_manage: boolean;
  can_invite: boolean;
  can_edit_roles: boolean;
  can_remove_collaborators: boolean;
  can_create_custom_roles: boolean;
}

// Hook général pour récupérer les permissions d'un utilisateur sur un événement
export function useEventPermissions(eventId: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['events', eventId, 'permissions', user?.id],
    queryFn: async (): Promise<EventPermissions> => {
      const response = await api.get<EventPermissions>(`/events/${eventId}/permissions`);
      return response.data;
    },
    enabled: !!eventId && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook spécialisé pour les permissions des invités
export function useGuestsPermissions(eventId: string) {
  const { data: permissions } = useEventPermissions(eventId);


  return {
    canView: permissions?.permissions?.includes('guests.view') || false,
    canCreate: permissions?.permissions?.includes('guests.create') || false,
    canEdit: permissions?.permissions?.includes('guests.edit') || false,
    canDelete: permissions?.permissions?.includes('guests.delete') || false,
    canImport: permissions?.permissions?.includes('guests.import') || false,
    canExport: permissions?.permissions?.includes('guests.export') || false,
    canSendInvitations: permissions?.permissions?.includes('guests.send_invitations') || false,
    canCheckIn: permissions?.permissions?.includes('guests.checkin') || false,
    hasAnyPermission: permissions?.permissions?.some((p) => p.startsWith('guests.')) || false,
  };
}

// Hook spécialisé pour les permissions des tâches
export function useTasksPermissions(eventId: string) {
  const { data: permissions } = useEventPermissions(eventId);

  return {
    canView: permissions?.permissions?.includes('tasks.view') || false,
    canCreate: permissions?.permissions?.includes('tasks.create') || false,
    canEdit: permissions?.permissions?.includes('tasks.edit') || false,
    canDelete: permissions?.permissions?.includes('tasks.delete') || false,
    canAssign: permissions?.permissions?.includes('tasks.assign') || false,
    canComplete: permissions?.permissions?.includes('tasks.complete') || false,
    hasAnyPermission: permissions?.permissions?.some((p) => p.startsWith('tasks.')) || false,
  };
}

// Hook spécialisé pour les permissions du budget
export function useBudgetPermissions(eventId: string) {
  const { data: permissions } = useEventPermissions(eventId);

  return {
    canView: permissions?.permissions?.includes('budget.view') || false,
    canCreate: permissions?.permissions?.includes('budget.create') || false,
    canEdit: permissions?.permissions?.includes('budget.edit') || false,
    canDelete: permissions?.permissions?.includes('budget.delete') || false,
    canExport: permissions?.permissions?.includes('budget.export') || false,
    hasAnyPermission: permissions?.permissions?.some((p) => p.startsWith('budget.')) || false,
  };
}

// Hook spécialisé pour les permissions des photos
export function usePhotosPermissions(eventId: string) {
  const { data: permissions } = useEventPermissions(eventId);

  return {
    canView: permissions?.permissions?.includes('photos.view') || false,
    canUpload: permissions?.permissions?.includes('photos.upload') || false,
    canDelete: permissions?.permissions?.includes('photos.delete') || false,
    canSetFeatured: permissions?.permissions?.includes('photos.set_featured') || false,
    hasAnyPermission: permissions?.permissions?.some((p) => p.startsWith('photos.')) || false,
  };
}

// Hook spécialisé pour les permissions des collaborateurs
export function useCollaboratorsPermissions(eventId: string) {
  const { data: permissions } = useEventPermissions(eventId);

  return {
    canView: permissions?.permissions?.includes('collaborators.view') || false,
    canInvite: permissions?.permissions?.includes('collaborators.invite') || false,
    canEditRoles: permissions?.permissions?.includes('collaborators.edit_roles') || false,
    canRemove: permissions?.permissions?.includes('collaborators.remove') || false,
    canManage: permissions?.can_manage || false,
    canCreateCustomRoles: permissions?.can_create_custom_roles || false,
    isOwner: permissions?.is_owner || false,
    hasAnyPermission:
      permissions?.permissions?.some((p) => p.startsWith('collaborators.')) || false,
  };
}
