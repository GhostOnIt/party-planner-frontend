import { useQuery } from '@tanstack/react-query';
import api from '@/api/client';

export interface UserStats {
  events_count: number;
  guests_confirmed: number;
  tasks_pending: number;
  total_budget: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'user-stats'],
    queryFn: async (): Promise<UserStats> => {
      const response = await api.get('/dashboard/user-stats');
      const responseData = response.data;

      // API returns: { stats: { active_events, total_guests, total_tasks, completed_tasks, ... } }
      if (responseData && 'stats' in responseData) {
        const stats = responseData.stats;
        return {
          events_count: stats.active_events || 0,
          guests_confirmed: stats.total_guests || 0,
          tasks_pending: (stats.total_tasks || 0) - (stats.completed_tasks || 0),
          total_budget: stats.total_budget || 0,
        };
      }

      // Fallback: direct response
      return responseData;
    },
  });
}

export function useUpcomingEvents(limit: number = 5) {
  return useQuery({
    queryKey: ['events', 'upcoming', limit],
    queryFn: async () => {
      const response = await api.get('/events', {
        params: {
          per_page: limit,
          sort_by: 'date',
          sort_dir: 'asc',
          upcoming: true, // Filter to only show future events
        },
      });
      const responseData = response.data;

      // Handle nested response: { events: { data: [...] } } or { data: [...] }
      if (responseData && 'events' in responseData) {
        return responseData.events.data || responseData.events || [];
      }
      if (responseData && 'data' in responseData) {
        return responseData.data;
      }

      return responseData;
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

// Combined hook for dashboard data
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
