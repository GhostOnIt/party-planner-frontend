import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';

const state = vi.hoisted(() => ({
  data: { has_subscription: false, subscription: null, quota: { used: 0, total_quota: 0, remaining: 0, is_unlimited: false, percentage_used: 0 } },
}));
vi.mock('@/hooks/useSubscription', () => ({ useCurrentSubscription: () => ({ data: state.data, isLoading: false, error: null }) }));
import { SubscriptionCard } from './subscription-card';

describe('First-time account subscription', () => {
  it('does not announce an active plan for a user without a subscription', () => {
    renderWithProviders(<SubscriptionCard />);
    expect(screen.getByText('Aucun abonnement actif')).toBeInTheDocument();
    expect(screen.queryByText('Plan actif')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Préparer mon premier événement' })).toBeInTheDocument();
  });
});
