import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EventStatus } from '@/types';

const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  draft: {
    label: 'Brouillon',
    className: 'bg-muted text-muted-foreground',
  },
  planning: {
    label: 'En preparation',
    className: 'bg-info text-white',
  },
  confirmed: {
    label: 'Confirme',
    className: 'bg-success text-white',
  },
  completed: {
    label: 'Termine',
    className: 'bg-primary text-white',
  },
  cancelled: {
    label: 'Annule',
    className: 'bg-destructive text-white',
  },
};

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
