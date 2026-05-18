import { Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Plan } from '@/hooks/useAdminPlans';
import { getFeatureLabel, getPlanEnabledFeatureKeys } from '@/lib/planFeatures';

interface PlanAllFeaturesDialogProps {
  plan: Plan;
  hiddenCount: number;
}

export function PlanAllFeaturesDialog({ plan, hiddenCount }: PlanAllFeaturesDialogProps) {
  const allFeatures = getPlanEnabledFeatureKeys(plan);

  if (hiddenCount <= 0) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-xs text-[#E91E8C] font-medium hover:underline underline-offset-2 text-left"
        >
          + {hiddenCount} autres fonctionnalités
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fonctionnalités — {plan.name}</DialogTitle>
          <DialogDescription>
            Liste complète des {allFeatures.length} fonctionnalités incluses dans ce plan.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2.5 pt-2">
          {allFeatures.map((featureKey) => (
            <li key={featureKey} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" aria-hidden />
              <span className="text-sm text-slate-700 leading-relaxed">
                {getFeatureLabel(featureKey, plan)}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
