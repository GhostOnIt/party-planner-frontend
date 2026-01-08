import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import { useAuthStore } from '@/stores/authStore';

interface UpdateProfileData {
  name: string;
  phone?: string;
  avatar?: File;
}

interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// Update profile (name, phone, avatar)
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      // Use FormData if avatar is included, otherwise JSON
      if (data.avatar) {
        const formData = new FormData();
        formData.append('name', data.name);
        if (data.phone) formData.append('phone', data.phone);
        formData.append('avatar', data.avatar);

        const response = await api.post('/user/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }

      const response = await api.post('/user/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update user in auth store - handle different response formats
      const user = data.user || data.data || data;
      if (user && user.id) {
        setUser(user);
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Change password
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await api.put('/api/auth/password', data);
      return response.data;
    },
  });
}

// Upload avatar (via POST /user/profile with avatar field)
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('[useUploadAvatar] Response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('[useUploadAvatar] onSuccess data:', data);
      // Update user in auth store with new avatar
      const user = data.user || data.data || data;
      console.log('[useUploadAvatar] Extracted user:', user);
      if (user && user.id) {
        setUser(user);
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Delete avatar
export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/user/profile/avatar');
      console.log('[useDeleteAvatar] Response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('[useDeleteAvatar] onSuccess data:', data);
      const user = data.user || data.data;
      if (user && user.id) {
        setUser(user);
      } else if (currentUser) {
        // If API doesn't return user, clear avatar from current user
        setUser({ ...currentUser, avatar_url: null });
      }
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Delete account
export function useDeleteAccount() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async (password: string) => {
      const response = await api.delete('/user', {
        data: { password },
      });
      return response.data;
    },
    onSuccess: () => {
      logout();
    },
  });
}
