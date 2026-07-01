import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Phone, CreditCard, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PaymentMethodSelector,
  getPaymentMethodKey,
  type PaymentSelectorMethod,
} from './PaymentMethodSelector';
import { getProviderFromPhone } from '@/hooks/usePayment';
import { isAirtelMoneyUiEnabled } from '@/lib/paymentFeatureFlags';
import { paymentTrace } from '@/lib/paymentTrace';
import {
  PHONE_MARKETS,
  isValidPhoneForMarket,
  normalizeMarketCountry,
  normalizePhoneToInternational,
  type MarketCountry,
} from '@/lib/marketPhones';
import type { PaymentMethod, PlanType } from '@/types';

// Plan duration in months
const planDurations: Record<PlanType, { months: number; label: string }> = {
  starter: { months: 4, label: '4 mois' },
  pro: { months: 8, label: '8 mois' },
};

// Check if we're in sandbox mode (via VITE_PAYMENT_ENV variable)
const isSandbox = import.meta.env.VITE_PAYMENT_ENV === 'sandbox';
const defaultCountry = normalizeMarketCountry(import.meta.env.VITE_MARKET_COUNTRY);
const paymentTestAmount = Number(import.meta.env.VITE_PAYMENT_TEST_AMOUNT || '');
const hasPaymentTestAmount = Number.isFinite(paymentTestAmount) && paymentTestAmount > 0;

const marketCountries: MarketCountry[] = ['COG', 'COD', 'CMR', 'GAB', 'SEN', 'CIV'];
const initialCountry: MarketCountry = marketCountries.includes(defaultCountry)
  ? defaultCountry
  : 'COG';

function getMarketPaymentMethods(country: MarketCountry): PaymentSelectorMethod[] | undefined {
  if (country === 'COG') {
    return [
      {
        id: 'mtn_mobile_money',
        name: 'MTN Mobile Money Congo',
        prefixes: '06',
        color: 'border-yellow-400 hover:bg-yellow-50',
        provider: 'MTN_MOMO_COG',
      },
      {
        id: 'airtel_money',
        name: 'Airtel Money Congo',
        prefixes: '04, 05',
        color: 'border-red-400 hover:bg-red-50',
        provider: 'AIRTEL_COG',
      },
    ];
  }

  if (country === 'COD') {
    return [
      {
        id: 'pawapay',
        name: 'Airtel Money RDC',
        prefixes: '97',
        color: 'border-red-400 hover:bg-red-50',
        provider: 'AIRTEL_COD',
      },
      {
        id: 'pawapay',
        name: 'Orange Money RDC',
        prefixes: '89',
        color: 'border-orange-400 hover:bg-orange-50',
        provider: 'ORANGE_COD',
      },
      {
        id: 'pawapay',
        name: 'Vodacom M-Pesa RDC',
        prefixes: '81',
        color: 'border-red-500 hover:bg-red-50',
        provider: 'VODACOM_MPESA_COD',
      },
    ];
  }

  if (country === 'CMR') {
    return [
      {
        id: 'pawapay',
        name: 'MTN Mobile Money Cameroun',
        prefixes: '65',
        color: 'border-yellow-400 hover:bg-yellow-50',
        provider: 'MTN_MOMO_CMR',
      },
    ];
  }

  if (country === 'SEN') {
    return [
      {
        id: 'pawapay',
        name: 'Orange Money Sénégal',
        prefixes: '71, 77, 78',
        color: 'border-orange-400 hover:bg-orange-50',
        provider: 'ORANGE_SEN',
      },
      {
        id: 'pawapay',
        name: 'Free Money Sénégal',
        prefixes: '76',
        color: 'border-red-400 hover:bg-red-50',
        provider: 'FREE_SEN',
      },
    ];
  }

  if (country === 'CIV') {
    return [
      {
        id: 'pawapay',
        name: "Orange Money Côte d'Ivoire",
        prefixes: '07',
        color: 'border-orange-400 hover:bg-orange-50',
        provider: 'ORANGE_CIV',
      },
      {
        id: 'pawapay',
        name: "MTN Mobile Money Côte d'Ivoire",
        prefixes: '05',
        color: 'border-yellow-400 hover:bg-yellow-50',
        provider: 'MTN_MOMO_CIV',
      },
    ];
  }

  if (country === 'GAB') {
    return [
      {
        id: 'pawapay',
        name: 'Airtel Money Gabon',
        prefixes: '06, 07',
        color: 'border-red-400 hover:bg-red-50',
        provider: 'AIRTEL_GAB',
      },
    ];
  }

  return [
    {
      id: 'pawapay',
      name: `Mobile Money ${PHONE_MARKETS[country as MarketCountry]?.name ?? 'local'}`,
      prefixes: 'Selon opérateur mobile local',
      color: 'border-primary hover:bg-primary/5',
    },
  ];
}

function getDefaultPaymentMethodKey(country: MarketCountry): string | null {
  const marketMethods = getMarketPaymentMethods(country);
  return marketMethods?.[0]
    ? getPaymentMethodKey(marketMethods[0])
    : isSandbox || !isAirtelMoneyUiEnabled
      ? 'mtn_mobile_money'
      : null;
}

const isValidPhoneNumber = (phone: string, country: MarketCountry): boolean => {
  const cleaned = phone.replace(/[\s\-\.]/g, '');

  if (isSandbox && /^467\d{8}$/.test(cleaned)) {
    return true;
  }

  if (!isSandbox) {
    return isValidPhoneForMarket(phone, country);
  }

  return false;
};

const buildPaymentSchema = (country: MarketCountry) =>
  z.object({
    phone_number: z
      .string()
      .min(1, 'Numéro de téléphone requis')
      .refine(
        (phone) => isValidPhoneNumber(phone, country),
        isSandbox
          ? 'Format invalide. Utilisez 46733123450 (test).'
          : `Format invalide pour ${PHONE_MARKETS[country].name}.`
      ),
  });

type PaymentFormData = z.infer<ReturnType<typeof buildPaymentSchema>>;

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSubmit: (data: {
    phone_number: string;
    method: PaymentMethod;
    country: MarketCountry;
    currency: string;
    provider?: string;
  }) => void;
  isLoading?: boolean;
  description?: string;
  planType?: PlanType;
  country?: MarketCountry;
  onCountryChange?: (country: MarketCountry) => void;
}

const formatCurrency = (amount: number, currency: string) => {
  if (currency === 'XAF' || currency === 'FCFA') {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }
  if (currency === 'EUR') {
    return `${amount.toLocaleString('fr-FR')} €`;
  }
  return `${amount} ${currency}`;
};

export function PaymentForm({
  amount,
  currency = 'XAF',
  onSubmit,
  isLoading = false,
  description,
  planType,
  country = initialCountry,
  onCountryChange,
}: PaymentFormProps) {
  const safeInitialCountry = marketCountries.includes(country) ? country : initialCountry;
  const [selectedCountry, setSelectedCountry] = useState<MarketCountry>(safeInitialCountry);
  const market = PHONE_MARKETS[selectedCountry];
  const marketPaymentMethods = getMarketPaymentMethods(selectedCountry);
  const displayAmount = hasPaymentTestAmount ? paymentTestAmount : amount;
  const displayCurrency = market.currency || currency;
  const [selectedMethodKey, setSelectedMethodKey] = useState<string | null>(() =>
    getDefaultPaymentMethodKey(safeInitialCountry)
  );
  const [autoDetectedMethod, setAutoDetectedMethod] = useState<PaymentMethod | null>(null);
  const selectedPaymentMethod =
    marketPaymentMethods?.find((method) => getPaymentMethodKey(method) === selectedMethodKey) ??
    null;
  const selectedMethod = selectedPaymentMethod?.id ?? (selectedMethodKey as PaymentMethod | null);

  useEffect(() => {
    if (!isAirtelMoneyUiEnabled && selectedMethodKey === 'airtel_money') {
      setSelectedMethodKey('mtn_mobile_money');
    }
  }, [selectedMethodKey]);

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    trigger,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(buildPaymentSchema(selectedCountry)),
    defaultValues: {
      phone_number: isSandbox ? '46733123450' : '',
    },
  });

  const phoneNumber = watch('phone_number');

  useEffect(() => {
    const nextCountry = marketCountries.includes(country) ? country : initialCountry;
    setSelectedCountry((current) => (current === nextCountry ? current : nextCountry));
  }, [country]);

  const handleCountryChange = (value: string) => {
    const nextCountry = normalizeMarketCountry(value);
    setSelectedCountry(nextCountry);
    onCountryChange?.(nextCountry);
  };

  useEffect(() => {
    setSelectedMethodKey(getDefaultPaymentMethodKey(selectedCountry));
    setAutoDetectedMethod(null);
    resetField('phone_number', { defaultValue: isSandbox ? '46733123450' : '' });
  }, [resetField, selectedCountry]);

  useEffect(() => {
    if (phoneNumber) {
      void trigger('phone_number');
    }
  }, [phoneNumber, selectedCountry, trigger]);

  // Auto-detect payment method from phone number (pas d’Airtel tant que non activé)
  useEffect(() => {
    if (marketPaymentMethods) {
      setAutoDetectedMethod(null);
      return;
    }

    if (phoneNumber && phoneNumber.length >= 3) {
      let detected = getProviderFromPhone(phoneNumber);
      if (detected === 'airtel_money' && !isAirtelMoneyUiEnabled) {
        detected = null;
      }
      setAutoDetectedMethod(detected);
      if (detected && !selectedMethodKey) {
        setSelectedMethodKey(detected);
      }
    } else {
      setAutoDetectedMethod(null);
    }
  }, [marketPaymentMethods, phoneNumber, selectedMethodKey]);

  const handleFormSubmit = (data: PaymentFormData) => {
    paymentTrace('PaymentForm: submit (avant validation interne)', {
      amount,
      currency: displayCurrency,
      planType,
      hasMethod: !!selectedMethod,
      country: selectedCountry,
    });
    if (!selectedMethod) {
      paymentTrace('PaymentForm: abandon — aucune méthode sélectionnée');
      return;
    }
    const cleanedSandbox = data.phone_number.replace(/[\s\-\.]/g, '');
    const phone_number = isSandbox
      ? cleanedSandbox
      : (normalizePhoneToInternational(data.phone_number, selectedCountry) ?? data.phone_number);
    const provider = selectedPaymentMethod?.provider;
    paymentTrace('PaymentForm: appel onSubmit parent', {
      method: selectedMethod,
      phoneLen: phone_number.length,
      isSandbox,
      country: selectedCountry,
      provider,
    });
    onSubmit({
      phone_number,
      method: selectedMethod,
      country: selectedCountry,
      currency: displayCurrency,
      provider,
    });
  };

  // Calculate expiration date based on plan type
  const expirationDate = planType ? addMonths(new Date(), planDurations[planType].months) : null;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Amount Display */}
      <div className="rounded-lg bg-muted p-4 text-center">
        <p className="text-sm text-muted-foreground">Montant a payer</p>
        <p className="text-3xl font-bold">{formatCurrency(displayAmount, displayCurrency)}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        {planType && expirationDate && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span>
              Valide jusqu'au{' '}
              <strong className="text-primary">
                {format(expirationDate, 'dd MMMM yyyy', { locale: fr })}
              </strong>{' '}
              ({planDurations[planType].label})
            </span>
          </div>
        )}
      </div>

      {/* Market Selection */}
      <div className="space-y-2">
        <Label htmlFor="payment_country">Pays</Label>
        <Select value={selectedCountry} onValueChange={handleCountryChange} disabled={isLoading}>
          <SelectTrigger id="payment_country">
            <SelectValue placeholder="Choisir un pays" />
          </SelectTrigger>
          <SelectContent>
            {marketCountries.map((marketCountry) => (
              <SelectItem key={marketCountry} value={marketCountry}>
                {PHONE_MARKETS[marketCountry].name} ({PHONE_MARKETS[marketCountry].currency})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-2">
        <Label>Methode de paiement</Label>
        <PaymentMethodSelector
          value={selectedMethodKey}
          onChange={(method) => setSelectedMethodKey(getPaymentMethodKey(method))}
          disabled={isLoading}
          methods={marketPaymentMethods}
        />
        {autoDetectedMethod && autoDetectedMethod !== selectedMethod && (
          <p className="text-sm text-muted-foreground">
            Basé sur votre numéro, nous suggérons:{' '}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => setSelectedMethodKey(autoDetectedMethod)}
            >
              {autoDetectedMethod === 'mtn_mobile_money' ? 'MTN Mobile Money' : 'Airtel Money'}
            </button>
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phone_number">Numero de telephone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="phone_number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={isSandbox ? '46733123450' : market.example}
            className="pl-10"
            {...register('phone_number')}
            disabled={isLoading}
          />
        </div>
        {errors.phone_number && (
          <p className="text-sm text-destructive">{errors.phone_number.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {isSandbox ? 'Mode test — numéro MTN sandbox prérempli.' : market.hint}
        </p>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" size="lg" disabled={isLoading || !selectedMethod}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Payer {formatCurrency(displayAmount, displayCurrency)}
          </>
        )}
      </Button>

      {/* Instructions */}
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium">Instructions:</p>
        <ol className="mt-2 list-inside list-decimal space-y-1">
          <li>Cliquez sur "Payer" pour initier la transaction</li>
          <li>Vous recevrez une demande de paiement sur votre telephone</li>
          <li>Entrez votre code PIN pour confirmer</li>
          <li>Attendez la confirmation du paiement</li>
        </ol>
      </div>

      {/* Sandbox Test Numbers */}
      {isSandbox && (
        <div className="rounded-lg bg-yellow-100 border border-yellow-300 p-4 text-sm text-yellow-800">
          <p className="font-medium">🧪 Mode Test - Numeros sandbox MTN:</p>
          <ul className="mt-2 space-y-1 font-mono text-xs">
            <li>
              <strong>46733123450</strong> - Paiement reussi (auto-approve)
            </li>
            <li>
              <strong>46733123451</strong> - Paiement echoue
            </li>
            <li>
              <strong>46733123452</strong> - Timeout
            </li>
          </ul>
        </div>
      )}
    </form>
  );
}
