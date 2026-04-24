import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';

export interface QuoteRequestStage {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  is_system: boolean;
}

export interface QuoteRequestActivity {
  id: string;
  user_id: string | null;
  activity_type: string;
  message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: { id: string; name: string; email: string };
}

export interface QuoteRequest {
  id: string;
  tracking_code: string;
  status: string;
  outcome: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  company_name: string;
  business_needs: string;
  budget_estimate: number | null;
  team_size: number | null;
  timeline: string | null;
  event_types: string[] | null;
  call_scheduled_at: string | null;
  current_stage_id: string | null;
  assigned_admin_id: string | null;
  current_stage?: QuoteRequestStage;
  assigned_admin?: { id: string; name: string; email: string };
  user?: { id: string; name: string; email: string };
  activities?: QuoteRequestActivity[];
  created_at: string;
}

export interface CreateQuoteRequestPayload {
  plan_id?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  company_name: string;
  business_needs: string;
  budget_estimate?: number;
  team_size?: number;
  timeline?: string;
  event_types?: string[];
}

export function useCreateQuoteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateQuoteRequestPayload): Promise<{ data: QuoteRequest }> => {
      const response = await api.post('/quote-requests', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] });
    },
  });
}

export function useMyQuoteRequests() {
  return useQuery({
    queryKey: ['quote-requests', 'mine'],
    queryFn: async (): Promise<QuoteRequest[]> => {
      const response = await api.get('/quote-requests/mine');
      return response.data.data ?? [];
    },
  });
}

export function useAdminQuoteStages() {
  return useQuery({
    queryKey: ['admin', 'quote-request-stages'],
    queryFn: async (): Promise<QuoteRequestStage[]> => {
      const response = await api.get('/admin/quote-request-stages');
      return response.data.data ?? [];
    },
  });
}

export function useAdminQuoteRequests(params: { stage_id?: string; search?: string } = {}) {
  return useQuery({
    queryKey: ['admin', 'quote-requests', params],
    queryFn: async (): Promise<{
      data: {
        data: QuoteRequest[];
      };
    }> => {
      const response = await api.get('/admin/quote-requests', { params });
      return response.data;
    },
  });
}

export function useUpdateQuoteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteRequestId, stageId }: { quoteRequestId: string; stageId: string }) => {
      const response = await api.patch(`/admin/quote-requests/${quoteRequestId}/stage`, {
        stage_id: stageId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] });
      queryClient.invalidateQueries({ queryKey: ['quote-requests', 'mine'] });
    },
  });
}

export function useAssignQuoteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quoteRequestId,
      assignedAdminId,
    }: {
      quoteRequestId: string;
      assignedAdminId: string | null;
    }) => {
      const response = await api.patch(`/admin/quote-requests/${quoteRequestId}/assign`, {
        assigned_admin_id: assignedAdminId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] });
    },
  });
}

export function useAddQuoteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteRequestId, note }: { quoteRequestId: string; note: string }) => {
      const response = await api.post(`/admin/quote-requests/${quoteRequestId}/notes`, { note });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] });
    },
  });
}

export function useScheduleQuoteCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteRequestId, callScheduledAt }: { quoteRequestId: string; callScheduledAt: string }) => {
      const response = await api.post(`/admin/quote-requests/${quoteRequestId}/schedule-call`, {
        call_scheduled_at: callScheduledAt,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] });
      queryClient.invalidateQueries({ queryKey: ['quote-requests', 'mine'] });
    },
  });
}

export function useUpdateQuoteOutcome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quoteRequestId,
      outcome,
      outcomeNote,
    }: {
      quoteRequestId: string;
      outcome: 'won' | 'lost';
      outcomeNote?: string;
    }) => {
      const response = await api.patch(`/admin/quote-requests/${quoteRequestId}/outcome`, {
        outcome,
        outcome_note: outcomeNote,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] });
      queryClient.invalidateQueries({ queryKey: ['quote-requests', 'mine'] });
    },
  });
}

export function useCreateQuoteStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; slug: string; sort_order: number }) => {
      const response = await api.post('/admin/quote-request-stages', payload);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'quote-request-stages'] }),
  });
}

export function useReorderQuoteStages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stages: Array<{ id: string; sort_order: number }>) => {
      const response = await api.patch('/admin/quote-request-stages/reorder', { stages });
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'quote-request-stages'] }),
  });
}

