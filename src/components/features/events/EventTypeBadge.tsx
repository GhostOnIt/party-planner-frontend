import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EventType } from '@/types';

const typeConfig: Record<EventType, { label: string; className: string }> = {
  mariage: {
    label: 'Mariage',
    className: 'bg-event-mariage text-white',
  },
  anniversaire: {
    label: 'Anniversaire',
    className: 'bg-event-anniversaire text-white',
  },
  baby_shower: {
    label: 'Baby Shower',
    className: 'bg-event-baby-shower text-white',
  },
  soiree: {
    label: 'Soiree',
    className: 'bg-event-soiree text-white',
  },
  brunch: {
    label: 'Brunch',
    className: 'bg-event-brunch text-white',
  },
  autre: {
    label: 'Autre',
    className: 'bg-event-autre text-white',
  },
};

interface EventTypeBadgeProps {
  type: EventType;
  className?: string;
}

export function EventTypeBadge({ type, className }: EventTypeBadgeProps) {
  const config = typeConfig[type] || typeConfig.autre;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export { typeConfig as eventTypeConfig };
