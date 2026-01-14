import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, List, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { EventCard, EventFilters } from '@/components/features/events';
import { useEvents, useDeleteEvent, useDuplicateEvent } from '@/hooks/useEvents';
import { useSubscriptions } from '@/hooks/useSubscription';
import { useAuthStore } from '@/stores/authStore';
import type { Event, EventFilters as EventFiltersType, Subscription } from '@/types';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

export function EventsListPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<EventFiltersType>({ per_page: 12 });
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const { data, isLoading } = useEvents(filters);
  const { data: subscriptions = [] } = useSubscriptions();
  const { mutate: deleteEvent, isPending: isDeleting } = useDeleteEvent();
  const { mutate: duplicateEvent } = useDuplicateEvent();
  const events = data?.data || [];

  // Synchroniser currentPage avec la réponse API ou les filtres
  const currentPage = data?.current_page ?? filters.page ?? 1;

  // Utiliser data.last_page au lieu de data.to
  const meta = data ? { last_page: data.last_page, total: data.total } : undefined;

  // Create a map of eventId -> subscription for quick lookup
  const subscriptionsByEventId = useMemo(() => {
    const map = new Map<number, Subscription>();
    subscriptions.forEach((sub) => {
      // Only include active subscriptions (paid status)
      const status: string = sub.payment_status || sub.status || 'pending';
      if (status === 'paid' || status === 'active') {
        map.set(sub.event_id, sub);
      }
    });
    return map;
  }, [subscriptions]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    // Remonter en haut de la page lors du changement de page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (event: Event) => {
    navigate(`/events/${event.id}/edit`);
  };

  const handleDuplicate = (event: Event) => {
    duplicateEvent(event.id);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete.id);
      setEventToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes evenements"
        description="Gerez tous vos evenements"
        actions={
          <Link to="/events/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvel evenement
            </Button>
          </Link>
        }
      />

      {/* Filters and View Toggle */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <EventFilters filters={filters} onFiltersChange={setFilters} />
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          className={cn(
            'grid gap-4',
            viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && events.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="Aucun evenement"
          description={
            filters.search || filters.status || filters.type
              ? 'Aucun evenement ne correspond a vos criteres de recherche'
              : "Vous n'avez pas encore cree d'evenement. Commencez par en creer un !"
          }
          action={
            !filters.search && !filters.status && !filters.type
              ? {
                  label: 'Creer un evenement',
                  onClick: () => navigate('/events/create'),
                }
              : undefined
          }
        />
      )}

      {/* Events Grid/List */}
      {!isLoading && events.length > 0 && (
        <>
          <div
            className={cn(
              'grid gap-4',
              viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            )}
          >
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                subscription={subscriptionsByEventId.get(event.id)}
                currentUserId={user?.id}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={setEventToDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.last_page && meta.last_page > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={cn(currentPage === 1 && 'pointer-events-none opacity-50')}
                  />
                </PaginationItem>

                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                  .filter((page) => {
                    const current = currentPage;
                    return (
                      page === 1 ||
                      page === meta.last_page ||
                      (page >= current - 1 && page <= current + 1)
                    );
                  })
                  .map((page, index, array) => (
                    <PaginationItem key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={cn(
                      currentPage === meta.last_page && 'pointer-events-none opacity-50'
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'evenement</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer "{eventToDelete?.title}" ? Cette action est
              irreversible et supprimera egalement tous les invites, taches et autres donnees
              associees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
