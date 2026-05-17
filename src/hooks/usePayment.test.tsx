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

vi.mock('@/lib/logger', () => ({ logger: { log: vi.fn(), error: vi.fn(), warn: vi.fn() } }));
vi.mock('@/lib/paymentTrace', () => ({ paymentTrace: vi.fn() }));
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn() }),
}));

import api from '@/api/client';
import {
  usePayments,
  useInitiatePayment,
  useInitiateMTNPayment,
  useInitiateAirtelPayment,
  useRetryPayment,
  getProviderFromPhone,
} from './usePayment';

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  mockedApi.get.mockResolvedValue({ data: { data: [] } });
  mockedApi.post.mockResolvedValue({ data: {} });
});

describe('usePayments', () => {
  it('returns the array when API returns a wrapped list', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [{ id: 1 }, { id: 2 }] } });

    const { result } = renderHookWithProviders(() => usePayments());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });

  it('returns the array when API returns a bare list', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 9 }] });

    const { result } = renderHookWithProviders(() => usePayments());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 9 }]);
  });

  it('falls back to an empty array when API returns an unexpected shape', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { foo: 'bar' } });

    const { result } = renderHookWithProviders(() => usePayments());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe('useInitiatePayment', () => {
  it('routes MTN method to /payments/mtn/initiate', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { message: 'ok', payment: { id: 1 }, reference: 'r', provider: 'mtn' },
    });

    const { result } = renderHookWithProviders(() => useInitiatePayment());

    result.current.mutate({
      subscription_id: 1,
      phone_number: '067123450',
      method: 'mtn_mobile_money',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post.mock.calls[0][0]).toBe('/payments/mtn/initiate');
  });

  it('routes Airtel method to /payments/airtel/initiate', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { message: 'ok', payment: { id: 1 }, reference: 'r', provider: 'airtel' },
    });

    const { result } = renderHookWithProviders(() => useInitiatePayment());

    result.current.mutate({
      subscription_id: 1,
      phone_number: '045123456',
      method: 'airtel_money',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post.mock.calls[0][0]).toBe('/payments/airtel/initiate');
  });

  it('uses the generic /payments/initiate endpoint when method is omitted', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { message: 'ok', payment: { id: 1 }, reference: 'r', provider: 'mtn' },
    });

    const { result } = renderHookWithProviders(() => useInitiatePayment());

    result.current.mutate({ subscription_id: 1, phone_number: '067123450' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post.mock.calls[0][0]).toBe('/payments/initiate');
  });

  it('generates an idempotency key when not provided', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { message: 'ok', payment: { id: 1 }, reference: 'r', provider: 'mtn' },
    });

    const { result } = renderHookWithProviders(() => useInitiatePayment());

    result.current.mutate({ subscription_id: 1, phone_number: '067123450' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const body = mockedApi.post.mock.calls[0][1] as { idempotency_key: string };
    expect(body.idempotency_key).toBeTruthy();
  });
});

describe('useInitiateMTNPayment', () => {
  it('always posts to the MTN endpoint', async () => {
    const { result } = renderHookWithProviders(() => useInitiateMTNPayment());

    result.current.mutate({ subscription_id: 1, phone_number: '067123450' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post).toHaveBeenCalledWith('/payments/mtn/initiate', expect.any(Object));
  });
});

describe('useInitiateAirtelPayment', () => {
  it('always posts to the Airtel endpoint', async () => {
    const { result } = renderHookWithProviders(() => useInitiateAirtelPayment());

    result.current.mutate({ subscription_id: 1, phone_number: '045000000' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post).toHaveBeenCalledWith('/payments/airtel/initiate', expect.any(Object));
  });
});

describe('useRetryPayment', () => {
  it('posts to /payments/:id/retry', async () => {
    const { result } = renderHookWithProviders(() => useRetryPayment());

    result.current.mutate(123);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post).toHaveBeenCalledWith('/payments/123/retry');
  });
});

describe('getProviderFromPhone', () => {
  it('identifies MTN numbers (06)', () => {
    expect(getProviderFromPhone('+24206123456')).toBe('mtn_mobile_money');
    expect(getProviderFromPhone('06123456')).toBe('mtn_mobile_money');
  });

  it('identifies Airtel numbers (04 / 05)', () => {
    expect(getProviderFromPhone('+24204123456')).toBe('airtel_money');
    expect(getProviderFromPhone('05123456')).toBe('airtel_money');
  });

  it('returns null for unknown prefixes', () => {
    expect(getProviderFromPhone('+24202000000')).toBeNull();
  });

  it('handles whitespace and country code variants', () => {
    expect(getProviderFromPhone('00242 06 12 34 56')).toBe('mtn_mobile_money');
  });
});
