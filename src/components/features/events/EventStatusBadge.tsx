import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EventStatus } from '@/types';

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  upcoming: {
    label: 'À venir',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  ongoing: {
    label: 'En cours',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  completed: {
    label: 'Terminé',
    className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  cancelled: {
    label: 'Annulé',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.upcoming;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
