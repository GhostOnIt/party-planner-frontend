import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Bell,
  Calendar,
  Users,
  CheckSquare,
  Wallet,
  Image,
  UserPlus,
  Mail,
  MoreHorizontal,
  Trash2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const notificationIcons: Record<string, typeof Bell> = {
  'event.created': Calendar,
  'event.updated': Calendar,
  'event.reminder': Calendar,
  'guest.rsvp': Users,
  'guest.added': Users,
  'task.assigned': CheckSquare,
  'task.completed': CheckSquare,
  'task.reminder': CheckSquare,
  'budget.updated': Wallet,
  'photo.uploaded': Image,
  'collaborator.invited': UserPlus,
  'collaborator.joined': UserPlus,
  'invitation.received': Mail,
  default: Bell,
};

const notificationColors: Record<string, string> = {
  'event.created': 'text-primary bg-primary/10',
  'event.updated': 'text-primary bg-primary/10',
  'event.reminder': 'text-warning bg-warning/10',
  'guest.rsvp': 'text-success bg-success/10',
  'guest.added': 'text-info bg-info/10',
  'task.assigned': 'text-info bg-info/10',
  'task.completed': 'text-success bg-success/10',
  'task.reminder': 'text-warning bg-warning/10',
  'budget.updated': 'text-warning bg-warning/10',
  'photo.uploaded': 'text-purple-500 bg-purple-500/10',
  'collaborator.invited': 'text-info bg-info/10',
  'collaborator.joined': 'text-success bg-success/10',
  'invitation.received': 'text-primary bg-primary/10',
  default: 'text-muted-foreground bg-muted',
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationItemProps) {
  // Safety check: ensure notification exists
  if (!notification) {
    return null;
  }

  const Icon = notificationIcons[notification.type] || notificationIcons.default;
  const colorClass = notificationColors[notification.type] || notificationColors.default;
  const isRead = !!notification.read_at;

  const timeAgo = formatDistanceToNow(parseISO(notification.created_at), {
    addSuffix: true,
    locale: fr,
  });

  // Extract message from notification
  const getMessage = () => {
    // First, check if title or message exist directly on notification (from API)
    if (notification.title && typeof notification.title === 'string') {
      return notification.title;
    }
    if (notification.message && typeof notification.message === 'string') {
      return notification.message;
    }
    
    // Fallback: check in data object
    const data = notification.data as Record<string, unknown> | null | undefined;
    if (data && typeof data === 'object') {
      const message = data.message;
      const title = data.title;
      
      if (typeof message === 'string' && message) return message;
      if (typeof title === 'string' && title) return title;
    }
    
    // Generate message based on notification type if no message found
    return getMessageByType(notification.type);
  };

  // Generate message based on notification type
  const getMessageByType = (type: string): string => {
    const typeMessages: Record<string, string> = {
      'event.created': 'Nouvel événement créé',
      'event.updated': 'Événement mis à jour',
      'event.reminder': 'Rappel d\'événement',
      'guest.rsvp': 'Nouvelle réponse RSVP',
      'guest.added': 'Nouvel invité ajouté',
      'task.assigned': 'Tâche assignée',
      'task.completed': 'Tâche complétée',
      'task.reminder': 'Rappel de tâche',
      'budget.updated': 'Budget mis à jour',
      'photo.uploaded': 'Photo ajoutée',
      'collaborator.invited': 'Invitation à collaborer',
      'collaborator.joined': 'Nouveau collaborateur',
      'invitation.received': 'Nouvelle invitation',
      // Backend types
      'task_reminder': 'Rappel de tâche',
      'guest_reminder': 'Rappel invité',
      'budget_alert': 'Alerte budget',
      'event_reminder': 'Rappel événement',
      'collaboration_invite': 'Invitation à collaborer',
    };
    
    return typeMessages[type] || 'Nouvelle notification';
  };

  const getDescription = () => {
    // If title exists, use message as description
    if (notification.title && notification.message && typeof notification.message === 'string') {
      return notification.message;
    }
    
    // Fallback: check in data object
    const data = notification.data as Record<string, unknown> | null | undefined;
    if (data && typeof data === 'object') {
      const description = data.description;
      const body = data.body;
      
      if (typeof description === 'string' && description) return description;
      if (typeof body === 'string' && body) return body;
    }
    
    return null;
  };

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg border p-4 transition-colors',
        isRead ? 'bg-background' : 'bg-muted/30',
        onClick && 'cursor-pointer hover:bg-muted/50'
      )}
      onClick={() => onClick?.(notification)}
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', colorClass)}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={cn('text-sm', !isRead && 'font-medium')}>
              {getMessage()}
            </p>
            {getDescription() && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {getDescription()}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{timeAgo}</p>
          </div>

          <div className="flex items-center gap-1">
            {!isRead && (
              <div className="h-2 w-2 rounded-full bg-primary" title="Non lu" />
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isRead && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead?.(notification.id);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Marquer comme lu
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(notification.id);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
