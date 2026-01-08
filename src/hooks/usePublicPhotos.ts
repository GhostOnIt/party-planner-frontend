import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicApi } from '@/api/client';
import type { Photo } from '@/types';

// Pagination meta type
interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// API response type for public photos
interface PublicPhotosApiResponse {
  photos: {
    data: Photo[];
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  event: {
    id: number;
    title: string;
    date: string;
    location: string | null;
  };
  guest: {
    name: string;
  };
}

// Fetch public photos for an event
export function usePublicPhotos(
  eventId: string,
  token: string,
  filters: { page?: number; per_page?: number } = {}
) {
  return useQuery({
    queryKey: ['public-photos', eventId, token, filters],
    queryFn: async () => {
      const response = await publicApi.get<PublicPhotosApiResponse>(
        `/events/${eventId}/photos/public/${token}`,
        { params: filters }
      );

      const responseData = response.data;

      if (responseData && 'photos' in responseData) {
        const photosData = responseData.photos;
        return {
          data: photosData.data || [],
          meta: photosData.current_page
            ? {
                current_page: photosData.current_page,
                last_page: photosData.last_page || 1,
                per_page: photosData.per_page || 20,
                total: photosData.total || 0,
              }
            : undefined,
          event: responseData.event,
          guest: responseData.guest,
        };
      }

      return {
        data: [],
        meta: undefined,
        event: responseData.event,
        guest: responseData.guest,
      };
    },
    enabled: !!eventId && !!token,
    retry: false,
  });
}

// Upload photos publicly
export function usePublicUploadPhotos(eventId: string, token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ files }: { files: File[] }) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('photos[]', file);
      });

      const response = await publicApi.post<{ message: string; photos: Photo[] }>(
        `/events/${eventId}/photos/public/${token}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-photos', eventId, token] });
    },
  });
}

// Download multiple photos as ZIP
export function usePublicDownloadPhotos(eventId: string, token: string) {
  return useMutation({
    mutationFn: async ({ photoIds }: { photoIds: number[] }) => {
      const response = await publicApi.post(
        `/events/${eventId}/photos/public/${token}/download-multiple`,
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

