import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Hook mocks — we don't need a real React Query roundtrip to assert UI wiring.
const stages = [
  { id: 's1', name: 'Nouvelle', slug: 'new', sort_order: 0, is_active: true, is_system: true },
  { id: 's2', name: 'Qualifiée', slug: 'qualified', sort_order: 1, is_active: true, is_system: false },
  { id: 's3', name: 'Gagnée', slug: 'won', sort_order: 2, is_active: false, is_system: false },
];

const mutateCreate = vi.fn((payload, opts) => opts?.onSuccess?.());
const mutateUpdate = vi.fn((payload, opts) => opts?.onSuccess?.());
const mutateDelete = vi.fn((payload, opts) => opts?.onSuccess?.());
const mutateReorder = vi.fn((payload, opts) => opts?.onSuccess?.());

vi.mock('@/hooks/useQuoteRequests', () => ({
  useAdminQuoteStages: () => ({ data: stages }),
  useCreateQuoteStage: () => ({ mutate: mutateCreate, isPending: false }),
  useUpdateQuoteStageConfig: () => ({ mutate: mutateUpdate }),
  useDeleteQuoteStage: () => ({ mutate: mutateDelete }),
  useReorderQuoteStages: () => ({ mutate: mutateReorder }),
}));

const toast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast, dismiss: vi.fn() }),
}));

import { QuoteStagesManager } from './QuoteStagesManager';

beforeEach(() => {
  mutateCreate.mockClear();
  mutateUpdate.mockClear();
  mutateDelete.mockClear();
  mutateReorder.mockClear();
  toast.mockClear();
});

describe('QuoteStagesManager', () => {
  it('renders every stage with its name', () => {
    renderWithProviders(<QuoteStagesManager />);

    expect(screen.getByText('Nouvelle')).toBeInTheDocument();
    expect(screen.getByText('Qualifiée')).toBeInTheDocument();
    expect(screen.getByText('Gagnée')).toBeInTheDocument();
  });

  it('shows the "Système" badge on system stages', () => {
    renderWithProviders(<QuoteStagesManager />);
    expect(screen.getByText('Système')).toBeInTheDocument();
  });

  it('creates a new stage when name + slug filled and Ajouter is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuoteStagesManager />);

    await user.type(screen.getByPlaceholderText("Nom de l'étape"), 'Nouvelle étape');
    await user.type(screen.getByPlaceholderText('slug_unique'), 'new_stage');
    await user.click(screen.getByRole('button', { name: /Ajouter/i }));

    expect(mutateCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nouvelle étape', slug: 'new_stage' }),
      expect.any(Object)
    );
  });

  it('does not call create when fields are empty (button stays disabled)', async () => {
    renderWithProviders(<QuoteStagesManager />);

    const addButton = screen.getByRole('button', { name: /Ajouter/i });
    expect(addButton).toBeDisabled();
    expect(mutateCreate).not.toHaveBeenCalled();
  });

  it('toggles a stage active state via the Switch', () => {
    renderWithProviders(<QuoteStagesManager />);

    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);

    expect(mutateUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ stageId: expect.any(String), is_active: expect.any(Boolean) }),
      expect.any(Object)
    );
  });

  it('opens the delete confirmation for a non-system stage', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QuoteStagesManager />);

    // Delete buttons (trash icons). The first stage is system → button disabled.
    const deleteButtons = screen.getAllByRole('button').filter((b) =>
      b.querySelector('svg.lucide-trash2')
    );
    // Trash buttons render even when disabled — pick the first enabled one.
    const enabled = deleteButtons.find((b) => !(b as HTMLButtonElement).disabled);
    expect(enabled).toBeDefined();
    await user.click(enabled!);

    expect(screen.getByText(/Supprimer cette étape/i)).toBeInTheDocument();
  });
});
