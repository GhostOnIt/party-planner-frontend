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
  useAdminQuoteStages,
  useCreateQuoteStage,
  useUpdateQuoteStageConfig,
  useDeleteQuoteStage,
  useReorderQuoteStages,
  useAdminQuoteRequests,
  useUpdateQuoteStage,
  useAssignQuoteRequest,
  useAddQuoteNote,
  useUpdateQuoteOutcome,
} from './useQuoteRequests';

const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  mockedApi.get.mockResolvedValue({ data: { data: [] } });
  mockedApi.post.mockResolvedValue({ data: {} });
  mockedApi.put.mockResolvedValue({ data: {} });
  mockedApi.patch.mockResolvedValue({ data: {} });
  mockedApi.delete.mockResolvedValue({ data: {} });
});

describe('useAdminQuoteStages', () => {
  it('returns the stages list', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { data: [{ id: 's1', name: 'Nouvelle', slug: 'new' }] },
    });

    const { result } = renderHookWithProviders(() => useAdminQuoteStages());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].slug).toBe('new');
  });

  it('returns an empty array when API omits `data`', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: {} });

    const { result } = renderHookWithProviders(() => useAdminQuoteStages());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe('useAdminQuoteRequests', () => {
  it('passes filters as query params', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { data: [], total: 0 } });

    const { result } = renderHookWithProviders(() =>
      useAdminQuoteRequests({ status: 'open' as any })
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.get).toHaveBeenCalledWith(
      '/admin/quote-requests',
      expect.objectContaining({ params: { status: 'open' } })
    );
  });
});

describe('useCreateQuoteStage', () => {
  it('posts to the stages endpoint', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { id: 'new-id' } });

    const { result } = renderHookWithProviders(() => useCreateQuoteStage());

    result.current.mutate({ name: 'Qualifiée', slug: 'qualified', sort_order: 1 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post).toHaveBeenCalledWith('/admin/quote-request-stages', {
      name: 'Qualifiée',
      slug: 'qualified',
      sort_order: 1,
    });
  });
});

describe('useUpdateQuoteStageConfig', () => {
  it('sends a PUT to /admin/quote-request-stages/:id with payload excluding stageId', async () => {
    mockedApi.put.mockResolvedValueOnce({ data: { id: 'abc' } });

    const { result } = renderHookWithProviders(() => useUpdateQuoteStageConfig());

    result.current.mutate({ stageId: 'abc', name: 'Renamed', is_active: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.put).toHaveBeenCalledWith('/admin/quote-request-stages/abc', {
      name: 'Renamed',
      is_active: false,
    });
  });
});

describe('useDeleteQuoteStage', () => {
  it('deletes by id', async () => {
    const { result } = renderHookWithProviders(() => useDeleteQuoteStage());

    result.current.mutate('abc');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.delete).toHaveBeenCalledWith('/admin/quote-request-stages/abc');
  });
});

describe('useReorderQuoteStages', () => {
  it('PATCHes the reorder endpoint with the stages payload', async () => {
    mockedApi.patch.mockResolvedValueOnce({ data: { ok: true } });

    const { result } = renderHookWithProviders(() => useReorderQuoteStages());

    const payload = [
      { id: 'a', sort_order: 0 },
      { id: 'b', sort_order: 1 },
    ];
    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.patch).toHaveBeenCalledWith('/admin/quote-request-stages/reorder', {
      stages: payload,
    });
  });
});

describe('useUpdateQuoteStage (per-request)', () => {
  it('moves a quote request to a stage', async () => {
    const { result } = renderHookWithProviders(() => useUpdateQuoteStage());

    result.current.mutate({ quoteRequestId: 'qr-1', stageId: 'st-2' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.patch).toHaveBeenCalledWith('/admin/quote-requests/qr-1/stage', {
      stage_id: 'st-2',
    });
  });
});

describe('useAssignQuoteRequest', () => {
  it('assigns to an admin id', async () => {
    const { result } = renderHookWithProviders(() => useAssignQuoteRequest());

    result.current.mutate({ quoteRequestId: 'qr-1', assignedAdminId: 'admin-9' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.patch).toHaveBeenCalledWith('/admin/quote-requests/qr-1/assign', {
      assigned_admin_id: 'admin-9',
    });
  });
});

describe('useAddQuoteNote', () => {
  it('adds a note', async () => {
    const { result } = renderHookWithProviders(() => useAddQuoteNote());

    result.current.mutate({ quoteRequestId: 'qr-1', note: 'Hello' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.post).toHaveBeenCalledWith('/admin/quote-requests/qr-1/notes', {
      note: 'Hello',
    });
  });
});

describe('useUpdateQuoteOutcome', () => {
  it('marks the outcome as won', async () => {
    const { result } = renderHookWithProviders(() => useUpdateQuoteOutcome());

    result.current.mutate({ quoteRequestId: 'qr-1', outcome: 'won', outcomeNote: 'Signed' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.patch).toHaveBeenCalledWith('/admin/quote-requests/qr-1/outcome', {
      outcome: 'won',
      outcome_note: 'Signed',
    });
  });
});
