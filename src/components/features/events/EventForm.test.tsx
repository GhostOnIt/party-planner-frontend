import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('@/hooks/useTemplates', () => ({
  useTemplatesByType: () => ({ data: [], isLoading: false }),
}));

vi.mock('@/hooks/useSettings', () => ({
  useEventTypes: () => ({ data: [], isLoading: false }),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: { id: 1, role: 'user', name: 'Test User', email: 't@t.com' },
    }),
}));

vi.mock('@/components/features/photos', () => ({
  PhotoUploader: () => <div data-testid="photo-uploader" />,
}));

import { EventForm } from './EventForm';

describe('EventForm', () => {
  it('renders the core fields (title + location)', () => {
    renderWithProviders(<EventForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/titre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/lieu/i)).toBeInTheDocument();
  });

  it('shows the "Ajouter une photo de couverture" CTA when no cover photo is set', () => {
    renderWithProviders(<EventForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /photo de couverture/i })).toBeInTheDocument();
  });

  it('does not call onSubmit when required fields are missing (validation blocks submit)', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    const { container } = renderWithProviders(<EventForm onSubmit={onSubmit} />);

    const submit = container.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    expect(submit).not.toBeNull();
    await user.click(submit!);

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
