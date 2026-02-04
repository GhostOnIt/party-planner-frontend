import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RsvpStatus } from '@/types';

// Couleurs explicites pour un bon contraste texte/fond (lisibilité garantie)
const rsvpConfig: Record<RsvpStatus, { label: string; className: string }> = {
  pending: {
    label: 'En attente',
    className: 'bg-zinc-200 text-zinc-800   dark:bg-zinc-600 dark:text-zinc-100 dark:border-zinc-500',
  },
  accepted: {
    label: 'Confirmé',
    className: 'bg-emerald-600 text-white   dark:bg-emerald-600 dark:text-white',
  },
  declined: {
    label: 'Décliné',
    className: 'bg-red-600 text-white   dark:bg-red-600 dark:text-white',
  },
  maybe: {
    label: 'Peut-être',
    className: 'bg-amber-500 text-white   dark:bg-amber-500 dark:text-white',
  },
};

interface RsvpBadgeProps {
  status: RsvpStatus;
  className?: string;
  size?: 'sm' | 'default';
}

export function RsvpBadge({ status, className, size = 'default' }: RsvpBadgeProps) {
  const config = rsvpConfig[status] || rsvpConfig.pending;

  return (
    <Badge
      className={cn(
        config.className,
        size === 'sm' && 'text-[10px] px-2 py-0',
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

export { rsvpConfig };
