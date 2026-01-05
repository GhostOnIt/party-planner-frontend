import { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Copy,
  Trash2,
  Users,
  CheckSquare,
  Wallet,
  Image,
  UserPlus,
  Calendar,
  MapPin,
  Clock,
  Crown,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
import { EventStatusBadge, EventTypeBadge } from '@/components/features/events';
import { useEvent, useDeleteEvent, useDuplicateEvent } from '@/hooks/useEvents';
import { GuestsPage } from './GuestsPage';
import { TasksPage } from './TasksPage';
import { BudgetPage } from './BudgetPage';
import { PhotosPage } from './PhotosPage';
import { CollaboratorsPage } from './CollaboratorsPage';
import { EventSubscriptionPage } from './EventSubscriptionPage';
import { getApiErrorMessage } from '@/api/client';

export function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const validTabs = [
    'overview',
    'guests',
    'tasks',
    'budget',
    'photos',
    'collaborators',
    'subscription',
  ];
  const tabFromUrl = searchParams.get('tab');
  const activeTab = validTabs.includes(tabFromUrl || '') ? tabFromUrl : 'overview';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const { data: event, isLoading, error } = useEvent(id);
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const { mutate: duplicateEvent } = useDuplicateEvent();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Calendar}
          title="Evenement introuvable"
          description={
            error ? getApiErrorMessage(error) : "Cet evenement n'existe pas ou a ete supprime"
          }
          action={{
            label: 'Retour aux evenements',
            onClick: () => navigate('/events'),
          }}
        />
      </div>
    );
  }

  const handleDelete = () => {
    deleteEvent(event.id);
    setShowDeleteDialog(false);
  };

  const handleDuplicate = () => {
    duplicateEvent(event.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.title}
        breadcrumbs={[{ label: 'Evenements', href: '/events' }, { label: event.title }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Dupliquer
            </Button>
            <Link to={`/events/${event.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-4">
        <Link to="/events">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <EventTypeBadge type={event.type} />
          <EventStatusBadge status={event.status} />
        </div>
      </div>

      {/* Event Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(parseISO(event.date), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </CardContent>
        </Card>

        {event.time && (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Heure</p>
                <p className="font-medium">{event.time}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {event.location && (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <MapPin className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lieu</p>
                <p className="font-medium truncate">{event.location}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {event.expected_guests && (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invites prevus</p>
                <p className="font-medium">{event.expected_guests}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab || 'overview'} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="guests" className="gap-2">
            <Users className="h-4 w-4" />
            Invites
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Taches
          </TabsTrigger>
          <TabsTrigger value="budget" className="gap-2">
            <Wallet className="h-4 w-4" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="photos" className="gap-2">
            <Image className="h-4 w-4" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="collaborators" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Collaborateurs
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <Crown className="h-4 w-4" />
            Abonnement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {event.description ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">Aucune description</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.theme && (
                  <div>
                    <p className="text-sm text-muted-foreground">Theme</p>
                    <p className="font-medium">{event.theme}</p>
                  </div>
                )}
                {event.budget && (
                  <div>
                    <p className="text-sm text-muted-foreground">Budget prevu</p>
                    <p className="font-medium">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'XAF',
                        maximumFractionDigits: 0,
                      }).format(event.budget)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guests">
          <GuestsPage eventId={id} />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksPage eventId={id} />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetPage eventId={id} />
        </TabsContent>

        <TabsContent value="photos">
          <PhotosPage eventId={id} />
        </TabsContent>

        <TabsContent value="collaborators">
          <CollaboratorsPage eventId={id} />
        </TabsContent>

        <TabsContent value="subscription">
          <EventSubscriptionPage eventId={id} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'evenement</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer "{event.title}" ? Cette action est irreversible et
              supprimera egalement tous les invites, taches et autres donnees associees.
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
