import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Plan } from '@/hooks/useAdminPlans';
import { formatLimitValue, PLAN_LIMIT_LABELS } from '@/hooks/useAdminPlans';
import {
  COMPARABLE_FEATURE_KEYS,
  COMPARABLE_LIMIT_KEYS,
  getFeatureLabel,
} from '@/lib/planFeatures';

interface PlansComparisonTableProps {
  plans: Plan[];
}

export function PlansComparisonTable({ plans }: PlansComparisonTableProps) {
  if (plans.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th
              scope="col"
              className="sticky left-0 z-10 bg-slate-50 px-4 py-4 text-left font-semibold text-slate-900 min-w-[200px]"
            >
              Fonctionnalité
            </th>
            {plans.map((plan) => (
              <th
                key={plan.id}
                scope="col"
                className={cn(
                  'px-4 py-4 text-center font-semibold text-slate-900 min-w-[120px]',
                  plan.is_popular && 'bg-[#4F46E5]/5'
                )}
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-100">
            <td
              colSpan={plans.length + 1}
              className="sticky left-0 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50/80"
            >
              Limites
            </td>
          </tr>
          {COMPARABLE_LIMIT_KEYS.map((limitKey) => (
            <tr key={limitKey} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="sticky left-0 z-10 bg-white px-4 py-3 font-medium text-slate-700">
                {PLAN_LIMIT_LABELS[limitKey]}
              </td>
              {plans.map((plan) => (
                <td
                  key={plan.id}
                  className={cn(
                    'px-4 py-3 text-center text-slate-900',
                    plan.is_popular && 'bg-[#4F46E5]/[0.03]'
                  )}
                >
                  {formatLimitValue(plan.limits?.[limitKey])}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-b border-slate-100">
            <td
              colSpan={plans.length + 1}
              className="sticky left-0 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50/80"
            >
              Fonctionnalités
            </td>
          </tr>
          {COMPARABLE_FEATURE_KEYS.map((featureKey) => (
            <tr key={featureKey} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
              <td className="sticky left-0 z-10 bg-white px-4 py-3 text-slate-700">
                {getFeatureLabel(featureKey, plans[0])}
              </td>
              {plans.map((plan) => {
                const enabled = plan.features?.[featureKey] === true;
                return (
                  <td
                    key={plan.id}
                    className={cn(
                      'px-4 py-3 text-center',
                      plan.is_popular && 'bg-[#4F46E5]/[0.03]'
                    )}
                  >
                    {enabled ? (
                      <Check className="w-5 h-5 text-[#4F46E5] mx-auto" aria-label="Inclus" />
                    ) : (
                      <Minus className="w-5 h-5 text-slate-300 mx-auto" aria-label="Non inclus" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
