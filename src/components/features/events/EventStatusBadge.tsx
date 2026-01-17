import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { EventStatus } from '@/types';

// J'ai ajouté les classes 'hover' correspondantes pour éviter que 
// le badge ne redevienne transparent ou change de couleur au survol.
const statusConfig: Record<EventStatus, { label: string; className: string }> = {
  upcoming: {
    label: 'À venir',
    className: '!bg-blue-600 hover:!bg-blue-600 !text-white dark:!bg-blue-700 dark:hover:!bg-blue-700 dark:!text-white border-0',
  },
  ongoing: {
    label: 'En cours',
    className: '!bg-amber-600 hover:!bg-amber-600 !text-white dark:!bg-amber-700 dark:hover:!bg-amber-700 dark:!text-white border-0',
  },
  completed: {
    label: 'Terminé',
    className: '!bg-green-600 hover:!bg-green-600 !text-white dark:!bg-green-700 dark:hover:!bg-green-700 dark:!text-white border-0',
  },
  cancelled: {
    label: 'Annulé',
    className: '!bg-red-600 hover:!bg-red-600 !text-white dark:!bg-red-700 dark:hover:!bg-red-700 dark:!text-white border-0',
  },
};

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.upcoming;

  return (
    // L'ajout de variant="secondary" (ou "default") force souvent shadcn 
    // à utiliser un style "rempli" plutôt qu'un style "outline" transparent de base.
    // Les classes CSS viendront ensuite écraser la couleur.
    <Badge 
      variant="secondary" 
      className={cn("font-medium shadow-none", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}