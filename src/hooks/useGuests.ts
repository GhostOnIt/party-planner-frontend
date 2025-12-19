import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type { Guest, GuestFilters, CreateGuestFormData, GuestStats } from '@/types';

interface GuestsApiResponse {
  data: Guest[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats?: GuestStats;
}

// List guests with filters and pagination
export function useGuests(eventId: number | string, filters: GuestFilters = {}) {
  return useQuery({
    queryKey: ['events', eventId, 'guests', filters],
    queryFn: async (): Promise<GuestsApiResponse> => {
      const response = await api.get(
        `/events/${eventId}/guests`,
        { params: filters }
      );
      const responseData = response.data;

      // Handle different API response formats
      // Format 1: { data: [...], meta: {...}, stats: {...} }
      // Format 2: { guests: { data: [...], ... }, stats: {...} }
      if (responseData && 'guests' in responseData) {
        const guestsData = responseData.guests;
        return {
          data: guestsData.data || [],
          meta: guestsData.current_page ? {
            current_page: guestsData.current_page,
            last_page: guestsData.last_page || 1,
            per_page: guestsData.per_page || 20,
            total: guestsData.total || 0,
          } : undefined,
          stats: responseData.stats,
        };
      }

      // Standard Laravel paginated response with stats
      return {
        data: responseData.data || [],
        meta: responseData.meta,
        stats: responseData.stats,
      };
    },
    enabled: !!eventId,
  });
}

// Get guest stats for an event (separate endpoint)
export function useGuestStats(eventId: number | string) {
  return useQuery({
    queryKey: ['events', eventId, 'guests', 'stats'],
    queryFn: async (): Promise<GuestStats> => {
      const response = await api.get(`/events/${eventId}/guests/statistics`);
      const responseData = response.data;

      // API returns: { statistics: { total, by_status: {...}, check_in: {...} }, can_add_more, remaining_slots }
      if (responseData && 'statistics' in responseData) {
        const stats = responseData.statistics;
        return {
          total: stats.total || 0,
          accepted: stats.by_status?.accepted || 0,
          declined: stats.by_status?.declined || 0,
          pending: stats.by_status?.pending || 0,
          maybe: stats.by_status?.maybe || 0,
          checked_in: stats.check_in?.checked_in || 0,
        };
      }

      // Fallback: direct stats response
      return responseData;
    },
    enabled: !!eventId,
  });
}

// Create guest
export function useCreateGuest(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGuestFormData) => {
      const response = await api.post<Guest>(`/events/${eventId}/guests`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'guests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Update guest
export function useUpdateGuest(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ guestId, data }: { guestId: number; data: Partial<CreateGuestFormData> }) => {
      const response = await api.put<Guest>(`/events/${eventId}/guests/${guestId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'guests'] });
    },
  });
}

// Delete guest
export function useDeleteGuest(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guestId: number) => {
      await api.delete(`/events/${eventId}/guests/${guestId}`);
      return guestId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'guests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Send invitation
export function useSendInvitation(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guestId: number) => {
      const response = await api.post(`/events/${eventId}/guests/${guestId}/send-invitation`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'guests'] });
    },
  });
}

// Check-in guest
export function useCheckInGuest(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guestId: number) => {
      const response = await api.post(`/events/${eventId}/guests/${guestId}/check-in`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'guests'] });
    },
  });
}

// Undo check-in
export function useUndoCheckIn(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guestId: number) => {
      const response = await api.post(`/events/${eventId}/guests/${guestId}/undo-check-in`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'guests'] });
    },
  });
}

// Export guests
export function useExportGuests(eventId: number | string) {
  return useMutation({
    mutationFn: async (format: 'csv' | 'pdf' | 'xlsx') => {
      const response = await api.get(`/events/${eventId}/exports/guests/${format}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invites.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    },
  });
}

// Import preview response type
export interface ImportPreviewResponse {
  headers: string[];
  rows: Array<{
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
    rsvp_status?: string;
    is_duplicate?: boolean;
    _raw?: string[];
  }>;
  total_rows: number;
  errors: string[];
}

// Import result response type
export interface ImportResultResponse {
  message: string;
  data: {
    imported: number;
    skipped: number;
    errors: string[];
  };
}

// Preview import
export function usePreviewImport(eventId: number | string) {
  return useMutation({
    mutationFn: async ({ file, delimiter = ',' }: { file: File; delimiter?: string }): Promise<ImportPreviewResponse> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('delimiter', delimiter);

      const response = await api.post(`/events/${eventId}/guests/preview-import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
  });
}

// Import guests
export function useImportGuests(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      skipDuplicates = true,
      delimiter = ',',
    }: {
      file: File;
      skipDuplicates?: boolean;
      delimiter?: string;
    }): Promise<ImportResultResponse> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('skip_duplicates', skipDuplicates ? '1' : '0');
      formData.append('delimiter', delimiter);

      const response = await api.post(`/events/${eventId}/guests/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'guests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Download import template
export function useDownloadTemplate() {
  return useMutation({
    mutationFn: async (format: 'csv' | 'xlsx' = 'csv') => {
      const response = await api.get('/guests/import-template', {
        params: { format },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = format === 'xlsx' ? 'template_invites.csv' : 'template_invites.' + format;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    },
  });
}
