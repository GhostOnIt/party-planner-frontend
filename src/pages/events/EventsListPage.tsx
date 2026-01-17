import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
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
import {
  EventCardGrid,
  EventListItem,
  EventStatsCards,
  EventFiltersBar,
  ViewToggle,
} from '@/components/features/events';
import { useEvents, useDeleteEvent, useDuplicateEvent } from '@/hooks/useEvents';
import { useSubscriptions } from '@/hooks/useSubscription';
import { useAuthStore } from '@/stores/authStore';
import {
  transformEventToDisplayFormat,
  type DisplayEvent,
} from '@/utils/eventUtils';
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
  const events = useMemo(() => data?.data || [], [data?.data]);

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

  // Transform events to display format
  const displayEvents: DisplayEvent[] = useMemo(() => {
    return events.map((event) =>
      transformEventToDisplayFormat(event, user?.id)
    );
  }, [events, user?.id]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    // Remonter en haut de la page lors du changement de page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleView = (event: DisplayEvent) => {
    navigate(`/events/${event.id}`);
  };

  const handleEdit = (event: DisplayEvent) => {
    navigate(`/events/${event.id}/edit`);
  };

  const handleDuplicate = (event: DisplayEvent) => {
    duplicateEvent(parseInt(event.id));
  };

  const handleDelete = (event: DisplayEvent) => {
    const originalEvent = events.find((e) => e.id.toString() === event.id);
    if (originalEvent) {
      setEventToDelete(originalEvent);
    }
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
        title="Mes événements"
        description="Gérez tous vos événements en un seul endroit"
        actions={
          <Link to="/events/create">
            <Button className="gap-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:shadow-lg hover:shadow-[#4F46E5]/25">
              <Plus className="h-4 w-4" />
              Nouvel événement
            </Button>
          </Link>
        }
      />

      {/* Stats Cards */}
      {!isLoading && events.length > 0 && (
        <EventStatsCards events={events} />
      )}

      {/* Filters and View Toggle */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <EventFiltersBar filters={filters} onFiltersChange={setFilters} />
        </div>
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          className={cn(
            'grid gap-4',
            viewMode === 'grid'
              ? 'sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
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
          title="Aucun événement"
          description={
            filters.search || filters.status || filters.type
              ? "Aucun événement ne correspond à vos critères de recherche"
              : "Vous n'avez pas encore créé d'événement. Commencez par en créer un !"
          }
          action={
            !filters.search && !filters.status && !filters.type
              ? {
                  label: 'Créer un événement',
                  onClick: () => navigate('/events/create'),
                }
              : undefined
          }
        />
      )}

      {/* Events Grid/List */}
      {!isLoading && displayEvents.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayEvents.map((event) => (
                <EventCardGrid
                  key={event.id}
                  event={event}
                  subscription={subscriptionsByEventId.get(parseInt(event.id))}
                  currentUserId={user?.id}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                      Événement
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                      Invités
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f4f6]">
                  {displayEvents.map((event) => (
                    <EventListItem
                      key={event.id}
                      event={event}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.last_page && meta.last_page > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={cn(
                      currentPage === 1 && 'pointer-events-none opacity-50'
                    )}
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
                      currentPage === meta.last_page &&
                        'pointer-events-none opacity-50'
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!eventToDelete}
        onOpenChange={() => setEventToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'événement</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{eventToDelete?.title}" ? Cette
              action est irréversible et supprimera également tous les invités,
              tâches et autres données associées.
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
