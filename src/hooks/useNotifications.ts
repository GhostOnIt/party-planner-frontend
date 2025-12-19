import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type { Notification } from '@/types';

interface NotificationsResponse {
  data: Notification[];
  unread_count: number;
}

// List notifications
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<NotificationsResponse> => {
      const response = await api.get('/notifications');
      const responseData = response.data;

      // Handle different response formats
      if (responseData && 'notifications' in responseData) {
        return {
          data: responseData.notifications.data || responseData.notifications || [],
          unread_count: responseData.unread_count || 0,
        };
      }
      if (responseData && 'data' in responseData) {
        return {
          data: responseData.data || [],
          unread_count: responseData.unread_count || 0,
        };
      }

      return {
        data: Array.isArray(responseData) ? responseData : [],
        unread_count: 0,
      };
    },
  });
}

// Get unread count only (for header badge)
export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async (): Promise<number> => {
      const response = await api.get('/notifications/unread-count');
      const responseData = response.data;

      if (typeof responseData === 'number') {
        return responseData;
      }
      if (responseData && 'count' in responseData) {
        return responseData.count;
      }
      if (responseData && 'unread_count' in responseData) {
        return responseData.unread_count;
      }

      return 0;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// Mark notification as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Mark all notifications as read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.put('/notifications/read-all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Bulk delete notifications
export function useBulkDeleteNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await api.post('/notifications/bulk-delete', { ids: notificationIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Clear all read notifications
export function useClearReadNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/notifications/clear-read');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.delete(`/notifications/${notificationId}`);
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Get recent notifications for dashboard
export function useRecentNotifications(limit: number = 5) {
  return useQuery({
    queryKey: ['notifications', 'recent', limit],
    queryFn: async (): Promise<Notification[]> => {
      const response = await api.get('/notifications/recent', { params: { limit } });
      const responseData = response.data;

      // Handle different response formats
      if (responseData && 'data' in responseData) {
        return responseData.data || [];
      }
      if (Array.isArray(responseData)) {
        return responseData;
      }

      return [];
    },
  });
}
