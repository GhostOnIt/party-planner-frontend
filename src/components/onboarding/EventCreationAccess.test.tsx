import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';

const state = vi.hoisted(() => ({
  access: { data: { has_subscription: false, quota: { can_create: false, used: 0 } }, isLoading: false, isError: false, refetch: vi.fn() },
  trial: { data: { available: true, data: { id: 'trial', duration_label: '14 jours', limits: { 'events.creations_per_billing_period': 1, 'guests.max_per_event': 10 } } }, isLoading: false, isError: false, refetch: vi.fn() },
  subscribe: { mutateAsync: vi.fn(), isPending: false },
}));
vi.mock('@/hooks/useSubscription', () => ({ useCurrentSubscription: () => state.access, useSubscribeToPlan: () => state.subscribe }));
vi.mock('@/hooks/useAdminPlans', () => ({ useAvailableTrial: () => state.trial }));
vi.mock('@/api/client', () => ({ getApiErrorMessage: () => 'Activation impossible' }));

import { EventCreationAccess } from './EventCreationAccess';

beforeEach(() => {
  state.access.isError = false;
  state.access.isLoading = false;
  state.access.data = { has_subscription: false, quota: { can_create: false, used: 0 } };
  state.trial.data.available = true;
  state.subscribe.mutateAsync.mockReset();
});

describe('Event creation eligibility', () => {
  it('explains the requirement before showing a form and never activates a plan automatically', () => {
    renderWithProviders(<EventCreationAccess><input aria-label="Titre" /></EventCreationAccess>);
    expect(screen.queryByLabelText('Titre')).not.toBeInTheDocument();
    expect(screen.getByText(/avant de remplir le formulaire/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activer mon essai' })).toBeInTheDocument();
    expect(state.subscribe.mutateAsync).not.toHaveBeenCalled();
  });

  it('activates an eligible trial only after the user asks, then checks access again', async () => {
    state.subscribe.mutateAsync.mockResolvedValue({});
    renderWithProviders(<EventCreationAccess>Formulaire</EventCreationAccess>);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Activer mon essai' }));
    expect(state.subscribe.mutateAsync).toHaveBeenCalledWith({ plan_id: 'trial' });
    await waitFor(() => expect(state.access.refetch).toHaveBeenCalled());
  });

  it('shows the form when the server authorizes creation', () => {
    state.access.data.quota.can_create = true;
    renderWithProviders(<EventCreationAccess><input aria-label="Titre" /></EventCreationAccess>);
    expect(screen.getByLabelText('Titre')).toBeInTheDocument();
  });

  it('explains exhausted quota instead of proposing a new trial', () => {
    state.access.data.has_subscription = true;
    state.access.data.quota.used = 1;
    renderWithProviders(<EventCreationAccess>Formulaire</EventCreationAccess>);
    expect(screen.getByText(/quota de création est atteint/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activer mon essai' })).not.toBeInTheDocument();
  });

  it('offers paid plans without automatically charging or activating a subscription', () => {
    state.trial.data.available = false;
    renderWithProviders(<EventCreationAccess>Formulaire</EventCreationAccess>);
    expect(screen.getByRole('link', { name: 'Voir les forfaits' })).toHaveAttribute('href', '/plans');
    expect(screen.queryByRole('button', { name: 'Activer mon essai' })).not.toBeInTheDocument();
    expect(state.subscribe.mutateAsync).not.toHaveBeenCalled();
  });

  it('keeps the form hidden when access verification fails', () => {
    state.access.isError = true;
    renderWithProviders(<EventCreationAccess><input aria-label="Titre" /></EventCreationAccess>);
    expect(screen.queryByLabelText('Titre')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Réessayer la vérification' })).toBeInTheDocument();
  });

  it('displays an activation error and keeps the user on the same step', async () => {
    state.subscribe.mutateAsync.mockRejectedValue(new Error('failed'));
    renderWithProviders(<EventCreationAccess>Formulaire</EventCreationAccess>);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Activer mon essai' }));
    expect(await screen.findByText('Activation impossible')).toBeInTheDocument();
    expect(screen.queryByText('Formulaire')).not.toBeInTheDocument();
  });
});
