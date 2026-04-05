const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Extrait YYYY-MM-DD depuis une date API (ISO ou déjà courte). */
export function toDateOnly(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  const slice = raw.includes('T') ? raw.slice(0, 10) : raw;
  return DATE_ONLY.test(slice) ? slice : null;
}

/** Vrai si l'échéance est strictement après le jour de l'événement (comparaison calendrier). */
export function isDueDateAfterEventDate(due: string, eventDate: string): boolean {
  const dueNorm = toDateOnly(due);
  const eventNorm = toDateOnly(eventDate);
  if (!dueNorm || !eventNorm) return false;
  return dueNorm > eventNorm;
}
