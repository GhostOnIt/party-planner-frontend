import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type { Task, PaginatedResponse, TaskFilters, CreateTaskFormData, TaskStatus } from '@/types';

// List tasks with filters
export function useTasks(eventId: number | string, filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['events', eventId, 'tasks', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Task> | Task[]>(
        `/events/${eventId}/tasks`,
        { params: filters }
      );



      // Handle both paginated response and direct array response
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: response.data.length,
            total: response.data.length,
          },
        };
      }

      return response.data;
    },
    enabled: !!eventId,
  });
}

// Get a single task
export function useTask(eventId: number | string, taskId: number | string) {
  return useQuery({
    queryKey: ['events', eventId, 'tasks', taskId],
    queryFn: async () => {
      const response = await api.get<Task>(`/events/${eventId}/tasks/${taskId}`);
      return response.data;
    },
    enabled: !!eventId && !!taskId,
  });
}

// Create task
export function useCreateTask(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTaskFormData) => {
      const response = await api.post<Task>(`/events/${eventId}/tasks`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Update task
export function useUpdateTask(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: number; data: Partial<CreateTaskFormData & { status: TaskStatus }> }) => {
      const response = await api.put<Task>(`/events/${eventId}/tasks/${taskId}`, data);
      return response.data;
    },
    onMutate: async ({ taskId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['events', eventId, 'tasks'] });

      const previous = queryClient.getQueriesData({ queryKey: ['events', eventId, 'tasks'] });

      queryClient.setQueriesData({ queryKey: ['events', eventId, 'tasks'] }, (old) => {
        if (!old) return old;

        // Normalized shape from useTasks(): { data: Task[], meta: ... }
        if (typeof old === 'object' && old !== null && 'data' in old) {
          const anyOld = old as { data?: unknown };
          if (Array.isArray(anyOld.data)) {
            return {
              ...(old as any),
              data: (anyOld.data as Task[]).map((t) => (t.id === taskId ? { ...t, ...data } : t)),
            };
          }
        }

        // Fallback: raw array of tasks
        if (Array.isArray(old)) {
          return (old as Task[]).map((t) => (t.id === taskId ? { ...t, ...data } : t));
        }

        return old;
      });

      // Also update single-task cache if present
      queryClient.setQueryData(['events', eventId, 'tasks', taskId], (old) => {
        if (!old) return old;
        return { ...(old as Task), ...(data as Partial<Task>) };
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (!context?.previous) return;
      context.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'tasks'] });
    },
  });
}

// Delete task
export function useDeleteTask(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      await api.delete(`/events/${eventId}/tasks/${taskId}`);
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Change task status
export function useChangeTaskStatus(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: TaskStatus }) => {
      const response = await api.put<Task>(`/events/${eventId}/tasks/${taskId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Complete task (convenience wrapper)
export function useCompleteTask(eventId: number | string) {
  const changeStatus = useChangeTaskStatus(eventId);

  return {
    ...changeStatus,
    mutate: (taskId: number, options?: Parameters<typeof changeStatus.mutate>[1]) =>
      changeStatus.mutate({ taskId, status: 'completed' }, options),
    mutateAsync: (taskId: number) => changeStatus.mutateAsync({ taskId, status: 'completed' }),
  };
}

// Reopen task (convenience wrapper)
export function useReopenTask(eventId: number | string) {
  const changeStatus = useChangeTaskStatus(eventId);

  return {
    ...changeStatus,
    mutate: (taskId: number, options?: Parameters<typeof changeStatus.mutate>[1]) =>
      changeStatus.mutate({ taskId, status: 'todo' }, options),
    mutateAsync: (taskId: number) => changeStatus.mutateAsync({ taskId, status: 'todo' }),
  };
}
