import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type {
  BudgetItem,
  BudgetStats,
  BudgetFilters,
  CreateBudgetItemFormData,
  BudgetCategory,
} from '@/types';

// Pagination meta type
interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// API response type
interface BudgetApiResponse {
  items: BudgetItem[];
  stats: {
    total_estimated: number;
    total_actual: number;
    total_paid: number;
    items_count: number;
  };
  by_category: Record<string, { estimated: number; actual: number; count: number }>;
  meta?: PaginationMeta;
}

// Fetch budget items list
export function useBudget(eventId: string, filters: BudgetFilters = {}) {
  return useQuery({
    queryKey: ['events', eventId, 'budget', 'items', filters],
    queryFn: async () => {
      const response = await api.get<BudgetApiResponse>(
        `/events/${eventId}/budget`,
        { params: filters }
      );

      const responseData = response.data;

      // API returns { items: [...], stats: {...}, by_category: {...}, meta?: {...} }
      if (responseData && 'items' in responseData) {
        return {
          data: responseData.items,
          stats: {
            ...responseData.stats,
            by_category: Object.entries(responseData.by_category || {}).map(([category, data]) => ({
              category: category as BudgetCategory,
              estimated: data.estimated,
              actual: data.actual,
              count: data.count,
            })),
          } as BudgetStats,
          meta: responseData.meta,
        };
      }
      // Fallback for other formats
      if (Array.isArray(responseData)) {
        return { data: responseData, stats: undefined, meta: undefined };
      }
      return { data: [], stats: undefined, meta: undefined };
    },
    enabled: !!eventId,
  });
}

// Fetch budget statistics
export function useBudgetStats(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'budget', 'statistics'],
    queryFn: async () => {
      try {
        const response = await api.get<BudgetStats>(
          `/events/${eventId}/budget/statistics`
        );
        return response.data;
      } catch {
        // Return default stats if API doesn't exist yet
        return {
          total_estimated: 0,
          total_actual: 0,
          total_paid: 0,
          items_count: 0,
          by_category: [],
        } as BudgetStats;
      }
    },
    enabled: !!eventId,
  });
}

// Create budget item
export function useCreateBudgetItem(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBudgetItemFormData) => {
      const response = await api.post<BudgetItem>(
        `/events/${eventId}/budget/items`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'budget'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Update budget item
export function useUpdateBudgetItem(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      data,
    }: {
      itemId: number;
      data: Partial<CreateBudgetItemFormData>;
    }) => {
      const response = await api.put<BudgetItem>(
        `/events/${eventId}/budget/items/${itemId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'budget'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Delete budget item
export function useDeleteBudgetItem(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number) => {
      await api.delete(`/events/${eventId}/budget/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'budget'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Mark item as paid
export function useMarkPaid(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number) => {
      const response = await api.post<BudgetItem>(
        `/events/${eventId}/budget/items/${itemId}/mark-paid`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'budget'] });
    },
  });
}

// Mark item as unpaid
export function useMarkUnpaid(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: number) => {
      const response = await api.post<BudgetItem>(
        `/events/${eventId}/budget/items/${itemId}/mark-unpaid`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'budget'] });
    },
  });
}

// Export budget
export function useExportBudget(eventId: string) {
  return useMutation({
    mutationFn: async (format: 'csv' | 'pdf' | 'xlsx') => {
      const response = await api.get(
        `/events/${eventId}/exports/budget/${format}`,
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `budget-${eventId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}
