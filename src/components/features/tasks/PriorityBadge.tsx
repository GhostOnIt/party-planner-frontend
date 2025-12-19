import { Badge } from '@/components/ui/badge';
import type { TaskPriority } from '@/types';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

const priorityConfig: Record<TaskPriority, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; className: string }> = {
  high: {
    label: 'Haute',
    variant: 'destructive',
    className: '',
  },
  medium: {
    label: 'Moyenne',
    variant: 'default',
    className: 'bg-warning text-warning-foreground hover:bg-warning/80',
  },
  low: {
    label: 'Basse',
    variant: 'secondary',
    className: '',
  },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}

export { priorityConfig };
