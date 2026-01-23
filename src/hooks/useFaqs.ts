import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import type { Faq } from '@/types';

/**
 * Hook to fetch public FAQs (active only)
 */
export function useFaqs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async (): Promise<Faq[]> => {
      const response = await api.get('/faqs');
      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      }
      if (data && 'data' in data && Array.isArray(data.data)) {
        return data.data;
      }

      return [];
    },
  });
}

