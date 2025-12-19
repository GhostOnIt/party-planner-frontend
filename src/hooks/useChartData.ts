import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

export interface RsvpChartData {
  event_title: string;
  accepted: number;
  declined: number;
  pending: number;
  maybe: number;
}

export interface BudgetChartData {
  category: string;
  estimated: number;
  actual: number;
}

export interface DashboardChartData {
  rsvp_by_event: RsvpChartData[];
  events_by_type: Array<{ type: string; count: number }>;
  events_by_status: Array<{ status: string; count: number }>;
}

export function useDashboardChartData() {
  return useQuery({
    queryKey: ['dashboard', 'chart-data'],
    queryFn: async () => {
      const response = await api.get<DashboardChartData>('/dashboard/chart-data');
      return response.data;
    },
  });
}

export function useRsvpChartData() {
  const { data, isLoading, error } = useDashboardChartData();

  return {
    data: data?.rsvp_by_event || [],
    isLoading,
    error,
  };
}

export function useBudgetChartData(eventId: number) {
  return useQuery({
    queryKey: ['events', eventId, 'budget', 'chart'],
    queryFn: async () => {
      const response = await api.get<BudgetChartData[]>(
        `/events/${eventId}/budget/statistics`
      );
      return response.data;
    },
    enabled: !!eventId,
  });
}
