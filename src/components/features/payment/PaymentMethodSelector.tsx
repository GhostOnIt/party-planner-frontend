import { cn } from '@/lib/utils';
import { isAirtelMoneyUiEnabled } from '@/lib/paymentFeatureFlags';
import type { PaymentMethod } from '@/types';
import momoMtnLogo from '@/assets/momo_mtn_logo.png';
import airtelMoneyLogo from '@/assets/airtel_money_logo.png';

interface PaymentMethodSelectorProps {
  value: string | null;
  onChange: (method: PaymentSelectorMethod) => void;
  disabled?: boolean;
  /** Surcharge pour les tests ; par défaut suit VITE_ENABLE_AIRTEL_MONEY */
  airtelAvailable?: boolean;
  methods?: PaymentSelectorMethod[];
}

export type PaymentSelectorMethod = {
  id: PaymentMethod;
  name: string;
  prefixes: string;
  color: string;
  logo?: string;
  provider?: string;
};

export const getPaymentMethodKey = (method: PaymentSelectorMethod) => method.provider ?? method.id;

type ProviderMark = {
  label: string;
  sublabel?: string;
  className: string;
  labelClassName?: string;
};

const paymentMethods: PaymentSelectorMethod[] = [
  {
    id: 'mtn_mobile_money',
    name: 'MTN Mobile Money',
    prefixes: '06',
    color: 'border-yellow-400 hover:bg-yellow-50',
    logo: momoMtnLogo,
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money',
    prefixes: '04, 05',
    color: 'border-red-400 hover:bg-red-50',
    logo: airtelMoneyLogo,
  },
];

const defaultLogos: Partial<Record<PaymentMethod, string>> = {
  mtn_mobile_money: momoMtnLogo,
  airtel_money: airtelMoneyLogo,
};

const getProviderLogo = (method: PaymentSelectorMethod) => {
  const provider = method.provider ?? '';

  if (provider.includes('MTN')) {
    return momoMtnLogo;
  }

  if (provider.includes('AIRTEL')) {
    return airtelMoneyLogo;
  }

  return method.logo ?? defaultLogos[method.id];
};

const getProviderMark = (method: PaymentSelectorMethod): ProviderMark => {
  const provider = method.provider ?? '';

  if (provider.includes('ORANGE')) {
    return {
      label: 'Orange',
      sublabel: 'Money',
      className: 'bg-black text-orange-400',
      labelClassName: 'text-[10px]',
    };
  }

  if (provider.includes('FREE')) {
    return {
      label: 'Free',
      sublabel: 'Money',
      className: 'border border-red-200 bg-white text-red-600',
    };
  }

  if (provider.includes('VODACOM')) {
    return {
      label: 'voda',
      sublabel: 'com',
      className: 'bg-red-600 text-white',
    };
  }

  if (provider.includes('WAVE')) {
    return {
      label: 'Wave',
      className: 'bg-sky-500 text-white',
    };
  }

  return {
    label: method.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
    className: 'bg-primary/10 text-primary',
  };
};

function PaymentProviderMark({ mark }: { mark: ProviderMark }) {
  return (
    <span
      className={cn(
        'flex h-12 w-12 flex-col items-center justify-center rounded-lg text-center font-bold leading-none',
        mark.className
      )}
    >
      <span className={cn('text-[11px]', mark.labelClassName)}>{mark.label}</span>
      {mark.sublabel && <span className="mt-0.5 text-[8px] uppercase">{mark.sublabel}</span>}
    </span>
  );
}

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
  airtelAvailable = isAirtelMoneyUiEnabled,
  methods = paymentMethods,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {methods.map((method) => {
        const isUnavailable = method.id === 'airtel_money' && !airtelAvailable;
        const methodKey = getPaymentMethodKey(method);
        const isSelected = value === methodKey && !isUnavailable;
        const logo = getProviderLogo(method);
        const mark = getProviderMark(method);

        return (
          <button
            key={methodKey}
            type="button"
            onClick={() => !isUnavailable && onChange(method)}
            disabled={disabled || isUnavailable}
            aria-disabled={isUnavailable}
            className={cn(
              'flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all',
              disabled && 'cursor-not-allowed opacity-50',
              isUnavailable && 'cursor-not-allowed border-muted bg-muted/30 opacity-60 grayscale',
              isSelected ? 'border-primary ring-2 ring-primary/20' : !isUnavailable && method.color
            )}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden">
              {logo ? (
                <img
                  src={logo}
                  alt={method.name}
                  className="h-full w-full rounded-lg object-contain"
                />
              ) : (
                <PaymentProviderMark mark={mark} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{method.name}</p>
              <p className="text-sm text-muted-foreground">Préfixes : {method.prefixes}</p>
              {isUnavailable && (
                <p className="mt-1 text-xs font-medium text-muted-foreground">Bientôt disponible</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
