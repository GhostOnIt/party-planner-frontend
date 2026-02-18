import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import api from '@/api/client';

export interface GlobalGuest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rsvp_status: string;
  notes: string | null;
  event_id: string;
  event: {
    id: string;
    title: string;
    date: string;
  };
  created_at: string;
  updated_at: string;
  // Computed/Frontend fields
  initials?: string;
  lastInteraction?: string;
}

export interface GlobalGuestFilters {
  search?: string;
  event_id?: string;
  rsvp_status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

export interface GlobalGuestsApiResponse {
  data: GlobalGuest[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: {
    total: number;
    with_email: number;
    with_phone: number;
  };
}

// Fetch global guests
export function useGlobalGuests(filters: GlobalGuestFilters = {}) {
  return useQuery({
    queryKey: ['global-guests', filters],
    queryFn: async (): Promise<GlobalGuestsApiResponse> => {
      const response = await api.get('/guests', { params: filters });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}

// Export global guests
export function useExportGlobalGuests() {
  return useMutation({
    mutationFn: async ({
      format = 'csv',
      filters = {},
    }: {
      format?: 'csv';
      filters?: GlobalGuestFilters;
    }) => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.event_id && filters.event_id !== 'all') params.append('event_id', filters.event_id);
      if (filters.rsvp_status && filters.rsvp_status !== 'all') params.append('rsvp_status', filters.rsvp_status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const queryString = params.toString();
      const url = `/guests/export?${queryString}`;

      const response = await api.get(url, {
        responseType: 'blob',
      });

      // Create download link
      const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', `invites_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlBlob);

      return response.data;
    },
  });
}

// Send campaign
export function useSendCampaign() {
  return useMutation({
    mutationFn: async (data: {
      subject: string;
      message: string;
      guest_ids: string[];
    }) => {
      const response = await api.post('/guests/campaign', data);
      return response.data;
    },
  });
}
