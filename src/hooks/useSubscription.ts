import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import type { Subscription, PlanType } from '@/types';

// Response types
interface SubscriptionResponse {
  data?: Subscription;
  subscription?: Subscription;
}

interface PriceCalculation {
  plan: PlanType;
  base_price: number;
  discount: number;
  total: number;
  currency: string;
}

interface LimitsCheck {
  can_add_guests: boolean;
  can_add_collaborators: boolean;
  guests_remaining: number;
  collaborators_remaining: number;
  current_guests: number;
  current_collaborators: number;
  guest_limit: number;
  collaborator_limit: number | null;
}

// Get subscription for an event
export function useEventSubscription(eventId: string | number) {
  return useQuery({
    queryKey: ['events', eventId, 'subscription'],
    queryFn: async (): Promise<Subscription | null> => {
      try {
        const response = await api.get<SubscriptionResponse | Subscription>(
          `/events/${eventId}/subscription`
        );
        const data = response.data;

        if (data && 'subscription' in data) {
          return data.subscription || null;
        }
        if (data && 'data' in data) {
          return data.data || null;
        }
        if (data && 'id' in data) {
          return data as Subscription;
        }

        return null;
      } catch (error: unknown) {
        // No subscription exists
        if ((error as { response?: { status: number } })?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!eventId,
  });
}

// List all user subscriptions
export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async (): Promise<Subscription[]> => {
      const response = await api.get('/subscriptions');
      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      }
      if (data && 'data' in data) {
        return data.data || [];
      }
      if (data && 'subscriptions' in data) {
        return data.subscriptions || [];
      }

      return [];
    },
  });
}

// Calculate price for a plan
export function useCalculatePrice(eventId: string | number, plan: PlanType | null) {
  return useQuery({
    queryKey: ['events', eventId, 'subscription', 'price', plan],
    queryFn: async (): Promise<PriceCalculation> => {
      const response = await api.get(
        `/events/${eventId}/subscription/calculate-price`,
        { params: { plan } }
      );
      return response.data;
    },
    enabled: !!eventId && !!plan,
  });
}

// Check plan limits
export function useCheckLimits(eventId: string | number) {
  return useQuery({
    queryKey: ['events', eventId, 'subscription', 'limits'],
    queryFn: async (): Promise<LimitsCheck> => {
      const response = await api.get(`/events/${eventId}/subscription/check-limits`);
      return response.data;
    },
    enabled: !!eventId,
  });
}

// Subscribe to a plan
export function useSubscribe(eventId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { plan_type: PlanType; payment_id?: number }) => {
      console.log('useSubscribe mutation:', data);
      const response = await api.post(`/events/${eventId}/subscription`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
    },
  });
}

// Upgrade subscription
export function useUpgradeSubscription(eventId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { plan_type: PlanType; payment_id?: number }) => {
      console.log('useUpgradeSubscription mutation:', data);
      const response = await api.post(`/events/${eventId}/subscription/upgrade`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

// Cancel subscription
export function useCancelSubscription(eventId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post(`/events/${eventId}/subscription/cancel`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

// Renew subscription
export function useRenewSubscription(eventId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { payment_id?: number }) => {
      const response = await api.post(`/events/${eventId}/subscription/renew`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId, 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

// Get current user's account-level subscription
export interface CurrentSubscriptionResponse {
  subscription: Subscription | null;
  quota: {
    base_quota: number;
    topup_credits: number;
    total_quota: number;
    used: number;
    remaining: number;
    is_unlimited: boolean;
    percentage_used: number;
    can_create: boolean;
  };
  has_subscription: boolean;
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['user', 'subscription', 'current'],
    queryFn: async (): Promise<CurrentSubscriptionResponse> => {
      const response = await api.get<CurrentSubscriptionResponse>('/user/subscription');
      return response.data;
    },
  });
}

// Get user's quota
export interface QuotaResponse {
  quota: {
    base_quota: number;
    topup_credits: number;
    total_quota: number;
    used: number;
    remaining: number;
    is_unlimited: boolean;
    percentage_used: number;
    can_create: boolean;
  };
  warning: 'quota_reached' | 'quota_90' | 'quota_80' | null;
}

export function useQuota() {
  return useQuery({
    queryKey: ['user', 'quota'],
    queryFn: async (): Promise<QuotaResponse> => {
      const response = await api.get<QuotaResponse>('/user/quota');
      return response.data;
    },
  });
}

// Subscribe to a plan (account-level)
export function useSubscribeToPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { plan_id: number }) => {
      const response = await api.post('/subscriptions/subscribe', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'subscription'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'quota'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}