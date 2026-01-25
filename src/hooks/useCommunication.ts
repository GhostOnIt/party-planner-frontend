import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { publicApi } from '@/api/client';
import type {
  CommunicationSpot,
  SpotFilters,
  CreateSpotFormData,
  UpdateSpotFormData,
  SpotsResponse,
  ActiveSpotsResponse,
  PollResults,
  VoteResponse,
  DisplayLocation,
} from '@/types/communication';

// Query keys
export const communicationKeys = {
  all: ['communication'] as const,
  spots: (filters?: SpotFilters) => [...communicationKeys.all, 'spots', filters] as const,
  spot: (id: string) => [...communicationKeys.all, 'spot', id] as const,
  activeSpots: (location: DisplayLocation) => [...communicationKeys.all, 'active', location] as const,
  pollResults: (id: string) => [...communicationKeys.all, 'poll-results', id] as const,
  userVote: (spotId: string) => [...communicationKeys.all, 'user-vote', spotId] as const,
};

// ============================================
// ADMIN HOOKS
// ============================================

// List spots with filters and pagination (admin)
export function useSpots(filters: SpotFilters = {}) {
  return useQuery({
    queryKey: communicationKeys.spots(filters),
    queryFn: async (): Promise<SpotsResponse> => {
      const response = await api.get('/admin/communication', { params: filters });
      return response.data;
    },
  });
}

// Get single spot (admin)
export function useSpot(id: string | null) {
  return useQuery({
    queryKey: communicationKeys.spot(id || ''),
    queryFn: async (): Promise<CommunicationSpot> => {
      const response = await api.get(`/admin/communication/${id}`);
      return response.data.data || response.data;
    },
    enabled: !!id,
  });
}

// Create spot (admin)
export function useCreateSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSpotFormData): Promise<CommunicationSpot> => {
      // Handle file upload if image is a File
      if (data.image instanceof File) {
        const formData = new FormData();
        
        // Append all fields
        formData.append('type', data.type);
        formData.append('isActive', data.isActive ? '1' : '0');
        formData.append('priority', String(data.priority));
        formData.append('image', data.image);
        
        if (data.title) formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        if (data.badge) formData.append('badge', data.badge);
        if (data.badgeType) formData.append('badgeType', data.badgeType);
        if (data.startDate) formData.append('startDate', data.startDate);
        if (data.endDate) formData.append('endDate', data.endDate);
        
        // Arrays and objects as JSON
        formData.append('displayLocations', JSON.stringify(data.displayLocations));
        if (data.targetRoles?.length) formData.append('targetRoles', JSON.stringify(data.targetRoles));
        if (data.targetLanguages?.length) formData.append('targetLanguages', JSON.stringify(data.targetLanguages));
        
        // Banner specific
        if (data.primaryButton) formData.append('primaryButton', JSON.stringify(data.primaryButton));
        if (data.secondaryButton) formData.append('secondaryButton', JSON.stringify(data.secondaryButton));
        
        // Poll specific
        if (data.pollQuestion) formData.append('pollQuestion', data.pollQuestion);
        if (data.pollOptions?.length) formData.append('pollOptions', JSON.stringify(data.pollOptions));
        
        const response = await api.post('/admin/communication', formData);
        return response.data.data || response.data;
      } else {
        // No file upload, send as JSON
        const response = await api.post('/admin/communication', data);
        return response.data.data || response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.all });
    },
  });
}

// Update spot (admin)
export function useUpdateSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateSpotFormData> }): Promise<CommunicationSpot> => {
      // Handle file upload if image is a File
      if (data.image instanceof File) {
        const formData = new FormData();
        formData.append('_method', 'PUT'); // Laravel method spoofing for FormData
        
        formData.append('image', data.image);
        
        if (data.type) formData.append('type', data.type);
        if (data.isActive !== undefined) formData.append('isActive', data.isActive ? '1' : '0');
        if (data.priority !== undefined) formData.append('priority', String(data.priority));
        if (data.title) formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        if (data.badge) formData.append('badge', data.badge);
        if (data.badgeType) formData.append('badgeType', data.badgeType);
        if (data.startDate) formData.append('startDate', data.startDate);
        if (data.endDate) formData.append('endDate', data.endDate);
        
        if (data.displayLocations) formData.append('displayLocations', JSON.stringify(data.displayLocations));
        if (data.targetRoles) formData.append('targetRoles', JSON.stringify(data.targetRoles));
        if (data.targetLanguages) formData.append('targetLanguages', JSON.stringify(data.targetLanguages));
        
        if (data.primaryButton) formData.append('primaryButton', JSON.stringify(data.primaryButton));
        if (data.secondaryButton) formData.append('secondaryButton', JSON.stringify(data.secondaryButton));
        
        if (data.pollQuestion) formData.append('pollQuestion', data.pollQuestion);
        if (data.pollOptions) formData.append('pollOptions', JSON.stringify(data.pollOptions));
        
        const response = await api.post(`/admin/communication/${id}`, formData);
        return response.data.data || response.data;
      } else {
        const response = await api.put(`/admin/communication/${id}`, data);
        return response.data.data || response.data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.all });
      queryClient.invalidateQueries({ queryKey: communicationKeys.spot(variables.id) });
    },
  });
}

// Delete spot (admin)
export function useDeleteSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/admin/communication/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.all });
    },
  });
}

// Toggle spot active status (admin)
export function useToggleSpotStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<CommunicationSpot> => {
      const response = await api.patch(`/admin/communication/${id}/toggle`, { isActive });
      return response.data.data || response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.all });
      queryClient.invalidateQueries({ queryKey: communicationKeys.spot(variables.id) });
    },
  });
}

// Get poll results (admin)
export function usePollResults(spotId: string | null) {
  return useQuery({
    queryKey: communicationKeys.pollResults(spotId || ''),
    queryFn: async (): Promise<PollResults> => {
      const response = await api.get(`/admin/communication/${spotId}/results`);
      return response.data.data || response.data;
    },
    enabled: !!spotId,
  });
}

// Reset poll votes (admin)
export function useResetPollVotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spotId: string): Promise<void> => {
      await api.post(`/admin/communication/${spotId}/reset-votes`);
    },
    onSuccess: (_, spotId) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.pollResults(spotId) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.all });
    },
  });
}

// Close poll (admin)
export function useClosePoll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spotId: string): Promise<void> => {
      await api.post(`/admin/communication/${spotId}/close`);
    },
    onSuccess: (_, spotId) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.spot(spotId) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.all });
    },
  });
}

// Export poll results as CSV (admin)
export function useExportPollResults() {
  return useMutation({
    mutationFn: async (spotId: string): Promise<void> => {
      const response = await api.get(`/admin/communication/${spotId}/export`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `poll-results-${spotId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}

// ============================================
// PUBLIC/USER HOOKS
// ============================================

// Get active spots for a location (public/user)
export function useActiveSpots(location: DisplayLocation, enabled = true) {
  return useQuery({
    queryKey: communicationKeys.activeSpots(location),
    queryFn: async (): Promise<CommunicationSpot[]> => {
      const response = await api.get('/communication/active', { params: { location } });
      return response.data.data || response.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get active spots for login page (no auth required)
export function useLoginSpots(enabled = true) {
  return useQuery({
    queryKey: communicationKeys.activeSpots('login'),
    queryFn: async (): Promise<CommunicationSpot[]> => {
      const response = await publicApi.get('/communication/active', { params: { location: 'login' } });
      return response.data.data || response.data || [];
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Track click on spot (user)
export function useTrackClick() {
  return useMutation({
    mutationFn: async ({ spotId, buttonType }: { spotId: string; buttonType: 'primary' | 'secondary' }): Promise<void> => {
      await api.post(`/communication/${spotId}/click`, { buttonType });
    },
  });
}

// Check if user has voted on a poll
export function useUserVote(spotId: string | null) {
  return useQuery({
    queryKey: communicationKeys.userVote(spotId || ''),
    queryFn: async (): Promise<{ hasVoted: boolean; optionId?: string }> => {
      const response = await api.get(`/communication/${spotId}/vote`);
      return response.data;
    },
    enabled: !!spotId,
  });
}

// Vote on a poll (user - 1 vote per user)
export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ spotId, optionId }: { spotId: string; optionId: string }): Promise<VoteResponse> => {
      const response = await api.post(`/communication/${spotId}/vote`, { optionId });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: communicationKeys.userVote(variables.spotId) });
      queryClient.invalidateQueries({ queryKey: communicationKeys.activeSpots('dashboard') });
    },
  });
}

// Track view (impression) on spot
export function useTrackView() {
  return useMutation({
    mutationFn: async (spotId: string): Promise<void> => {
      await api.post(`/communication/${spotId}/view`);
    },
  });
}
