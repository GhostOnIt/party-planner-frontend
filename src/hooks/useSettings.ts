import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { NotificationPreferences } from '@/types';

// Get notification preferences
export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const response = await api.get('/notifications/settings');
      return response.data.preferences as NotificationPreferences;
    },
  });
}

// Update notification preferences
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      const response = await api.put('/notifications/settings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });
}

// Event Types
export interface UserEventType {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEventTypeData {
  name: string;
  slug?: string;
  color?: string;
}

export interface UpdateEventTypeData extends CreateEventTypeData {
  order?: number;
}

export function useEventTypes() {
  return useQuery({
    queryKey: ['event-types'],
    queryFn: async () => {
      const response = await api.get('/settings/event-types');
      return response.data.data as UserEventType[];
    },
  });
}

export function useCreateEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEventTypeData) => {
      const response = await api.post('/settings/event-types', data);
      return response.data.data as UserEventType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
    },
  });
}

export function useUpdateEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateEventTypeData }) => {
      const response = await api.put(`/settings/event-types/${id}`, data);
      return response.data.data as UserEventType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
    },
  });
}

export function useDeleteEventType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/settings/event-types/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
    },
  });
}

export function useReorderEventTypes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: Array<{ id: number; order: number }>) => {
      const response = await api.post('/settings/event-types/reorder', { order });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-types'] });
    },
  });
}

// Collaborator Roles
export interface UserCollaboratorRole {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  is_default: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCollaboratorRoleData {
  name: string;
  slug?: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateCollaboratorRoleData extends CreateCollaboratorRoleData {
  order?: number;
}

export function useCollaboratorRoles() {
  return useQuery({
    queryKey: ['collaborator-roles'],
    queryFn: async () => {
      const response = await api.get('/settings/collaborator-roles');
      return response.data.data as UserCollaboratorRole[];
    },
  });
}

export function useCreateCollaboratorRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCollaboratorRoleData) => {
      const response = await api.post('/settings/collaborator-roles', data);
      return response.data.data as UserCollaboratorRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborator-roles'] });
    },
  });
}

export function useUpdateCollaboratorRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCollaboratorRoleData }) => {
      const response = await api.put(`/settings/collaborator-roles/${id}`, data);
      return response.data.data as UserCollaboratorRole;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborator-roles'] });
    },
  });
}

export function useDeleteCollaboratorRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/settings/collaborator-roles/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborator-roles'] });
    },
  });
}

export function useReorderCollaboratorRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: Array<{ id: number; order: number }>) => {
      const response = await api.post('/settings/collaborator-roles/reorder', { order });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborator-roles'] });
    },
  });
}

// Budget Categories
export interface UserBudgetCategory {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  color: string | null;
  is_default: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetCategoryData {
  name: string;
  slug?: string;
  color?: string;
}

export interface UpdateBudgetCategoryData extends CreateBudgetCategoryData {
  order?: number;
}

export function useBudgetCategories() {
  return useQuery({
    queryKey: ['budget-categories'],
    queryFn: async () => {
      const response = await api.get('/settings/budget-categories');
      return response.data.data as UserBudgetCategory[];
    },
  });
}

export function useCreateBudgetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBudgetCategoryData) => {
      const response = await api.post('/settings/budget-categories', data);
      return response.data.data as UserBudgetCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
    },
  });
}

export function useUpdateBudgetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateBudgetCategoryData }) => {
      const response = await api.put(`/settings/budget-categories/${id}`, data);
      return response.data.data as UserBudgetCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
    },
  });
}

export function useDeleteBudgetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/settings/budget-categories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
    },
  });
}

export function useReorderBudgetCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: Array<{ id: number; order: number }>) => {
      const response = await api.post('/settings/budget-categories/reorder', { order });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
    },
  });
}