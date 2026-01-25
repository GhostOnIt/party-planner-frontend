import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Event } from '@/types';
import { resolveUrl } from '@/lib/utils';

export interface DisplayEvent {
  id: string;
  name: string;
  type: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  date: string;
  time: string;
  location: string;
  image?: string;
  guests: {
    total: number;
    confirmed: number;
    declined: number;
    pending: number;
  };
  tasks: {
    total: number;
    completed: number;
  };
  budget: {
    total: number;
    spent: number;
  };
  creator: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  isCollaborator?: boolean;
}

export interface EventStats {
  total: number;
  upcoming: number;
  ongoing: number;
  totalGuests: number;
}

/**
 * Format budget amount in FCFA
 * @param amount Amount in FCFA
 * @returns Formatted string (e.g., "15.0M FCFA" or "150,000 FCFA")
 */
export function formatBudget(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M FCFA`;
  }
  return `${amount.toLocaleString()} FCFA`;
}

/**
 * Calculate progress percentage
 * @param current Current value
 * @param total Total value
 * @returns Percentage rounded to nearest integer
 */
export function getProgressPercent(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

/**
 * Transform API Event to DisplayEvent format
 * @param event API Event object
 * @param currentUserId Current user ID for collaborator check
 * @returns DisplayEvent object
 */
export function transformEventToDisplayFormat(
  event: Event,
  currentUserId?: number
): DisplayEvent {
  const imageUrl =
    event.featured_photo?.thumbnail_url || event.featured_photo?.url;
  const formattedDate = format(parseISO(event.date), 'dd MMMM yyyy', {
    locale: fr,
  });
  const formattedCreatedAt = format(parseISO(event.created_at), 'dd/MM/yyyy', {
    locale: fr,
  });

  // Parse budget_spent (can be string or number from Laravel)
  const budgetSpent =
    typeof event.budget_spent === 'string'
      ? parseFloat(event.budget_spent) || 0
      : event.budget_spent || 0;

  return {
    id: event.id.toString(),
    name: event.title,
    type: event.type,
    status: event.status,
    date: formattedDate,
    time: event.time || '',
    location: event.location || '',
    image: imageUrl ? resolveUrl(imageUrl) : undefined,
    guests: {
      total: event.guests_count || 0,
      confirmed: event.guests_confirmed_count || 0,
      declined: event.guests_declined_count || 0,
      pending: event.guests_pending_count || 0,
    },
    tasks: {
      total: event.tasks_count || 0,
      completed: event.tasks_completed_count || 0,
    },
    budget: {
      total: event.budget || 0,
      spent: budgetSpent,
    },
    creator: {
      name: event.user?.name || 'Inconnu',
      avatar: event.user?.avatar_url || undefined,
    },
    createdAt: formattedCreatedAt,
    isCollaborator: currentUserId ? event.user_id !== currentUserId : false,
  };
}

/**
 * Calculate event statistics from events array
 * @param events Array of Event objects
 * @returns EventStats object
 */
export function calculateEventStats(events: Event[]): EventStats {
  return {
    total: events.length,
    upcoming: events.filter((e) => e.status === 'upcoming').length,
    ongoing: events.filter((e) => e.status === 'ongoing').length,
    totalGuests: events.reduce(
      (acc, e) => acc + (e.guests_count || 0),
      0
    ),
  };
}

