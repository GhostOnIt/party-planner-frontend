import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/api/client';
import type { Event, PaginatedResponse, EventFilters, CreateEventFormData } from '@/types';

// List events with filters and pagination
export function useEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Event>>('/events', {
        params: filters,
      });
      return response.data;
    },
  });
}

// Get single event
export function useEvent(eventId: number | string | undefined) {
  return useQuery({
    queryKey: ['events', eventId],
    queryFn: async () => {
      const response = await api.get<Event>(`/events/${eventId}`);
      return response.data;
    },
    enabled: !!eventId,
  });
}

// Create event
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: CreateEventFormData & { cover_photo?: File }) => {
      const { cover_photo, ...eventData } = data;

      // Si une photo de couverture est fournie, utiliser FormData
      if (cover_photo) {
        const formData = new FormData();

        // Ajouter les données de l'événement
        Object.entries(eventData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'budget' && typeof value === 'number') {
              formData.append('estimated_budget', value.toString());
            } else if (key === 'expected_guests' && typeof value === 'number') {
              formData.append('expected_guests_count', value.toString());
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        // Ajouter la photo de couverture
        formData.append('cover_photo', cover_photo);

        const response = await api.post<Event>('/events', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // Sinon, envoyer en JSON normal
        const jsonData: Record<string, string | number | undefined> = {
          ...eventData,
        };

        // Mapper les noms de champs pour correspondre au backend
        if (jsonData.budget !== undefined) {
          jsonData.estimated_budget = jsonData.budget;
          delete jsonData.budget;
        }
        if (jsonData.expected_guests !== undefined) {
          jsonData.expected_guests_count = jsonData.expected_guests;
          delete jsonData.expected_guests;
        }

        const response = await api.post<Event>('/events', jsonData);
        return response.data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate(`/events/${data.id}`);
    },
  });
}

// Update event
export function useUpdateEvent(eventId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CreateEventFormData>) => {
      const response = await api.put<Event>(`/events/${eventId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// Delete event
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (eventId: number | string) => {
      await api.delete(`/events/${eventId}`);
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/events');
    },
  });
}

// Duplicate event
export function useDuplicateEvent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (eventId: number | string) => {
      const response = await api.post<Event>(`/events/${eventId}/duplicate`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/events/${data.id}`);
    },
  });
}
