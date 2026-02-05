import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type { Photo, PhotoFilters } from '@/types';

// Pagination meta type
interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// API response type
interface PhotosApiResponse {
  data: Photo[];
  meta?: PaginationMeta;
}

// Full API response type
interface PhotosFullApiResponse {
  photos: {
    data: Photo[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  stats: {
    total: number;
    by_type: Record<string, number>;
    total_size: number;
  };
  can_add_photos: boolean;
  remaining_slots: number;
}

// Fetch photos list with pagination
export function usePhotos(eventId: string, filters: PhotoFilters = {}) {
  return useQuery({
    queryKey: ['events', eventId, 'photos', filters],
    queryFn: async () => {
      const response = await api.get<PhotosFullApiResponse>(
        `/events/${eventId}/photos`,
        { params: filters }
      );

      const responseData = response.data;

      // API returns { photos: { data: [...], ... }, stats: {...}, can_add_photos, remaining_slots }
      if (responseData && 'photos' in responseData) {
        const photosData = responseData.photos;
        // Log first photo to see structure
        if (photosData.data && photosData.data.length > 0) {
          console.log('[usePhotos] Photo structure:', photosData.data[0]);
        }
        return {
          data: photosData.data || [],
          meta: photosData.current_page ? {
            current_page: photosData.current_page,
            last_page: photosData.last_page || 1,
            per_page: photosData.per_page || 20,
            total: photosData.total || 0,
          } : undefined,
          stats: responseData.stats,
          can_add_photos: responseData.can_add_photos,
          remaining_slots: responseData.remaining_slots,
        };
      }

      // Handle array response: [...]
      if (Array.isArray(responseData)) {
        return { data: responseData, meta: undefined };
      }

      // Handle paginated response: { data: [...], meta: {...} }
      if (responseData && 'data' in responseData) {
        return responseData as PhotosApiResponse;
      }

      // Fallback
      return { data: [], meta: undefined };
    },
    enabled: !!eventId,
  });
}

// Fetch a single photo
export function usePhoto(eventId: string, photoId: number) {
  return useQuery({
    queryKey: ['events', eventId, 'photos', photoId],
    queryFn: async () => {
      const response = await api.get<Photo>(
        `/events/${eventId}/photos/${photoId}`
      );
      return response.data;
    },
    enabled: !!eventId && !!photoId,
  });
}

// Upload photos (supports multiple files)
export function useUploadPhotos(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      files,
      type = 'event_photo',
    }: {
      files: File[];
      type?: 'moodboard' | 'event_photo';
    }) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('photos[]', file);
      });
      formData.append('type', type);

      const response = await api.post<{ message: string; photos: Photo[] }>(
        `/events/${eventId}/photos`,
        formData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'photos'] });
    },
  });
}

// Update photo (caption, is_featured, etc.)
export function useUpdatePhoto(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      photoId,
      data,
    }: {
      photoId: number;
      data: { caption?: string; is_featured?: boolean };
    }) => {
      const response = await api.put<Photo>(
        `/events/${eventId}/photos/${photoId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'photos'] });
    },
  });
}

// Delete a single photo
export function useDeletePhoto(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: number) => {
      await api.delete(`/events/${eventId}/photos/${photoId}`);
      return photoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'photos'] });
    },
  });
}

// Delete multiple photos
export function useDeletePhotos(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoIds: number[]) => {
      await api.post(`/events/${eventId}/photos/bulk-delete`, {
        photos: photoIds,
      });
      return photoIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'photos'] });
    },
  });
}

// Download a photo
export function useDownloadPhoto(eventId: string) {
  return useMutation({
    mutationFn: async ({ photoId, filename }: { photoId: number; filename: string }) => {
      try {
        const response = await api.get(
          `/events/${eventId}/photos/${photoId}/download`,
          { responseType: 'blob' }
        );

        // Check if response is actually a blob
        if (!(response.data instanceof Blob)) {
          throw new Error('Réponse invalide du serveur');
        }

        // Create download link
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename || `photo-${photoId}.jpg`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // Clean up the URL after a short delay to ensure download starts
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
      } catch (error: any) {
        // If error response is a blob (JSON error), try to parse it
        if (error.response?.data instanceof Blob) {
          const text = await error.response.data.text();
          try {
            const jsonError = JSON.parse(text);
            throw new Error(jsonError.message || 'Erreur lors du téléchargement');
          } catch {
            throw new Error('Erreur lors du téléchargement de la photo');
          }
        }
        throw error;
      }
    },
  });
}

// Download multiple photos as ZIP
export function useDownloadMultiplePhotos(eventId: string) {
  return useMutation({
    mutationFn: async ({ photoIds }: { photoIds: number[] }) => {
      const response = await api.post(
        `/events/${eventId}/photos/bulk-download`,
        { photos: photoIds },
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `photos-${eventId}-${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}

// Set photo as featured
export function useSetFeaturedPhoto(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: number) => {
      const response = await api.post<Photo>(
        `/events/${eventId}/photos/${photoId}/set-featured`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'photos'] });
    },
  });
}

// Toggle featured status
export function useToggleFeaturedPhoto(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: number) => {
      const response = await api.post<Photo>(
        `/events/${eventId}/photos/${photoId}/toggle-featured`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'photos'] });
    },
  });
}

// Photo statistics
export interface PhotoStats {
  total: number;
  by_type: Record<string, number>;
  total_size: number;
}

export function usePhotoStats(eventId: string) {
  return useQuery({
    queryKey: ['events', eventId, 'photos', 'statistics'],
    queryFn: async () => {
      const response = await api.get<PhotoStats>(
        `/events/${eventId}/photos/statistics`
      );
      return response.data;
    },
    enabled: !!eventId,
  });
}
