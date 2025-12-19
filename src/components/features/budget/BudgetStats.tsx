import { Wallet, Receipt, CreditCard, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { BudgetStats as BudgetStatsType } from '@/types';
import { cn } from '@/lib/utils';

interface BudgetStatsProps {
  stats: BudgetStatsType | undefined;
  isLoading?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(value);
}

export function BudgetStats({ stats, isLoading = false }: BudgetStatsProps) {
  const totalEstimated = stats?.total_estimated ?? 0;
  const totalActual = stats?.total_actual ?? 0;
  const totalPaid = stats?.total_paid ?? 0;

  const difference = totalEstimated - totalActual;
  const isUnderBudget = difference >= 0;
  const percentageDiff = totalEstimated > 0
    ? Math.abs(((totalActual - totalEstimated) / totalEstimated) * 100).toFixed(1)
    : '0';

  const items = [
    {
      label: 'Budget estime',
      value: formatCurrency(totalEstimated),
      icon: Wallet,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      description: `${stats?.items_count ?? 0} postes`,
    },
    {
      label: 'Depenses reelles',
      value: formatCurrency(totalActual),
      icon: Receipt,
      iconColor: isUnderBudget ? 'text-success' : 'text-destructive',
      bgColor: isUnderBudget ? 'bg-success/10' : 'bg-destructive/10',
      description: isUnderBudget
        ? `${formatCurrency(difference)} economises`
        : `${formatCurrency(Math.abs(difference))} de depassement`,
      trend: {
        icon: isUnderBudget ? TrendingDown : TrendingUp,
        value: `${percentageDiff}%`,
        isPositive: isUnderBudget,
      },
    },
    {
      label: 'Deja paye',
      value: formatCurrency(totalPaid),
      icon: CreditCard,
      iconColor: 'text-info',
      bgColor: 'bg-info/10',
      description: totalActual > 0
        ? `${((totalPaid / totalActual) * 100).toFixed(0)}% des depenses`
        : '0% des depenses',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', item.bgColor)}>
                  <Icon className={cn('h-4 w-4', item.iconColor)} />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-2xl font-bold">{item.value}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  {item.trend && (
                    <span
                      className={cn(
                        'flex items-center text-xs font-medium',
                        item.trend.isPositive ? 'text-success' : 'text-destructive'
                      )}
                    >
                      <item.trend.icon className="h-3 w-3 mr-0.5" />
                      {item.trend.value}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
