import { Users, UserCheck, UserX, HelpCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface GuestStatsProps {
  stats: {
    total: number;
    accepted: number;
    declined: number;
    pending: number;
    maybe: number;
    checked_in: number;
  } | undefined;
  isLoading?: boolean;
}

export function GuestStats({ stats, isLoading = false }: GuestStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: 'Total',
      value: stats?.total ?? 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Confirmes',
      value: stats?.accepted ?? 0,
      icon: UserCheck,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Declines',
      value: stats?.declined ?? 0,
      icon: UserX,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Peut-etre',
      value: stats?.maybe ?? 0,
      icon: HelpCircle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'En attente',
      value: stats?.pending ?? 0,
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
