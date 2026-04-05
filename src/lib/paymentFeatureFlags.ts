/**
 * Active le choix Airtel Money dans l’UI des paiements.
 *
 * - `true` / `1` / `yes` (insensible à la casse, espaces ignorés) → Airtel **proposé**.
 * - absent, `false`, `0` ou autre → Airtel **grisé** (MTN seul).
 *
 * Important : avec Vite, la valeur est figée au **build** (`npm run build`), pas au runtime du serveur.
 */
function parseEnvFlag(value: unknown): boolean {
  const s = String(value ?? '')
    .trim()
    .toLowerCase();
  return s === 'true' || s === '1' || s === 'yes';
}

export const isAirtelMoneyUiEnabled = parseEnvFlag(import.meta.env.VITE_ENABLE_AIRTEL_MONEY);
