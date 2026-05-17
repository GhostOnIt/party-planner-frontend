import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import { screen } from '@testing-library/react';

// Mock the spots hook — that's what AuthPromoPanel pivots on.
const mockUseLoginSpots = vi.fn();
vi.mock('@/hooks/useCommunication', () => ({
  useLoginSpots: () => mockUseLoginSpots(),
}));

// framer-motion in jsdom is heavy and not relevant to coverage of this component.
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: () => (props: any) => {
        const { children, ...rest } = props ?? {};
        return <div {...rest}>{children}</div>;
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/assets/logo.png', () => ({ default: '/logo.png' }));

import { AuthPromoPanel } from './AuthPromoPanel';

beforeEach(() => {
  mockUseLoginSpots.mockReset();
});

describe('AuthPromoPanel', () => {
  it('renders the empty fallback when no spots are returned', () => {
    mockUseLoginSpots.mockReturnValue({ data: [], isLoading: false });

    renderWithProviders(<AuthPromoPanel />);

    expect(screen.getByText(/Bienvenue sur Party Planner/i)).toBeInTheDocument();
  });

  it('renders the loading fallback while spots are loading', () => {
    mockUseLoginSpots.mockReturnValue({ data: undefined, isLoading: true });

    renderWithProviders(<AuthPromoPanel />);

    // Loading state shows the logo + brand name but no welcome heading.
    expect(screen.queryByText(/Bienvenue sur Party Planner/i)).not.toBeInTheDocument();
    expect(screen.getAllByAltText(/Party Planner/i).length).toBeGreaterThan(0);
  });

  it('does not crash when the API returns a non-array (defensive Array.isArray check)', () => {
    // Regression: spots used to be undefined → `.map is not a function`.
    mockUseLoginSpots.mockReturnValue({ data: null, isLoading: false });

    renderWithProviders(<AuthPromoPanel />);

    expect(screen.getByText(/Bienvenue sur Party Planner/i)).toBeInTheDocument();
  });

  it('renders the first ad title and description when spots are returned', () => {
    mockUseLoginSpots.mockReturnValue({
      data: [
        { id: 1, title: 'Lancez votre événement', description: 'En quelques minutes.', image: '/img.jpg' },
      ],
      isLoading: false,
    });

    renderWithProviders(<AuthPromoPanel />);

    expect(screen.getByText('Lancez votre événement')).toBeInTheDocument();
    expect(screen.getByText('En quelques minutes.')).toBeInTheDocument();
  });

  it('shows slide indicators when there are multiple ads', () => {
    mockUseLoginSpots.mockReturnValue({
      data: [
        { id: 1, title: 'A', description: 'd1', image: '/a.jpg' },
        { id: 2, title: 'B', description: 'd2', image: '/b.jpg' },
      ],
      isLoading: false,
    });

    const { container } = renderWithProviders(<AuthPromoPanel />);

    expect(container.querySelectorAll('button').length).toBe(2);
  });
});
