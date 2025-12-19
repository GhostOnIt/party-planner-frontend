import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { NotificationPreferences } from '@/types';

// Get notification preferences
export function useNotificationSettings() {
  return useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const response = await api.get('/notifications/settings');
      return response.data.preferences as NotificationPreferences;
    },
  });
}

// Update notification preferences
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      const response = await api.put('/notifications/settings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });
}
