import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Calendar, CheckCircle, Users, Wallet, ArrowRight, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

interface RecentActivityProps {
  notifications: Notification[];
  isLoading?: boolean;
}

const notificationIcons: Record<string, typeof Bell> = {
  task_reminder: CheckCircle,
  guest_reminder: Users,
  budget_alert: Wallet,
  event_reminder: Calendar,
  collaboration_invite: Users,
};

const notificationColors: Record<string, string> = {
  task_reminder: 'text-blue-500 bg-blue-50',
  guest_reminder: 'text-purple-500 bg-purple-50',
  budget_alert: 'text-orange-500 bg-orange-50',
  event_reminder: 'text-green-500 bg-green-50',
  collaboration_invite: 'text-pink-500 bg-pink-50',
};

export function RecentActivity({ notifications, isLoading = false }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activite recente
          </CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activite recente
          </CardTitle>
          <CardDescription>
            {notifications.length > 0
              ? `${notifications.length} activite(s) recente(s)`
              : 'Aucune activite recente'}
          </CardDescription>
        </div>
        {notifications.length > 0 && (
          <Link to="/notifications">
            <Button variant="ghost" size="sm" className="gap-1">
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Aucune activite recente
            </p>
            <p className="text-xs text-muted-foreground">
              Vos notifications et alertes apparaitront ici
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || Bell;
              const colorClass = notificationColors[notification.type] || 'text-gray-500 bg-gray-50';

              return (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 rounded-lg p-2 transition-colors',
                    notification.read_at ? 'opacity-60' : 'bg-muted/50'
                  )}
                >
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', colorClass)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium', !notification.read_at && 'font-semibold')}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(parseISO(notification.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
