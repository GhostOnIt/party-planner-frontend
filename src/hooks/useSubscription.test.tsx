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
    mockedApi.get.mockResolvedValueOnce({
      data: { plan: { name: 'Pro' }, subscription: { status: 'active' } },
    });

    const { result } = renderHookWithProviders(() => useCurrentSubscription());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.plan?.name).toBe('Pro');
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
