import { Skeleton } from '@/components/ui/skeleton';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '@/types';

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

export function NotificationList({
  notifications,
  isLoading = false,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications
        .filter((notification) => notification != null)
        .map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            onClick={onClick}
          />
        ))}
    </div>
  );
}
