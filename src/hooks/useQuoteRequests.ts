import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';

// ─── Types ───────────────────────────────────────────────────────────────────

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

export interface CustomOffer {
  id: string;
  quote_request_id: string;
  title: string;
  description: string | null;
  price_amount: number;
  price_currency: string;
  features: string[] | null;
  terms: string | null;
  validity_days: number;
  expires_at: string | null;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  client_token: string;
  client_responded_at: string | null;
  client_response_note: string | null;
  created_at: string;
  creator?: { id: string; name: string };
  quote_request?: { id: string; tracking_code: string; company_name: string };
}

export interface QuoteRequest {
  id: string;
  tracking_code: string;
  status: string;
  outcome: string | null;
  outcome_note: string | null;
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
  offers?: CustomOffer[];
  offers_count?: number;
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

export interface CreateCustomOfferPayload {
  title: string;
  description?: string;
  price_amount: number;
  price_currency?: string;
  features?: string[];
  terms?: string;
  validity_days?: number;
}

export interface AdminQuoteRequestsParams {
  search?: string;
  stage_id?: string;
  status?: string;
  outcome?: string;
  assigned_admin_id?: string;
  date_from?: string;
  date_to?: string;
  budget_min?: number;
  budget_max?: number;
  sort_by?: string;
  sort_dir?: string;
  per_page?: number;
  page?: number;
}

// ─── Public Offer (token-based, no auth) ─────────────────────────────────────

export interface PublicOffer {
  id: string;
  title: string;
  description: string | null;
  price_amount: number;
  price_currency: string;
  features: string[] | null;
  terms: string | null;
  validity_days: number;
  expires_at: string | null;
  status: string;
  client_responded_at: string | null;
  client_response_note: string | null;
  tracking_code: string | null;
  company_name: string | null;
}

// ─── User Hooks ──────────────────────────────────────────────────────────────

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
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });
}

export function useMyOffers() {
  return useQuery({
    queryKey: ['quote-requests', 'mine', 'offers'],
    queryFn: async (): Promise<CustomOffer[]> => {
      const response = await api.get('/quote-requests/mine/offers');
      return response.data.data ?? [];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

// ─── Admin Quote Request Hooks ───────────────────────────────────────────────

export function useAdminQuoteStages() {
  return useQuery({
    queryKey: ['admin', 'quote-request-stages'],
    queryFn: async (): Promise<QuoteRequestStage[]> => {
      const response = await api.get('/admin/quote-request-stages');
      return response.data.data ?? [];
    },
  });
}

export function useAdminQuoteRequests(params: AdminQuoteRequestsParams = {}) {
  return useQuery({
    queryKey: ['admin', 'quote-requests', params],
    queryFn: async () => {
      const response = await api.get('/admin/quote-requests', { params });
      return response.data;
    },
  });
}

export function useAdminQuoteRequest(quoteRequestId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'quote-requests', 'detail', quoteRequestId],
    queryFn: async (): Promise<QuoteRequest> => {
      const response = await api.get(`/admin/quote-requests/${quoteRequestId}`);
      return response.data.data;
    },
    enabled: !!quoteRequestId,
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
      queryClient.invalidateQueries({ queryKey: ['quote-requests', 'mine'] });
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
      queryClient.invalidateQueries({ queryKey: ['quote-requests', 'mine'] });
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

// ─── Admin Stage Management Hooks ────────────────────────────────────────────

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

export function useUpdateQuoteStageConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ stageId, ...payload }: { stageId: string; name?: string; slug?: string; is_active?: boolean }) => {
      const response = await api.put(`/admin/quote-request-stages/${stageId}`, payload);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'quote-request-stages'] }),
  });
}

export function useDeleteQuoteStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stageId: string) => {
      const response = await api.delete(`/admin/quote-request-stages/${stageId}`);
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

// ─── Admin Custom Offer Hooks ────────────────────────────────────────────────

export function useQuoteRequestOffers(quoteRequestId: string) {
  return useQuery({
    queryKey: ['admin', 'quote-requests', quoteRequestId, 'offers'],
    queryFn: async (): Promise<CustomOffer[]> => {
      const response = await api.get(`/admin/quote-requests/${quoteRequestId}/offers`);
      return response.data.data ?? [];
    },
    enabled: !!quoteRequestId,
  });
}

export function useCreateCustomOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quoteRequestId, ...payload }: CreateCustomOfferPayload & { quoteRequestId: string }) => {
      const response = await api.post(`/admin/quote-requests/${quoteRequestId}/offers`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] });
    },
  });
}

export function useUpdateCustomOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ offerId, ...payload }: CreateCustomOfferPayload & { offerId: string }) => {
      const response = await api.put(`/admin/custom-offers/${offerId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] });
    },
  });
}

export function useSendCustomOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (offerId: string) => {
      const response = await api.post(`/admin/custom-offers/${offerId}/send`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] });
      queryClient.invalidateQueries({ queryKey: ['quote-requests', 'mine'] });
    },
  });
}

export function useDeleteCustomOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (offerId: string) => {
      const response = await api.delete(`/admin/custom-offers/${offerId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] });
    },
  });
}

// ─── Public Offer Hooks (token-based) ────────────────────────────────────────

export function usePublicOffer(clientToken: string) {
  return useQuery({
    queryKey: ['public', 'offers', clientToken],
    queryFn: async (): Promise<PublicOffer> => {
      const response = await api.get(`/public/offers/${clientToken}`);
      return response.data.data;
    },
    enabled: !!clientToken,
  });
}

export function useRespondToOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      clientToken,
      action,
      responseNote,
    }: {
      clientToken: string;
      action: 'accept' | 'reject';
      responseNote?: string;
    }) => {
      const response = await api.post(`/public/offers/${clientToken}/respond`, {
        action,
        response_note: responseNote,
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['public', 'offers', variables.clientToken] });
      queryClient.invalidateQueries({ queryKey: ['quote-requests', 'mine'] });
    },
  });
}

// ─── Export Hook ─────────────────────────────────────────────────────────────

export function useExportQuoteRequests() {
  return useMutation({
    mutationFn: async (params: AdminQuoteRequestsParams = {}) => {
      const response = await api.get('/admin/quote-requests/export', {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `demandes-business-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
