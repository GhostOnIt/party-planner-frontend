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
    mutationFn: async (data: CreateEventFormData) => {
      const response = await api.post<Event>('/events', data);
      return response.data;
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
