import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/utils';

// Mock @/api/client BEFORE importing the hooks under test.
vi.mock('@/api/client', () => {
  const api = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
  return { default: api, getApiErrorMessage: (e: any) => e?.message ?? 'error' };
});

// Toaster: don't render real toasts during tests.
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn() }),
}));

import api from '@/api/client';
import {
  useEvents,
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from './useEvents';

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  // Default mocks — overridable per test.
  mockedApi.get.mockResolvedValue({ data: { available: false, data: null } });
  mockedApi.post.mockResolvedValue({ data: {} });
  mockedApi.put.mockResolvedValue({ data: {} });
  mockedApi.delete.mockResolvedValue({ data: {} });
});

describe('useEvents', () => {
  it('fetches the events list', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { data: [{ id: 1, title: 'A' }], total: 1 },
    });

    const { result } = renderHookWithProviders(() => useEvents({}));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(mockedApi.get).toHaveBeenCalledWith('/events', expect.any(Object));
  });
});

describe('useEvent', () => {
  it('fetches a single event when id is provided', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { id: 42, title: 'Z' } });

    const { result } = renderHookWithProviders(() => useEvent(42));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.title).toBe('Z');
  });

  it('is disabled when id is undefined', () => {
    const { result } = renderHookWithProviders(() => useEvent(undefined));
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateEvent', () => {
  it('creates an event without cover photo (JSON path)', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { event: { id: 7, title: 'New' }, quota: {} },
    });

    const { result } = renderHookWithProviders(() => useCreateEvent());

    result.current.mutate({
      title: 'New',
      type: 'anniversaire',
      date: '2026-09-01',
      time: '18:00',
    } as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post).toHaveBeenCalledWith('/events', expect.objectContaining({ title: 'New' }));
  });

  it('creates an event WITH cover photo (FormData path)', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: { event: { id: 8, title: 'WithPhoto' }, quota: {} },
    });

    const { result } = renderHookWithProviders(() => useCreateEvent());

    const file = new File(['x'], 'cover.jpg', { type: 'image/jpeg' });
    result.current.mutate({
      title: 'WithPhoto',
      type: 'anniversaire',
      date: '2026-09-01',
      cover_photo: file,
    } as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const [url, body] = mockedApi.post.mock.calls[0];
    expect(url).toBe('/events');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('cover_photo')).toBe(file);
    expect(result.current.data?.warning).toBeUndefined();
  });

  it('exposes the warning when cover photo upload fails server-side', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        event: { id: 9, title: 'PhotoBroken' },
        quota: {},
        warning: 'L\'événement a été créé, mais la photo de couverture n\'a pas pu être uploadée.',
      },
    });

    const { result } = renderHookWithProviders(() => useCreateEvent());

    result.current.mutate({
      title: 'PhotoBroken',
      type: 'anniversaire',
      date: '2026-09-01',
      cover_photo: new File(['x'], 'c.jpg', { type: 'image/jpeg' }),
    } as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.warning).toContain('photo de couverture');
  });
});

describe('useUpdateEvent', () => {
  it('updates an event without photo and normalizes plain response', async () => {
    mockedApi.put.mockResolvedValueOnce({ data: { id: 5, title: 'Edited' } });

    const { result } = renderHookWithProviders(() => useUpdateEvent(5));

    result.current.mutate({ title: 'Edited' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.event.id).toBe(5);
    expect(result.current.data?.warning).toBeUndefined();
  });

  it('surfaces the warning when the API wraps the event with a warning', async () => {
    mockedApi.put.mockResolvedValueOnce({
      data: {
        event: { id: 6, title: 'Edited' },
        warning: 'Photo upload failed.',
      },
    });

    const { result } = renderHookWithProviders(() => useUpdateEvent(6));

    result.current.mutate({
      title: 'Edited',
      cover_photo: new File(['x'], 'c.jpg', { type: 'image/jpeg' }),
    } as any);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.warning).toBe('Photo upload failed.');
  });
});

describe('useDeleteEvent', () => {
  it('deletes an event and resolves with its id', async () => {
    mockedApi.delete.mockResolvedValueOnce({ data: {} });

    const { result } = renderHookWithProviders(() => useDeleteEvent());

    result.current.mutate(11);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.delete).toHaveBeenCalledWith('/events/11');
    expect(result.current.data).toBe(11);
  });
});
