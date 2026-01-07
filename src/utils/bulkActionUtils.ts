import type { Guest, RsvpStatus } from '@/types';

export type BulkActionType =
  | 'send_invitations'
  | 'send_reminders'
  | 'check_in'
  | 'undo_check_in'
  | 'update_rsvp'
  | 'delete';

export interface EligibilityResult {
  eligible: Guest[];
  ineligible: Guest[];
  reasons: Record<number, string>;
}

/**
 * Helper function to get RSVP status label in French
 */
function getRsvpStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'En attente',
    accepted: 'Accepté',
    declined: 'Décliné',
    maybe: 'Peut-être',
  };
  return labels[status] || status;
}

/**
 * Determine eligibility for bulk actions based on business rules
 */
export function getEligibilityForAction(
  guests: Guest[],
  action: BulkActionType,
  newRsvpStatus?: RsvpStatus
): EligibilityResult {
  const eligible: Guest[] = [];
  const ineligible: Guest[] = [];
  const reasons: Record<number, string> = {};

  guests.forEach((guest) => {
    let canPerform = true;
    let reason = '';

    switch (action) {
      case 'send_invitations':
        if (!guest.email) {
          canPerform = false;
          reason = "Pas d'adresse email";
        } else if (guest.invitation_sent_at && guest.rsvp_status === 'accepted') {
          // Don't send reminder if already accepted
          canPerform = false;
          reason = 'Déjà accepté (pas besoin de rappel)';
        }
        // All guests with email are eligible (will send invitation or reminder automatically)
        break;

      case 'send_reminders':
        if (!guest.email) {
          canPerform = false;
          reason = "Pas d'adresse email";
        } else if (!guest.invitation_sent_at) {
          canPerform = false;
          reason = "Invitation non envoyée (envoyez d'abord une invitation)";
        } else if (guest.rsvp_status === 'accepted') {
          canPerform = false;
          reason = 'Déjà accepté (pas besoin de rappel)';
        }
        break;

      case 'check_in':
        if (guest.checked_in_at) {
          canPerform = false;
          reason = 'Déjà enregistré';
        } else if (!['pending', 'accepted', 'maybe'].includes(guest.rsvp_status)) {
          canPerform = false;
          reason = `Statut: ${getRsvpStatusLabel(guest.rsvp_status)} (doit être en attente, accepté ou peut-être)`;
        }
        break;

      case 'undo_check_in':
        if (!guest.checked_in_at) {
          canPerform = false;
          reason = 'Pas encore enregistré';
        }
        break;

      case 'update_rsvp':
        // All guests can have their RSVP status updated
        // But check if they already have the target status
        if (newRsvpStatus && guest.rsvp_status === newRsvpStatus) {
          canPerform = false;
          reason = `Déjà en statut: ${getRsvpStatusLabel(newRsvpStatus)}`;
        } else {
          canPerform = true;
        }
        break;

      case 'delete':
        // All guests can be deleted
        canPerform = true;
        break;
    }

    if (canPerform) {
      eligible.push(guest);
    } else {
      ineligible.push(guest);
      reasons[guest.id] = reason;
    }
  });

  return { eligible, ineligible, reasons };
}

/**
 * Get status breakdown for selected guests
 */
export function getStatusBreakdown(guests: Guest[]): Record<string, number> {
  return guests.reduce(
    (acc, guest) => {
      const status = guest.rsvp_status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}


