import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

export interface SearchEvent {
  id: number;
  name: string;
  type: string;
  date: string | null;
  location: string | null;
}

export interface SearchGuest {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  rsvp_status: string;
  event: {
    id: number;
    title: string;
  };
}

export interface SearchResponse {
  events: SearchEvent[];
  guests: SearchGuest[];
}

export function useSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResponse> => {
      const response = await api.get<SearchResponse>('/search', {
        params: { q: query, limit: 10 },
      });
      return response.data;
    },
    enabled: enabled && query.length >= 2, // Only search if query has at least 2 characters
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

