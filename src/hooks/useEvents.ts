import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import api from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { useAvailableTrial } from '@/hooks/useAdminPlans';
import { useSubscribeToPlan } from '@/hooks/useSubscription';
import { ToastAction } from '@/components/ui/toast';
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

interface CreateEventResponse {
  event: Event;
  quota: any;
}

// Create event
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: trialData } = useAvailableTrial();
  const subscribeMutation = useSubscribeToPlan();

  return useMutation({
    mutationFn: async (data: CreateEventFormData & { cover_photo?: File }) => {
      const { cover_photo, ...eventData } = data;

      // Si une photo de couverture est fournie, utiliser FormData
      if (cover_photo) {
        const formData = new FormData();

        // Ajouter les données de l'événement
        Object.entries(eventData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (key === 'expected_guests' && typeof value === 'number') {
              formData.append('expected_guests_count', value.toString());
            } else if (key === 'template_id' && typeof value === 'number') {
              formData.append('template_id', value.toString());
            } else if (key !== 'template_id') {
              formData.append(key, value.toString());
            }
          }
        });
        
        // Si template_id est null (utilisateur a choisi "Aucun template"), l'envoyer explicitement comme chaîne vide
        if ('template_id' in eventData && eventData.template_id === null) {
          formData.append('template_id', '');
        }

        // Ajouter la photo de couverture
        formData.append('cover_photo', cover_photo);

        // The API client interceptor will automatically handle Content-Type for FormData
        const response = await api.post<CreateEventResponse>('/events', formData);
        return response.data.event;
      } else {
        // Sinon, envoyer en JSON normal
        const jsonData: Record<string, string | number | undefined> = {
          ...eventData,
        };

        if (jsonData.expected_guests !== undefined) {
          jsonData.expected_guests_count = jsonData.expected_guests;
          delete jsonData.expected_guests;
        }

        const response = await api.post<CreateEventResponse>('/events', jsonData);
        return response.data.event;
      }
    },
    onError: (error: unknown) => {
      const errorData = (error as { response?: { data?: any } })?.response?.data;
      const errorType = errorData?.error;
      const errorMessage = errorData?.message || 'Une erreur est survenue lors de la création de l\'événement.';

      if (errorType === 'no_subscription') {
        // Pas d'abonnement - message clair avec actions
        const hasTrial = trialData?.available && trialData.data;
        
        if (hasTrial && trialData.data) {
          // Proposer l'essai gratuit en priorité
          const handleActivateTrial = async () => {
            try {
              await subscribeMutation.mutateAsync({ plan_id: trialData.data!.id });
              toast({
                title: 'Essai activé',
                description: 'Votre essai gratuit a été activé. Vous pouvez maintenant créer un événement.',
              });
              // Refresh pour mettre à jour le quota
              queryClient.invalidateQueries({ queryKey: ['user', 'subscription'] });
              queryClient.invalidateQueries({ queryKey: ['user', 'quota'] });
            } catch (err) {
              toast({
                title: 'Erreur',
                description: 'Impossible d\'activer l\'essai gratuit.',
                variant: 'destructive',
              });
            }
          };

          toast({
            title: 'Abonnement requis',
            description: 'Pour créer un événement, vous devez activer un plan. Commencez par l\'essai gratuit !',
            variant: 'default',
            // @ts-ignore - ToastAction type issue
            action: React.createElement(
              ToastAction,
              {
                altText: "Activer l'essai gratuit",
                onClick: handleActivateTrial,
              },
              "Activer l'essai"
            ),
          });
        } else {
          // Pas de trial disponible, proposer les plans
          toast({
            title: 'Abonnement requis',
            description: 'Pour créer un événement, vous devez souscrire à un plan.',
            variant: 'default',
            // @ts-ignore - ToastAction type issue
            action: React.createElement(
              ToastAction,
              {
                altText: 'Voir les plans',
                onClick: () => navigate('/plans'),
              },
              'Voir les plans'
            ),
          });
        }
      } else if (errorType === 'quota_exceeded') {
        // Quota atteint - message avec options upgrade/topup
        toast({
          title: 'Quota atteint',
          description: 'Vous avez utilisé tous vos crédits de création d\'événements pour cette période.',
          variant: 'default',
          // @ts-ignore - ToastAction type issue
          action: React.createElement(
            ToastAction,
            {
              altText: 'Voir les options',
              onClick: () => navigate('/plans'),
            },
            'Voir les options'
          ),
        });
      } else {
        // Autre erreur
        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'quota'] });
      navigate(`/events/${event.id}`);
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

// Duplicate event (with form data + options: include guests, tasks, budget)
export interface DuplicateEventPayload {
  sourceEventId: string | number;
  title: string;
  type: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  theme?: string;
  expected_guests_count?: number;
  include_guests: boolean;
  include_tasks: boolean;
  include_budget: boolean;
  include_collaborators: boolean;
}

export function useDuplicateEvent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: DuplicateEventPayload) => {
      const { sourceEventId, ...body } = payload;
      const response = await api.post<Event>(`/events/${sourceEventId}/duplicate`, body);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Événement dupliqué',
        description: 'Votre événement a été dupliqué avec succès.',
      });
      navigate(`/events/${data.id}`);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({
        title: 'Erreur',
        description: msg || 'Impossible de dupliquer l\'événement.',
        variant: 'destructive',
      });
    },
  });
}

// Cancel event
export function useCancelEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (eventId: number | string) => {
      const response = await api.put<Event>(`/events/${eventId}`, { status: 'cancelled' });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: 'Événement annulé',
        description: 'L\'événement a été annulé avec succès.',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'annulation de l\'événement.',
        variant: 'destructive',
      });
    },
  });
}
