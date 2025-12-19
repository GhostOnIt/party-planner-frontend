import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types';

interface PaymentMethodSelectorProps {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

const paymentMethods: { id: PaymentMethod; name: string; prefixes: string; color: string }[] = [
  {
    id: 'mtn_mobile_money',
    name: 'MTN Mobile Money',
    prefixes: '06',
    color: 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100',
  },
  {
    id: 'airtel_money',
    name: 'Airtel Money',
    prefixes: '04, 05',
    color: 'border-red-400 bg-red-50 hover:bg-red-100',
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
              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
              : method.color
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm">
            {method.id === 'mtn_mobile_money' ? (
              <span className="text-2xl font-bold text-yellow-500">MTN</span>
            ) : (
              <span className="text-2xl font-bold text-red-500">A</span>
            )}
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
