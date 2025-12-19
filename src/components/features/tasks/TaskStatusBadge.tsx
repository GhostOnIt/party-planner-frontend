import { Badge } from '@/components/ui/badge';
import type { TaskStatus } from '@/types';

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; className: string }> = {
  todo: {
    label: 'A faire',
    variant: 'outline',
    className: '',
  },
  in_progress: {
    label: 'En cours',
    variant: 'default',
    className: 'bg-info text-info-foreground hover:bg-info/80',
  },
  completed: {
    label: 'Termine',
    variant: 'default',
    className: 'bg-success text-success-foreground hover:bg-success/80',
  },
  cancelled: {
    label: 'Annule',
    variant: 'secondary',
    className: '',
  },
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

export { statusConfig };
