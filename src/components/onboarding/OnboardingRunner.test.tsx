import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { renderWithProviders } from '@/test/utils';

const state = vi.hoisted(() => ({ events: { data: { total: 0 }, isLoading: false, isError: false } }));
vi.mock('@/hooks/useEvents', () => ({ useEvents: () => state.events }));
vi.mock('@/stores/authStore', () => ({ useAuthStore: () => ({ user: { id: 'standard-user', role: 'user' } }) }));

import { OnboardingRunner } from './OnboardingRunner';

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="Page actuelle">{location.pathname}</output>;
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  state.events = { data: { total: 0 }, isLoading: false, isError: false };
});

describe('First event guide', () => {
  it.each(['/dashboard', '/events', '/events/create'])('helps first-time users entering via %s', (route) => {
    renderWithProviders(<OnboardingRunner />, { initialRoute: route });
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText(/aucun envoi d’invitation/i)).toBeInTheDocument();
  });

  it('defers without marking the guide complete and lets the user reopen it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<OnboardingRunner />, { initialRoute: '/events' });
    await user.click(screen.getByRole('button', { name: 'Plus tard' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(localStorage.getItem('pp_onboarding_v1_standard-user_first_event_v2')).toBeNull();
    expect(sessionStorage.getItem('pp_onboarding_v1_standard-user_first_event_deferred')).toBe('1');
    await user.click(screen.getByRole('button', { name: /Revoir le guide/ }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('opens the creation page when the user starts the guide', async () => {
    renderWithProviders(<><OnboardingRunner /><LocationProbe /></>, { initialRoute: '/events' });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Créer mon événement' }));
    expect(screen.getByLabelText('Page actuelle')).toHaveTextContent('/events/create');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('does not interrupt users who already have events', () => {
    state.events.data.total = 2;
    renderWithProviders(<OnboardingRunner />, { initialRoute: '/events' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Revoir le guide/ })).toBeInTheDocument();
  });

  it('waits for the event count instead of assuming a new account', () => {
    state.events.isLoading = true;
    renderWithProviders(<OnboardingRunner />, { initialRoute: '/events' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('keeps a deferred guide closed on later page visits in the same session', () => {
    sessionStorage.setItem('pp_onboarding_v1_standard-user_first_event_deferred', '1');
    renderWithProviders(<OnboardingRunner />, { initialRoute: '/events/create' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
