/**
 * Numéros mobile Congo-Brazzaville (+242) :
 * indicatif +242 ou 00242, puis 06 / 05 / 04 et 7 chiffres (ex. +242061234567).
 */

const SEPARATORS = /[\s\-().]/g;

/** Texte d'aide court pour les labels / placeholders */
export const CG_PHONE_FORMAT_HINT =
  '+242 ou 00242, puis 06, 05 ou 04 et 7 chiffres (ex. +242061234567).';

/** Message d'erreur Zod / formulaire */
export const CG_PHONE_ERROR_MESSAGE =
  'Format invalide : +242 ou 00242, puis 06, 05 ou 04 suivi de 7 chiffres.';

export function stripCgPhoneSeparators(value: string): string {
  return value.replace(SEPARATORS, '').trim();
}

/**
 * Canonique : +242 suivi de 06|05|04 et 7 chiffres.
 * Accepte aussi la saisie nationale seule 0[456]XXXXXXX.
 */
export function normalizeCgPhoneToInternational(raw: string): string | null {
  let v = stripCgPhoneSeparators(raw);
  if (!v) return null;

  if (v.startsWith('00242')) {
    v = `+242${v.slice(5)}`;
  }

  if (/^\+242(06|05|04)\d{7}$/.test(v)) {
    return v;
  }

  if (/^0[456]\d{7}$/.test(v)) {
    return `+242${v}`;
  }

  return null;
}

export function isValidCgPhone(raw: string): boolean {
  return normalizeCgPhoneToInternational(raw) !== null;
}

/** Partie nationale pour les APIs (ex. 061234567) */
export function cgPhoneToNationalDigits(raw: string): string | null {
  const intl = normalizeCgPhoneToInternational(raw);
  if (!intl) return null;
  return intl.slice(4);
}
