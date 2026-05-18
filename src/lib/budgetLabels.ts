/**
 * Libellés budget harmonisés dans toute l'application.
 *
 * Hiérarchie :
 * - Budget estimé : somme des coûts estimés des postes (estimated_cost)
 * - Dépenses réelles : somme des coûts réels saisis (actual_cost)
 * - Déjà payé : part des dépenses réelles marquées comme payées
 * - Reste à payer : dépenses réelles − déjà payé
 */
export const BUDGET_LABELS = {
  estimatedTotal: 'Budget estimé',
  estimatedTotalShort: 'Total estimé (postes)',
  actualTotal: 'Dépenses réelles',
  paid: 'Déjà payé',
  remainingToPay: 'Reste à payer',
  overviewTitle: 'Suivi des dépenses',
  paidOfEstimated: (percent: number) => `${percent}% du budget estimé payé`,
  paidOfActual: (percent: number) => `${percent}% des dépenses réglées`,
} as const;
