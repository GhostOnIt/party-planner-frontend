import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';

// ============== Types ==============

export interface Plan {
  id: number;
  name: string;
  title: string | null;
  slug: string;
  description: string | null;
  price: number;
  formatted_price: string;
  duration_days: number;
  duration_label: string;
  is_trial: boolean;
  is_one_time_use?: boolean;
  is_active: boolean;
  is_popular?: boolean; // Calculated by backend based on subscription statistics
  sort_order: number;
  limits: PlanLimits;
  features: PlanFeatures;
  created_at: string;
  updated_at: string;
  // Statistics (added by API)
  active_subscriptions_count?: number;
  total_subscriptions_count?: number;
}

export interface PlanLimits {
  'events.creations_per_billing_period'?: number;
  'guests.max_per_event'?: number;
  'collaborators.max_per_event'?: number;
  'photos.max_per_event'?: number;
  [key: string]: number | undefined;
}

export interface PlanFeatures {
  'budget.enabled'?: boolean;
  'planning.enabled'?: boolean;
  'tasks.enabled'?: boolean;
  'guests.manage'?: boolean;
  'guests.import'?: boolean;
  'guests.export'?: boolean;
  'invitations.sms'?: boolean;
  'invitations.whatsapp'?: boolean;
  'collaborators.manage'?: boolean;
  'roles_permissions.enabled'?: boolean;
  'exports.pdf'?: boolean;
  'exports.excel'?: boolean;
  'exports.csv'?: boolean;
  'history.enabled'?: boolean;
  'reporting.enabled'?: boolean;
  'branding.custom'?: boolean;
  'support.whatsapp_priority'?: boolean;
  'support.dedicated'?: boolean;
  'multi_client.enabled'?: boolean;
  'assistance.human'?: boolean;
  [key: string]: boolean | undefined;
}

export interface PlanFilters {
  active?: boolean;
  is_trial?: boolean;
  search?: string;
}

export interface CreatePlanData {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  duration_days: number;
  is_trial?: boolean;
  is_active?: boolean;
  sort_order?: number;
  limits?: PlanLimits;
  features?: PlanFeatures;
}

export interface UpdatePlanData extends Partial<CreatePlanData> {}

// ============== Hooks ==============

/**
 * Get all plans (admin)
 */
export function useAdminPlans(filters: PlanFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'plans', filters],
    queryFn: async (): Promise<{ data: Plan[]; meta: { total: number } }> => {
      const response = await api.get('/admin/plans', { params: filters });
      return response.data;
    },
  });
}

/**
 * Get a single plan by ID (admin)
 */
export function useAdminPlan(planId: number) {
  return useQuery({
    queryKey: ['admin', 'plans', planId],
    queryFn: async (): Promise<Plan> => {
      const response = await api.get(`/admin/plans/${planId}`);
      return response.data.data;
    },
    enabled: !!planId,
  });
}

/**
 * Create a new plan
 */
export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlanData) => {
      const response = await api.post('/admin/plans', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

/**
 * Update an existing plan
 */
export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, data }: { planId: number; data: UpdatePlanData }) => {
      const response = await api.put(`/admin/plans/${planId}`, data);
      return response.data;
    },
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans', planId] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

/**
 * Delete a plan
 */
export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: number) => {
      const response = await api.delete(`/admin/plans/${planId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

/**
 * Toggle plan active status
 */
export function useTogglePlanActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: number) => {
      const response = await api.post(`/admin/plans/${planId}/toggle-active`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

// ============== Public Plans ==============

/**
 * Get public plans (for pricing page)
 * Automatically filters out one-time-use plans already used by the user
 */
export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async (): Promise<Plan[]> => {
      const response = await api.get('/plans');
      // Handle different response structures
      const data = response.data?.data ?? response.data ?? [];
      // Ensure it's always an array
      return Array.isArray(data) ? data : [];
    },
  });
}

/**
 * Get available trial plan for current user
 */
export interface AvailableTrialResponse {
  data: Plan | null;
  available: boolean;
}

export function useAvailableTrial() {
  return useQuery({
    queryKey: ['plans', 'trial', 'available'],
    queryFn: async (): Promise<AvailableTrialResponse> => {
      const response = await api.get<AvailableTrialResponse>('/plans/trial/available');
      return response.data;
    },
  });
}

// ============== Feature & Limit Helpers ==============

export const PLAN_FEATURE_LABELS: Record<string, string> = {
  'budget.enabled': 'Gestion du budget',
  'planning.enabled': 'Planning',
  'tasks.enabled': 'Gestion des tâches',
  'guests.manage': 'Gestion des invités',
  'guests.import': 'Import des invités',
  'guests.export': 'Export des invités',
  'invitations.sms': 'Invitations SMS',
  'invitations.whatsapp': 'Invitations WhatsApp',
  'collaborators.manage': 'Gestion des collaborateurs',
  'roles_permissions.enabled': 'Rôles et permissions',
  'exports.pdf': 'Export PDF',
  'exports.excel': 'Export Excel',
  'exports.csv': 'Export CSV',
  'history.enabled': 'Historique',
  'reporting.enabled': 'Reporting',
  'branding.custom': 'Branding personnalisé',
  'support.whatsapp_priority': 'Support WhatsApp prioritaire',
  'support.dedicated': 'Support dédié',
  'multi_client.enabled': 'Multi-clients',
  'assistance.human': 'Assistance humaine',
};

export const PLAN_LIMIT_LABELS: Record<string, string> = {
  'events.creations_per_billing_period': 'Événements / période',
  'guests.max_per_event': 'Invités / événement',
  'collaborators.max_per_event': 'Collaborateurs / événement',
  'photos.max_per_event': 'Photos / événement',
};

/**
 * Format a limit value for display
 */
export function formatLimitValue(value: number | undefined): string {
  if (value === undefined || value === null) return '0';
  if (value === -1) return 'Illimité';
  return value.toString();
}

/**
 * Check if a limit is unlimited
 */
export function isUnlimited(value: number | undefined): boolean {
  return value === -1;
}

