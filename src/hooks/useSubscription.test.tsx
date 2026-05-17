import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';

vi.mock('@/api/client', () => {
  const api = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  return { default: api };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn() }),
}));

import api from '@/api/client';
import {
  useCurrentSubscription,
  useQuota,
  useSubscribeToPlan,
  useSubscriptions,
  type CurrentSubscriptionResponse,
} from './useSubscription';

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  mockedApi.get.mockResolvedValue({ data: {} });
  mockedApi.post.mockResolvedValue({ data: {} });
});

describe('useCurrentSubscription', () => {
  it('hits /user/subscription and exposes the response payload', async () => {
    const payload: CurrentSubscriptionResponse = {
      subscription: {
        id: 'sub-1',
        user_id: 'user-1',
        event_id: 'event-1',
        plan_type: 'pro',
        base_price: '15000',
        guest_count: 100,
        guest_price_per_unit: '30',
        total_price: '15000',
        payment_status: 'paid',
        payment_method: 'mtn_mobile_money',
        payment_reference: null,
        expires_at: '2027-01-01T00:00:00Z',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      has_subscription: true,
      quota: {
        base_quota: 10,
        topup_credits: 0,
        total_quota: 10,
        used: 2,
        remaining: 8,
        is_unlimited: false,
        percentage_used: 20,
        can_create: true,
      },
    };

    mockedApi.get.mockResolvedValueOnce({ data: payload });

    const { result } = renderHookWithProviders(() => useCurrentSubscription());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.has_subscription).toBe(true);
    expect(result.current.data?.subscription?.plan_type).toBe('pro');
    expect(mockedApi.get).toHaveBeenCalledWith('/user/subscription');
  });
});

describe('useQuota', () => {
  it('hits /user/quota', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { quota: { remaining: 3, can_create: true }, warning: null },
    });

    const { result } = renderHookWithProviders(() => useQuota());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.quota.remaining).toBe(3);
  });
});

describe('useSubscriptions', () => {
  it('lists subscriptions', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { data: [{ id: 1 }, { id: 2 }] },
    });

    const { result } = renderHookWithProviders(() => useSubscriptions());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.get).toHaveBeenCalled();
  });
});

describe('useSubscribeToPlan', () => {
  it('posts to /subscriptions/subscribe with the plan id', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { subscription: { id: 42 } } });

    const { result } = renderHookWithProviders(() => useSubscribeToPlan());

    result.current.mutate({ plan_id: 7 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post).toHaveBeenCalledWith('/subscriptions/subscribe', { plan_id: 7 });
  });
});
