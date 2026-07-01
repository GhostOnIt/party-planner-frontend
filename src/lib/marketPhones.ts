export type MarketCountry = 'COG' | 'COD' | 'CMR' | 'GAB' | 'SEN' | 'CIV';

type PhoneMarket = {
  iso2: string;
  name: string;
  currency: string;
  callingCode: string;
  nationalRegex: RegExp;
  hint: string;
  example: string;
};

export const PHONE_MARKETS: Record<MarketCountry, PhoneMarket> = {
  COG: {
    iso2: 'CG',
    name: 'Congo-Brazzaville',
    currency: 'XAF',
    callingCode: '242',
    nationalRegex: /^0[456]\d{7}$/,
    hint: '+242 ou 00242, puis 06, 05 ou 04 et 7 chiffres (ex. +242061234567).',
    example: '+242061234567',
  },
  COD: {
    iso2: 'CD',
    name: 'RDC',
    currency: 'CDF',
    callingCode: '243',
    nationalRegex: /^0?[89]\d{8}$/,
    hint: '+243 ou 00243, puis un numéro mobile national valide.',
    example: '+243891234567',
  },
  CMR: {
    iso2: 'CM',
    name: 'Cameroun',
    currency: 'XAF',
    callingCode: '237',
    nationalRegex: /^6\d{8}$/,
    hint: '+237 ou 00237, puis 9 chiffres commençant par 6.',
    example: '+237671234567',
  },
  GAB: {
    iso2: 'GA',
    name: 'Gabon',
    currency: 'XAF',
    callingCode: '241',
    nationalRegex: /^0?[67]\d{7}$/,
    hint: '+241 ou 00241, puis un numéro mobile national valide.',
    example: '+24106123456',
  },
  SEN: {
    iso2: 'SN',
    name: 'Sénégal',
    currency: 'XOF',
    callingCode: '221',
    nationalRegex: /^7[015678]\d{7}$/,
    hint: '+221 ou 00221, puis 9 chiffres commençant par 70, 71, 75, 76, 77 ou 78.',
    example: '+221710485421',
  },
  CIV: {
    iso2: 'CI',
    name: "Côte d'Ivoire",
    currency: 'XOF',
    callingCode: '225',
    nationalRegex: /^0[157]\d{8}$/,
    hint: '+225 ou 00225, puis 10 chiffres commençant par 01, 05 ou 07.',
    example: '+2250734567890',
  },
};

export function normalizeMarketCountry(raw?: string): MarketCountry {
  const value = String(raw || '').toUpperCase();
  if (value === 'CG') return 'COG';
  if (value === 'CD') return 'COD';
  if (value === 'CM') return 'CMR';
  if (value === 'GA') return 'GAB';
  if (value === 'SN') return 'SEN';
  if (value === 'CI') return 'CIV';
  return value in PHONE_MARKETS ? (value as MarketCountry) : 'COG';
}

export function normalizePhoneToInternational(raw: string, country: MarketCountry): string | null {
  const market = PHONE_MARKETS[country];
  let digits = raw.replace(/\D+/g, '');
  if (!digits) return null;

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.startsWith(market.callingCode)) {
    const national = digits.slice(market.callingCode.length);
    return market.nationalRegex.test(national) ? `+${digits}` : null;
  }

  return market.nationalRegex.test(digits) ? `+${market.callingCode}${digits}` : null;
}

export function isValidPhoneForMarket(raw: string, country: MarketCountry): boolean {
  return normalizePhoneToInternational(raw, country) !== null;
}
