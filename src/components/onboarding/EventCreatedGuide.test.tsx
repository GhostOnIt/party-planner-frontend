import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventCreatedGuide } from './EventCreatedGuide';

describe('Next step after event creation', () => {
  it('brings the next action into view after navigation from a long form', () => {
    const scrollIntoView = vi.fn();
    const original = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    try {
      render(<EventCreatedGuide canAddGuests onGuests={vi.fn()} onDismiss={vi.fn()} />);
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
    } finally {
      HTMLElement.prototype.scrollIntoView = original;
    }
  });

  it('explains that invitations have not been sent and opens guests on request', async () => {
    const onGuests = vi.fn();
    render(<EventCreatedGuide canAddGuests onGuests={onGuests} onDismiss={vi.fn()} />);
    expect(screen.getByText(/Aucune invitation n’a été envoyée/)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Ajouter mes invités' }));
    expect(onGuests).toHaveBeenCalledOnce();
  });

  it('lets the user dismiss the guide without adding guests', async () => {
    const onDismiss = vi.fn();
    render(<EventCreatedGuide canAddGuests={false} onGuests={vi.fn()} onDismiss={onDismiss} />);
    expect(screen.queryByRole('button', { name: 'Ajouter mes invités' })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Explorer mon événement' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
