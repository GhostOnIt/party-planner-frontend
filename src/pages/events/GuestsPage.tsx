import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Download, Users, Crown, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/api/client';
import {
  GuestStats,
  GuestFilters,
  GuestList,
  GuestForm,
  GuestImportModal,
} from '@/components/features/guests';
import { SubscriptionRequired, LimitStatus } from '@/components/features/subscription';
import {
  useGuests,
  useGuestStats,
  useCreateGuest,
  useUpdateGuest,
  useDeleteGuest,
  useSendInvitation,
  useCheckInGuest,
  useUndoCheckIn,
  useExportGuests,
} from '@/hooks/useGuests';
import { useEventSubscription, useCheckLimits } from '@/hooks/useSubscription';
import type { Guest, GuestFilters as GuestFiltersType, CreateGuestFormData } from '@/types';
import { cn } from '@/lib/utils';

interface GuestsPageProps {
  eventId?: string;
}

export function GuestsPage({ eventId: propEventId }: GuestsPageProps) {
  const { id: paramEventId } = useParams<{ id: string }>();
  const eventId = propEventId || paramEventId;
  const { toast } = useToast();

  const [filters, setFilters] = useState<GuestFiltersType>({ per_page: 20 });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | undefined>();
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);

  const { data: guestsData, isLoading: isLoadingGuests } = useGuests(eventId!, filters);
  const { data: separateStats, isLoading: isLoadingStats } = useGuestStats(eventId!);
  const { data: subscription, isLoading: isLoadingSubscription } = useEventSubscription(eventId!);
  const { data: limits } = useCheckLimits(eventId!);
  const { mutate: createGuest, isPending: isCreating } = useCreateGuest(eventId!);
  const { mutate: updateGuest, isPending: isUpdating } = useUpdateGuest(eventId!);
  const { mutate: deleteGuest, isPending: isDeleting } = useDeleteGuest(eventId!);
  const { mutate: sendInvitation } = useSendInvitation(eventId!);
  const { mutate: checkInGuest } = useCheckInGuest(eventId!);
  const { mutate: undoCheckIn } = useUndoCheckIn(eventId!);
  const { mutate: exportGuests, isPending: isExporting } = useExportGuests(eventId!);

  const guests = guestsData?.data || [];
  const meta = guestsData?.meta;
  // Use stats from main response first, fallback to separate endpoint
  const stats = guestsData?.stats || separateStats;

  // Check if subscription is active
  const subscriptionStatus: string = subscription?.payment_status || subscription?.status || '';
  const hasActiveSubscription = subscriptionStatus === 'paid' || subscriptionStatus === 'active';

  // Check if can add more guests
  const canAddGuests = limits?.can_add_guests ?? hasActiveSubscription;
  const guestLimit = limits?.guest_limit ?? null;
  const currentGuests = limits?.current_guests ?? (stats?.total || 0);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleAddGuest = () => {
    setEditingGuest(undefined);
    setShowForm(true);
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setShowForm(true);
  };

  const [submitError, setSubmitError] = useState<unknown>(null);

  const handleFormSubmit = (data: CreateGuestFormData) => {
    setSubmitError(null);
    if (editingGuest) {
      updateGuest(
        { guestId: editingGuest.id, data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingGuest(undefined);
            setSubmitError(null);
            toast({
              title: 'Invite modifie',
              description: "L'invite a ete modifie avec succes.",
            });
          },
          onError: (error) => {
            setSubmitError(error);
            const errorMessage = getApiErrorMessage(error);
            toast({
              title: 'Erreur',
              description: errorMessage,
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      createGuest(data, {
        onSuccess: () => {
          setShowForm(false);
          setSubmitError(null);
          toast({
            title: 'Invite ajoute',
            description: "L'invite a ete ajoute avec succes.",
          });
        },
        onError: (error) => {
          setSubmitError(error);
          const errorMessage = getApiErrorMessage(error);
          toast({
            title: 'Erreur',
            description: errorMessage,
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (guestToDelete) {
      deleteGuest(guestToDelete.id, {
        onSuccess: () => {
          setGuestToDelete(null);
          toast({
            title: 'Invite supprime',
            description: "L'invite a ete supprime avec succes.",
          });
        },
      });
    }
  };

  const handleSendInvitation = (guest: Guest) => {
    sendInvitation(guest.id, {
      onSuccess: () => {
        toast({
          title: 'Invitation envoyee',
          description: `L'invitation a ete envoyee a ${guest.name}.`,
        });
      },
    });
  };

  const handleCheckIn = (guest: Guest) => {
    checkInGuest(guest.id, {
      onSuccess: () => {
        toast({
          title: 'Check-in effectue',
          description: `${guest.name} a ete enregistre.`,
        });
      },
    });
  };

  const handleUndoCheckIn = (guest: Guest) => {
    undoCheckIn(guest.id, {
      onSuccess: () => {
        toast({
          title: 'Check-in annule',
          description: `Le check-in de ${guest.name} a ete annule.`,
        });
      },
    });
  };

  const handleExport = (format: 'csv' | 'pdf' | 'xlsx') => {
    exportGuests(format, {
      onSuccess: () => {
        toast({
          title: 'Export reussi',
          description: `La liste des invites a ete exportee en ${format.toUpperCase()}.`,
        });
      },
    });
  };

  const handleImportSuccess = () => {
    toast({
      title: 'Import reussi',
      description: 'Les invites ont ete importes avec succes.',
    });
  };

  if (!eventId) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Subscription Required Alert */}
      {!isLoadingSubscription && !hasActiveSubscription && (
        <SubscriptionRequired
          eventId={eventId}
          feature="la gestion des invites"
          message="Un abonnement actif est necessaire pour ajouter et gerer des invites pour votre evenement."
        />
      )}

      {/* Guest Limit Status */}
      {hasActiveSubscription && guestLimit !== null && (
        <LimitStatus current={currentGuests} limit={guestLimit} label="Invites" />
      )}

      {/* Stats */}
      <GuestStats stats={stats} isLoading={isLoadingGuests && isLoadingStats} />

      {/* Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <GuestFilters filters={filters} onFiltersChange={setFilters} />

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isExporting || !hasActiveSubscription}>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('csv')}>Export CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>Export Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>Export PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            onClick={() => setShowImport(true)}
            disabled={!hasActiveSubscription}
            title={!hasActiveSubscription ? 'Abonnement requis' : undefined}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>

          <Button
            onClick={handleAddGuest}
            disabled={!canAddGuests}
            title={
              !hasActiveSubscription
                ? 'Abonnement requis'
                : !canAddGuests
                  ? 'Limite atteinte'
                  : undefined
            }
          >
            {!canAddGuests && hasActiveSubscription ? (
              <Crown className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Ajouter un invite
          </Button>
        </div>
      </div>

      {/* Guests List */}
      {!isLoadingGuests && guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun invite"
          description={
            !hasActiveSubscription
              ? 'Souscrivez a un abonnement pour commencer a ajouter des invites.'
              : filters.search || filters.rsvp_status
                ? 'Aucun invite ne correspond a vos criteres de recherche'
                : "Vous n'avez pas encore ajoute d'invites. Commencez par en ajouter un !"
          }
          action={
            !filters.search && !filters.rsvp_status && canAddGuests
              ? {
                  label: 'Ajouter un invite',
                  onClick: handleAddGuest,
                }
              : undefined
          }
        />
      ) : (
        <>
          <GuestList
            guests={guests}
            isLoading={isLoadingGuests}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            onEdit={handleEditGuest}
            onDelete={setGuestToDelete}
            onSendInvitation={handleSendInvitation}
            onCheckIn={handleCheckIn}
            onUndoCheckIn={handleUndoCheckIn}
          />

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    className={cn(meta.current_page === 1 && 'pointer-events-none opacity-50')}
                  />
                </PaginationItem>

                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                  .filter((page) => {
                    const current = meta.current_page;
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
                        isActive={page === meta.current_page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    className={cn(
                      meta.current_page === meta.last_page && 'pointer-events-none opacity-50'
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Guest Form Modal */}
      <GuestForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (open) {
            setSubmitError(null);
          }
        }}
        guest={editingGuest}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
        submitError={submitError}
      />

      {/* Guest Import Modal */}
      <GuestImportModal
        open={showImport}
        onOpenChange={setShowImport}
        eventId={eventId}
        onSuccess={handleImportSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!guestToDelete} onOpenChange={() => setGuestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'invite</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer "{guestToDelete?.name}" ? Cette action est
              irreversible.
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
