import { PlanCard } from './PlanCard';
import type { PlanType, Subscription } from '@/types';

interface PlanSelectorProps {
  currentSubscription?: Subscription | null;
  onSelectPlan: (plan: PlanType) => void;
  isLoading?: boolean;
  prices?: Record<PlanType, number>;
  currency?: string;
}

const defaultPrices: Record<PlanType, number> = {
  starter: 5000,
  pro: 15000,
};

export function PlanSelector({
  currentSubscription,
  onSelectPlan,
  isLoading = false,
  prices = defaultPrices,
  currency = 'XAF',
}: PlanSelectorProps) {
  const currentPlan = currentSubscription?.plan;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PlanCard
        plan="starter"
        price={prices.starter}
        currency={currency}
        isCurrentPlan={currentPlan === 'starter'}
        onSelect={() => onSelectPlan('starter')}
        isLoading={isLoading}
        disabled={currentPlan === 'pro'} // Can't downgrade
      />
      <PlanCard
        plan="pro"
        price={prices.pro}
        currency={currency}
        isCurrentPlan={currentPlan === 'pro'}
        isPopular
        onSelect={() => onSelectPlan('pro')}
        isLoading={isLoading}
      />
    </div>
  );
}
