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

        const response = await api.post<CreateEventResponse>('/events', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data.event;
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
              await subscribeMutation.mutateAsync({ plan_id: trialData.data.id });
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
            action: React.createElement(
              ToastAction,
              {
                altText: "Activer l'essai gratuit",
                onClick: handleActivateTrial,
              },
              'Activer l\'essai'
            ),
          });
        } else {
          // Pas de trial disponible, proposer les plans
          toast({
            title: 'Abonnement requis',
            description: 'Pour créer un événement, vous devez souscrire à un plan.',
            variant: 'default',
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
