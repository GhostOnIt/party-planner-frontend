import type { Plan } from '@/hooks/useAdminPlans';
import { PLAN_FEATURE_LABELS, PLAN_LIMIT_LABELS } from '@/hooks/useAdminPlans';

/** Clés affichables dans les comparaisons (hors métadonnées commerciales). */
export const COMPARABLE_FEATURE_KEYS = Object.keys(PLAN_FEATURE_LABELS).filter(
  (key) => key !== 'sales.contact_required'
);

export const COMPARABLE_LIMIT_KEYS = Object.keys(PLAN_LIMIT_LABELS);

export function getPlanEnabledFeatureKeys(plan: Plan): string[] {
  return COMPARABLE_FEATURE_KEYS.filter((key) => plan.features?.[key] === true);
}

export function getFeatureLabel(featureKey: string, plan: Plan): string {
  const label = PLAN_FEATURE_LABELS[featureKey];
  if (label) return label;

  if (featureKey.includes('guests.max_per_event')) {
    const limit = plan.limits?.['guests.max_per_event'];
    return `Invités par événement`;
  }
  if (featureKey.includes('collaborators.max_per_event')) {
    return `Collaborateurs par événement`;
  }
  if (featureKey.includes('events.creations_per_billing_period')) {
    return `Événements par période`;
  }

  return featureKey;
}
