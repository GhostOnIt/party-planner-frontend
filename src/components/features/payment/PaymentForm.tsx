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
import { PaymentMethodSelector, type PaymentSelectorMethod } from './PaymentMethodSelector';
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
        isSandbox ? 'Format invalide. Utilisez 46733123450 (test).' : `Format invalide pour ${PHONE_MARKETS[country].name}.`
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
  country = defaultCountry,
}: PaymentFormProps) {
  const market = PHONE_MARKETS[country];
  const marketPaymentMethods: PaymentSelectorMethod[] | undefined =
    country === 'SEN'
      ? [
          {
            id: 'pawapay',
            name: 'Orange Money Sénégal',
            prefixes: '77, 78',
            color: 'border-orange-400 hover:bg-orange-50',
          },
        ]
      : country === 'CIV'
        ? [
            {
              id: 'pawapay',
              name: "Orange Money Côte d'Ivoire",
              prefixes: '07',
              color: 'border-orange-400 hover:bg-orange-50',
            },
          ]
        : undefined;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(() =>
    marketPaymentMethods?.[0]?.id ?? (isSandbox || !isAirtelMoneyUiEnabled ? 'mtn_mobile_money' : null)
  );
  const [autoDetectedMethod, setAutoDetectedMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (!isAirtelMoneyUiEnabled && selectedMethod === 'airtel_money') {
      setSelectedMethod('mtn_mobile_money');
    }
  }, [selectedMethod]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(buildPaymentSchema(country)),
    defaultValues: {
      phone_number: isSandbox ? '46733123450' : '',
    },
  });

  const phoneNumber = watch('phone_number');

  // Auto-detect payment method from phone number (pas d’Airtel tant que non activé)
  useEffect(() => {
    if (phoneNumber && phoneNumber.length >= 3) {
      let detected = getProviderFromPhone(phoneNumber);
      if (detected === 'airtel_money' && !isAirtelMoneyUiEnabled) {
        detected = null;
      }
      setAutoDetectedMethod(detected);
      if (detected && !selectedMethod) {
        setSelectedMethod(detected);
      }
    } else {
      setAutoDetectedMethod(null);
    }
  }, [phoneNumber, selectedMethod]);

  const handleFormSubmit = (data: PaymentFormData) => {
    paymentTrace('PaymentForm: submit (avant validation interne)', {
      amount,
      currency,
      planType,
      hasMethod: !!selectedMethod,
    });
    if (!selectedMethod) {
      paymentTrace('PaymentForm: abandon — aucune méthode sélectionnée');
      return;
    }
    const cleanedSandbox = data.phone_number.replace(/[\s\-\.]/g, '');
    const phone_number = isSandbox
      ? cleanedSandbox
      : normalizePhoneToInternational(data.phone_number, country) ?? data.phone_number;
    const provider = selectedMethod === 'pawapay' && country === 'SEN'
      ? 'ORANGE_SEN'
      : selectedMethod === 'pawapay' && country === 'CIV'
        ? 'ORANGE_CIV'
        : selectedMethod === 'mtn_mobile_money'
      ? `MTN_MOMO_${country}`
      : selectedMethod === 'airtel_money'
        ? `AIRTEL_${country}`
        : undefined;
    paymentTrace('PaymentForm: appel onSubmit parent', {
      method: selectedMethod,
      phoneLen: phone_number.length,
      isSandbox,
      country,
      provider,
    });
    onSubmit({
      phone_number,
      method: selectedMethod,
      country,
      currency,
      provider,
    });
  };

  // Calculate expiration date based on plan type
  const expirationDate = planType
    ? addMonths(new Date(), planDurations[planType].months)
    : null;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Amount Display */}
      <div className="rounded-lg bg-muted p-4 text-center">
        <p className="text-sm text-muted-foreground">Montant a payer</p>
        <p className="text-3xl font-bold">
          {formatCurrency(amount, currency)}
        </p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        {planType && expirationDate && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm">
            <Calendar className="h-4 w-4 text-primary" />
            <span>
              Valide jusqu'au{' '}
              <strong className="text-primary">
                {format(expirationDate, 'dd MMMM yyyy', { locale: fr })}
              </strong>
              {' '}({planDurations[planType].label})
            </span>
          </div>
        )}
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-2">
        <Label>Methode de paiement</Label>
        <PaymentMethodSelector
          value={selectedMethod}
          onChange={setSelectedMethod}
          disabled={isLoading}
          methods={marketPaymentMethods}
        />
        {autoDetectedMethod && autoDetectedMethod !== selectedMethod && (
          <p className="text-sm text-muted-foreground">
            Basé sur votre numéro, nous suggérons:{' '}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => setSelectedMethod(autoDetectedMethod)}
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
          {isSandbox
            ? 'Mode test — numéro MTN sandbox prérempli.'
            : market.hint}
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading || !selectedMethod}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Payer {formatCurrency(amount, currency)}
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
            <li><strong>46733123450</strong> - Paiement reussi (auto-approve)</li>
            <li><strong>46733123451</strong> - Paiement echoue</li>
            <li><strong>46733123452</strong> - Timeout</li>
          </ul>
        </div>
      )}
    </form>
  );
}
