import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RsvpStatus } from '@/types';

const rsvpConfig: Record<RsvpStatus, { label: string; className: string }> = {
  pending: {
    label: 'En attente',
    className: 'bg-muted text-muted-foreground',
  },
  accepted: {
    label: 'Confirme',
    className: 'bg-success text-white',
  },
  declined: {
    label: 'Decline',
    className: 'bg-destructive text-white',
  },
  maybe: {
    label: 'Peut-etre',
    className: 'bg-warning text-white',
  },
};

interface RsvpBadgeProps {
  status: RsvpStatus;
  className?: string;
}

export function RsvpBadge({ status, className }: RsvpBadgeProps) {
  const config = rsvpConfig[status] || rsvpConfig.pending;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export { rsvpConfig };
