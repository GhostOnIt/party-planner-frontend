/**
 * Active le choix Airtel Money dans l’UI des paiements.
 * Par défaut : désactivé (MTN seul) — mettre à true quand l’intégration Airtel est prête.
 */
export const isAirtelMoneyUiEnabled =
  import.meta.env.VITE_ENABLE_AIRTEL_MONEY === 'true';
