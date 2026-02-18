import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types';
import momoMtnLogo from '@/assets/momo_mtn_logo.png';
import airtelMoneyLogo from '@/assets/airtel_money_logo.png';

interface PaymentMethodSelectorProps {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

const paymentMethods: {
  id: PaymentMethod;
  name: string;
  prefixes: string;
  color: string;
  logo: string;
}[] = [
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

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {paymentMethods.map((method) => (
        <button
          key={method.id}
          type="button"
          onClick={() => onChange(method.id)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-4 rounded-lg border-2 p-4 transition-all',
            disabled && 'cursor-not-allowed opacity-50',
            value === method.id
              ? 'border-primary ring-2 ring-primary/20'
              : method.color
          )}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden">
            <img src={method.logo} alt={method.name} className="h-full w-full rounded-lg object-contain" />
          </div>
          <div className="text-left">
            <p className="font-medium">{method.name}</p>
            <p className="text-sm text-muted-foreground">
              Prefixes: {method.prefixes}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
