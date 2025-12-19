import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { NotificationList } from '@/components/features/notifications';
import { useToast } from '@/hooks/use-toast';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useClearReadNotifications,
} from '@/hooks/useNotifications';
import type { Notification } from '@/types';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  const { data: notificationsData, isLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAllRead } = useMarkAllAsRead();
  const { mutate: deleteNotification, isPending: isDeleting } = useDeleteNotification();
  const { mutate: clearReadNotifications, isPending: isClearingRead } = useClearReadNotifications();

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.unread_count || notifications.filter(n => !n.read_at).length;

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.read_at)
    : notifications;

  const handleMarkAsRead = (id: string) => {
    markAsRead(id, {
      onSuccess: () => {
        toast({
          title: 'Notification marquee comme lue',
        });
      },
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(undefined, {
      onSuccess: () => {
        toast({
          title: 'Toutes les notifications marquees comme lues',
        });
      },
    });
  };

  const handleDelete = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete, {
        onSuccess: () => {
          setNotificationToDelete(null);
          toast({
            title: 'Notification supprimee',
          });
        },
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already
    if (!notification.read_at) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type/data
    const data = notification.data as Record<string, unknown> | null | undefined;
    if (data?.event_id) {
      navigate(`/events/${data.event_id}`);
    } else if (data?.url) {
      navigate(data.url as string);
    }
  };

  const handleClearRead = () => {
    clearReadNotifications(undefined, {
      onSuccess: () => {
        toast({
          title: 'Notifications lues supprimees',
        });
      },
    });
  };

  const readCount = notifications.filter(n => n.read_at).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Toutes vos notifications"
        actions={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAllRead}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Tout marquer comme lu
              </Button>
            )}
            {readCount > 0 && (
              <Button
                variant="outline"
                onClick={handleClearRead}
                disabled={isClearingRead}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer les lues
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                {unreadCount > 0
                  ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                  : 'Aucune notification non lue'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                Toutes ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Non lues ({unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {!isLoading && notifications.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="Aucune notification"
                  description="Vous n'avez aucune notification pour le moment."
                />
              ) : (
                <NotificationList
                  notifications={filteredNotifications}
                  isLoading={isLoading}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={setNotificationToDelete}
                  onClick={handleNotificationClick}
                />
              )}
            </TabsContent>

            <TabsContent value="unread">
              {!isLoading && filteredNotifications.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="Aucune notification non lue"
                  description="Vous avez lu toutes vos notifications."
                />
              ) : (
                <NotificationList
                  notifications={filteredNotifications}
                  isLoading={isLoading}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={setNotificationToDelete}
                  onClick={handleNotificationClick}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!notificationToDelete}
        onOpenChange={() => setNotificationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la notification</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer cette notification ? Cette action
              est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
