import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PlanType } from '@/types';

interface PlanBadgeProps {
  plan: PlanType;
  className?: string;
}

const planConfig: Record<PlanType, { label: string; className: string }> = {
  starter: {
    label: 'Starter',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  pro: {
    label: 'Pro',
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  },
};

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const config = planConfig[plan];

  if (!config) return null;

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      <Crown className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
