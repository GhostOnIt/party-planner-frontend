import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type {
  AdminStats,
  AdminUser,
  AdminEvent,
  Subscription,
  Payment,
  EventTemplate,
  PaginatedResponse,
  AdminUserFilters,
  AdminEventFilters,
  AdminSubscriptionFilters,
  AdminPaymentFilters,
  UpdateUserFormData,
  CreateTemplateFormData,
} from '@/types';

// ============== Stats ==============

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async (): Promise<AdminStats> => {
      const response = await api.get('/admin/stats');
      return response.data.stats;
    },
  });
}

// Admin dashboard stats with filters (like user dashboard)
export function useAdminDashboardStats(
  period: string = '7days',
  customRange?: { start: Date; end: Date }
) {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats', period, customRange],
    queryFn: async () => {
      const params: Record<string, string> = { period };
      if (period === 'custom' && customRange) {
        params.start_date = customRange.start.toISOString().split('T')[0];
        params.end_date = customRange.end.toISOString().split('T')[0];
      }
      const response = await api.get('/admin/dashboard/stats', { params });
      return response.data;
    },
  });
}

// Plan distribution chart
export function useAdminPlanDistribution() {
  return useQuery({
    queryKey: ['admin', 'plan-distribution'],
    queryFn: async () => {
      const response = await api.get('/admin/subscriptions/distribution');
      return response.data;
    },
  });
}

// ============== Users ==============

export function useAdminUsers(filters: AdminUserFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: async (): Promise<PaginatedResponse<AdminUser>> => {
      const response = await api.get('/admin/users', { params: filters });
      return response.data;
    },
  });
}

export function useAdminUser(userId: number) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: async (): Promise<AdminUser> => {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: UpdateUserFormData }) => {
      const response = await api.put(`/admin/users/${userId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      const response = await api.post(`/admin/users/${userId}/toggle-active`, { is_active: isActive });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

// ============== Events ==============

export function useAdminEvents(filters: AdminEventFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'events', filters],
    queryFn: async (): Promise<PaginatedResponse<AdminEvent>> => {
      const response = await api.get('/admin/events', { params: filters });
      return response.data;
    },
  });
}

export function useAdminEvent(eventId: number) {
  return useQuery({
    queryKey: ['admin', 'events', eventId],
    queryFn: async (): Promise<AdminEvent> => {
      const response = await api.get(`/admin/events/${eventId}`);
      return response.data;
    },
    enabled: !!eventId,
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: number) => {
      await api.delete(`/admin/events/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// ============== Subscriptions ==============

export type AdminSubscription = Subscription & {
  event?: {
    id: number;
    title: string;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
};

export function useAdminSubscriptions(filters: AdminSubscriptionFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'subscriptions', filters],
    queryFn: async (): Promise<PaginatedResponse<AdminSubscription>> => {
      const response = await api.get('/admin/subscriptions', { params: filters });
      return response.data;
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: number) => {
      await api.post(`/admin/subscriptions/${subscriptionId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useExtendSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subscriptionId, days }: { subscriptionId: number; days: number }) => {
      const response = await api.post(`/admin/subscriptions/${subscriptionId}/extend`, { days });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
    },
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subscriptionId, planType }: { subscriptionId: number; planType: 'starter' | 'pro' }) => {
      const response = await api.post(`/admin/subscriptions/${subscriptionId}/change-plan`, { plan_type: planType });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
    },
  });
}

// ============== Payments ==============

export function useAdminPayments(filters: AdminPaymentFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'payments', filters],
    queryFn: async (): Promise<PaginatedResponse<Payment & { subscription?: { event?: { user?: { id: number; name: string; email: string } } } }>> => {
      const response = await api.get('/admin/payments', { params: filters });
      return response.data;
    },
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: number) => {
      const response = await api.post(`/admin/payments/${paymentId}/refund`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// ============== Templates ==============

export function useAdminTemplates() {
  return useQuery({
    queryKey: ['admin', 'templates'],
    queryFn: async (): Promise<EventTemplate[]> => {
      const response = await api.get('/admin/templates');
      // API returns paginated response, extract the data array
      return response.data.data || response.data;
    },
  });
}

export function useAdminTemplate(templateId: number) {
  return useQuery({
    queryKey: ['admin', 'templates', templateId],
    queryFn: async (): Promise<EventTemplate> => {
      const response = await api.get(`/admin/templates/${templateId}`);
      return response.data;
    },
    enabled: !!templateId,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTemplateFormData) => {
      const response = await api.post('/admin/templates', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, data }: { templateId: number; data: Partial<CreateTemplateFormData> }) => {
      const response = await api.put(`/admin/templates/${templateId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: number) => {
      await api.delete(`/admin/templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] });
    },
  });
}

export function useToggleTemplateActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, isActive }: { templateId: number; isActive: boolean }) => {
      const response = await api.post(`/admin/templates/${templateId}/toggle-active`, { is_active: isActive });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'templates'] });
    },
  });
}

// ============== Recent Activity ==============

export interface RecentActivity {
  id: number;
  type: 'user_registered' | 'event_created' | 'payment_completed' | 'subscription_created';
  description: string;
  user?: { id: number; name: string };
  created_at: string;
}

export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: ['admin', 'activity', limit],
    queryFn: async (): Promise<RecentActivity[]> => {
      const response = await api.get('/admin/activity', { params: { limit } });
      return response.data;
    },
  });
}

// ============== Activity Logs ==============

export interface ActivityLog {
  id: number;
  admin_id: number;
  action: string;
  model_type: string | null;
  model_id: number | null;
  resource_name: string | null;
  description: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string;
  user_agent: string;
  created_at: string;
  admin?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ActivityLogFilters {
  page?: number;
  per_page?: number;
  action?: string;
  model_type?: string;
  admin_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface ActivityLogStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  by_action: Record<string, number>;
  by_model_type: Record<string, number>;
  by_admin: Array<{ admin_id: number; admin_name: string; count: number }>;
}

export function useAdminActivityLogs(filters: ActivityLogFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'activity-logs', filters],
    queryFn: async (): Promise<PaginatedResponse<ActivityLog>> => {
      const response = await api.get('/admin/activity-logs', { params: filters });
      return response.data;
    },
  });
}

export function useAdminActivityStats() {
  return useQuery({
    queryKey: ['admin', 'activity-logs', 'stats'],
    queryFn: async (): Promise<ActivityLogStats> => {
      const response = await api.get('/admin/activity-logs/stats');
      return response.data.stats;
    },
  });
}
