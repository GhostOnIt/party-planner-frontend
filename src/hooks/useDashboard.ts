import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';
import type {
  DashboardStatsResponse,
  ConfirmationsChartResponse,
  EventsByTypeResponse,
  RecentActivityResponse,
  UpcomingEventsResponse,
} from '@/types/dashboard';

// Legacy interface (kept for backward compatibility)
export interface UserStats {
  events_count: number;
  guests_confirmed: number;
  tasks_pending: number;
  total_budget: number;
}

/**
 * Get dashboard statistics with filters (period + event type).
 */
export function useDashboardStats(
  period: string = '7days',
  eventType: string = 'all',
  customRange?: { start: Date; end: Date }
) {
  return useQuery({
    queryKey: ['dashboard', 'stats', period, eventType, customRange],
    queryFn: async (): Promise<DashboardStatsResponse> => {
      const params: Record<string, string> = {
        period,
        type: eventType,
      };

      if (period === 'custom' && customRange) {
        params.start_date = customRange.start.toISOString().split('T')[0];
        params.end_date = customRange.end.toISOString().split('T')[0];
      }

      const response = await api.get<DashboardStatsResponse>('/dashboard/stats', { params });
      return response.data;
    },
  });
}

/**
 * Get upcoming events.
 */
export function useUpcomingEvents(limit: number = 4) {
  return useQuery({
    queryKey: ['events', 'upcoming', limit],
    queryFn: async (): Promise<UpcomingEventsResponse> => {
      const response = await api.get<UpcomingEventsResponse>('/events/upcoming', {
        params: { limit },
      });
      return response.data;
    },
  });
}

export function useUrgentTasks(limit: number = 5) {
  return useQuery({
    queryKey: ['tasks', 'urgent', limit],
    queryFn: async () => {
      const response = await api.get('/dashboard/urgent-tasks', {
        params: { limit },
      });
      const responseData = response.data;

      // API returns: { data: [{ event: {...}, tasks: [...], count }, ...], summary: {...} }
      // Flatten tasks from all events
      if (responseData && 'data' in responseData && Array.isArray(responseData.data)) {
        const flattenedTasks: Array<Record<string, unknown>> = [];

        for (const eventGroup of responseData.data) {
          if (eventGroup.tasks && Array.isArray(eventGroup.tasks)) {
            for (const task of eventGroup.tasks) {
              flattenedTasks.push({
                ...task,
                event: eventGroup.event, // Include event info
              });
            }
          }
        }

        return flattenedTasks.slice(0, limit);
      }

      // Handle other formats
      if (responseData && 'tasks' in responseData) {
        return responseData.tasks;
      }

      return responseData;
    },
  });
}

/**
 * Get confirmations chart data with filters.
 */
export function useConfirmationsChart(
  period: string = '7days',
  eventType: string = 'all',
  filters: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}
) {
  return useQuery({
    queryKey: ['dashboard', 'confirmations', period, eventType, filters],
    queryFn: async (): Promise<ConfirmationsChartResponse> => {
      const params: Record<string, string | number> = {
        period,
        type: eventType,
        page: filters.page ?? 1,
        per_page: filters.per_page ?? 5,
        sort_by: filters.sort_by ?? 'confirmRate',
        sort_order: filters.sort_order ?? 'desc',
      };

      if (filters.search) {
        params.search = filters.search;
      }

      const response = await api.get<ConfirmationsChartResponse>('/dashboard/confirmations', { params });
      return response.data;
    },
  });
}

/**
 * Get events by type chart data.
 */
export function useEventsByType(period: string = '7days', eventType: string = 'all') {
  return useQuery({
    queryKey: ['dashboard', 'events-by-type', period, eventType],
    queryFn: async (): Promise<EventsByTypeResponse> => {
      const response = await api.get<EventsByTypeResponse>('/dashboard/events-by-type', {
        params: { period, type: eventType },
      });
      return response.data;
    },
  });
}

/**
 * Get recent activity.
 */
export function useRecentActivity(limit: number = 6) {
  return useQuery({
    queryKey: ['activities', 'recent', limit],
    queryFn: async (): Promise<RecentActivityResponse> => {
      const response = await api.get<RecentActivityResponse>('/activities/recent', {
        params: { limit },
      });
      return response.data;
    },
  });
}

// Combined hook for dashboard data (legacy - kept for backward compatibility)
export function useDashboard() {
  const statsQuery = useDashboardStats();
  const eventsQuery = useUpcomingEvents(5);
  const tasksQuery = useUrgentTasks(5);

  return {
    data: {
      stats: statsQuery.data,
      upcoming_events: eventsQuery.data || [],
      urgent_tasks: tasksQuery.data || [],
    },
    isLoading: statsQuery.isLoading || eventsQuery.isLoading || tasksQuery.isLoading,
    error: statsQuery.error || eventsQuery.error || tasksQuery.error,
  };
}
