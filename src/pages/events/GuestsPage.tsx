import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Download, Users, Crown, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  BulkActionsBar,
  BulkActionDialog,
  InvitationDetailsSheet,
  ExportGuestsModal,
  type ExportFilters,
} from '@/components/features/guests';
import { SubscriptionRequired, LimitStatus } from '@/components/features/subscription';
import {
  useGuests,
  useGuestStats,
  useCreateGuest,
  useUpdateGuest,
  useDeleteGuest,
  useSendInvitation,
  useSendReminder,
  useCheckInGuest,
  useUndoCheckIn,
  useExportGuests,
} from '@/hooks/useGuests';
import { useEventSubscription, useCheckLimits } from '@/hooks/useSubscription';
import { PermissionGuard } from '@/components/ui/permission-guard';
import { useGuestsPermissions } from '@/hooks/usePermissions';
import type {
  Guest,
  GuestFilters as GuestFiltersType,
  CreateGuestFormData,
  RsvpStatus,
} from '@/types';
import { cn } from '@/lib/utils';
import {
  getEligibilityForAction,
  getStatusBreakdown,
  type BulkActionType,
} from '@/utils/bulkActionUtils';

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
  const [guestForInvitationDetails, setGuestForInvitationDetails] = useState<Guest | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean;
    action: BulkActionType;
    eligible: Guest[];
    ineligible: Guest[];
    reasons: Record<number, string>;
    newRsvpStatus?: RsvpStatus;
    currentStatusBreakdown?: Record<string, number>;
  } | null>(null);

  // Normalize search to avoid issues with leading/trailing spaces and improve matching
  const apiFilters: GuestFiltersType = {
    ...filters,
    search: filters.search?.trim().replace(/\s+/g, ' ') || undefined,
  };

  const { data: guestsData, isLoading: isLoadingGuests } = useGuests(eventId!, apiFilters);
  const { data: separateStats, isLoading: isLoadingStats } = useGuestStats(eventId!);
  const { data: subscription, isLoading: isLoadingSubscription } = useEventSubscription(eventId!);
  const { data: limits } = useCheckLimits(eventId!);
  const guestPermissions = useGuestsPermissions(eventId!);

  const { mutate: createGuest, isPending: isCreating } = useCreateGuest(eventId!);
  const { mutate: updateGuest, isPending: isUpdating } = useUpdateGuest(eventId!);
  const { mutate: deleteGuest, isPending: isDeleting } = useDeleteGuest(eventId!);
  const { mutate: sendInvitation } = useSendInvitation(eventId!);
  const { mutate: sendReminder } = useSendReminder(eventId!);
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
          onError: (_error) => {
            setSubmitError(_error);
            const errorMessage = getApiErrorMessage(_error);
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
        onError: (_error) => {
          setSubmitError(_error);
          const errorMessage = getApiErrorMessage(_error);
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
    const shouldUseReminder = !!guest.invitation_sent_at;
    if (shouldUseReminder) {
      sendReminder(guest.id, {
        onSuccess: () => {
          toast({
            title: 'Rappel envoyé',
            description: `Le rappel a été envoyé à ${guest.name}.`,
          });
        },
        onError: (error) => {
          toast({
            title: 'Erreur',
            description: `Erreur lors de l'envoi: ${getApiErrorMessage(error)}`,
            variant: 'destructive',
          });
        },
      });
    } else {
      sendInvitation(guest.id, {
        onSuccess: (data) => {
          const isReminder = data?.type === 'reminder';
          toast({
            title: isReminder ? 'Rappel envoyé' : 'Invitation envoyée',
            description: isReminder
              ? `Le rappel a été envoyé à ${guest.name}.`
              : `L'invitation a été envoyée à ${guest.name}.`,
          });
        },
        onError: (error) => {
          toast({
            title: 'Erreur',
            description: `Erreur lors de l'envoi: ${getApiErrorMessage(error)}`,
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleCheckIn = (guest: Guest) => {
    checkInGuest(guest.id, {
      onSuccess: () => {
        toast({
          title: 'Check-in effectué',
          description: `${guest.name} a été enregistré.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Erreur',
          description: `Erreur lors du check-in: ${getApiErrorMessage(error)}`,
          variant: 'destructive',
        });
      },
    });
  };

  const handleUndoCheckIn = (guest: Guest) => {
    undoCheckIn(guest.id, {
      onSuccess: () => {
        toast({
          title: 'Check-in annulé',
          description: `Le check-in de ${guest.name} a été annulé.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Erreur',
          description: `Erreur lors de l'annulation du check-in: ${getApiErrorMessage(error)}`,
          variant: 'destructive',
        });
      },
    });
  };

  const handleExport = (format: 'csv' | 'pdf' | 'xlsx', filters: ExportFilters = {}) => {
    exportGuests(
      { format, filters },
      {
        onSuccess: () => {
          setShowExportModal(false);
          toast({
            title: 'Export réussi',
            description: `La liste des invités a été exportée en ${format.toUpperCase()}.`,
          });
        },
        onError: (error) => {
          toast({
            title: 'Erreur',
            description: `Erreur lors de l'export: ${getApiErrorMessage(error)}`,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleImportSuccess = () => {
    toast({
      title: 'Import reussi',
      description: 'Les invites ont ete importes avec succes.',
    });
  };

  // Bulk action handlers
  const selectedGuests = guests.filter((g) => selectedIds.includes(g.id));

  const handleBulkSendInvitations = () => {
    const { eligible, ineligible, reasons } = getEligibilityForAction(
      selectedGuests,
      'send_invitations'
    );

    if (eligible.length === 0) {
      toast({
        title: 'Aucun invité éligible',
        description: 'Aucun invité sélectionné ne peut recevoir une invitation.',
        variant: 'destructive',
      });
      return;
    }

    if (ineligible.length > 0) {
      setBulkActionDialog({
        open: true,
        action: 'send_invitations',
        eligible,
        ineligible,
        reasons,
      });
    } else {
      // All eligible, proceed directly
      eligible.forEach((guest) => {
        sendInvitation(guest.id, {
          onSuccess: () => {
            if (eligible.indexOf(guest) === eligible.length - 1) {
              setSelectedIds([]);
              toast({
                title: 'Invitations envoyées',
                description: `${eligible.length} invitation(s) envoyée(s) avec succès.`,
              });
            }
          },
        });
      });
    }
  };

  const handleBulkSendReminders = () => {
    const { eligible, ineligible, reasons } = getEligibilityForAction(
      selectedGuests,
      'send_reminders'
    );

    if (eligible.length === 0) {
      toast({
        title: 'Aucun invité éligible',
        description: 'Aucun invité sélectionné ne peut recevoir un rappel.',
        variant: 'destructive',
      });
      return;
    }

    if (ineligible.length > 0) {
      setBulkActionDialog({
        open: true,
        action: 'send_reminders',
        eligible,
        ineligible,
        reasons,
      });
    } else {
      // All eligible, proceed directly
      eligible.forEach((guest) => {
        sendReminder(guest.id, {
          onSuccess: () => {
            if (eligible.indexOf(guest) === eligible.length - 1) {
              setSelectedIds([]);
              toast({
                title: 'Rappels envoyés',
                description: `${eligible.length} rappel(s) envoyé(s) avec succès.`,
              });
            }
          },
          onError: (_error) => {
            toast({
              title: 'Erreur',
              description: `Erreur lors de l'envoi du rappel à ${guest.name}.`,
              variant: 'destructive',
            });
          },
        });
      });
    }
  };

  const handleBulkUpdateRsvp = (newStatus: RsvpStatus) => {
    const { eligible, ineligible, reasons } = getEligibilityForAction(
      selectedGuests,
      'update_rsvp',
      newStatus
    );

    // Filter out guests that already have the target status
    const guestsToUpdate = eligible.filter((g) => g.rsvp_status !== newStatus);

    if (guestsToUpdate.length === 0) {
      toast({
        title: 'Aucun changement',
        description: 'Tous les invités sélectionnés ont déjà ce statut.',
        variant: 'default',
      });
      return;
    }

    const currentStatusBreakdown = getStatusBreakdown(selectedGuests);

    setBulkActionDialog({
      open: true,
      action: 'update_rsvp',
      eligible: guestsToUpdate,
      ineligible,
      reasons,
      newRsvpStatus: newStatus,
      currentStatusBreakdown,
    });
  };

  const handleBulkCheckIn = () => {
    const { eligible, ineligible, reasons } = getEligibilityForAction(selectedGuests, 'check_in');

    if (eligible.length === 0) {
      toast({
        title: 'Aucun invité éligible',
        description: 'Aucun invité sélectionné ne peut être enregistré.',
        variant: 'destructive',
      });
      return;
    }

    if (ineligible.length > 0) {
      setBulkActionDialog({
        open: true,
        action: 'check_in',
        eligible,
        ineligible,
        reasons,
      });
    } else {
      // All eligible, proceed directly
      eligible.forEach((guest) => {
        checkInGuest(guest.id, {
          onSuccess: () => {
            if (eligible.indexOf(guest) === eligible.length - 1) {
              setSelectedIds([]);
              toast({
                title: 'Check-in effectué',
                description: `${eligible.length} invité(s) enregistré(s) avec succès.`,
              });
            }
          },
          onError: (error) => {
            toast({
              title: 'Erreur',
              description: `Erreur lors du check-in de ${guest.name}: ${getApiErrorMessage(error)}`,
              variant: 'destructive',
            });
          },
        });
      });
    }
  };

  const handleBulkUndoCheckIn = () => {
    const { eligible, ineligible, reasons } = getEligibilityForAction(
      selectedGuests,
      'undo_check_in'
    );

    if (eligible.length === 0) {
      toast({
        title: 'Aucun invité éligible',
        description: "Aucun invité sélectionné n'a été enregistré.",
        variant: 'destructive',
      });
      return;
    }

    if (ineligible.length > 0) {
      setBulkActionDialog({
        open: true,
        action: 'undo_check_in',
        eligible,
        ineligible,
        reasons,
      });
    } else {
      // All eligible, proceed directly
      eligible.forEach((guest) => {
        undoCheckIn(guest.id, {
          onSuccess: () => {
            if (eligible.indexOf(guest) === eligible.length - 1) {
              setSelectedIds([]);
              toast({
                title: 'Check-in annulé',
                description: `Le check-in de ${eligible.length} invité(s) a été annulé.`,
              });
            }
          },
          onError: (error) => {
            toast({
              title: 'Erreur',
              description: `Erreur lors de l'annulation du check-in de ${guest.name}: ${getApiErrorMessage(error)}`,
              variant: 'destructive',
            });
          },
        });
      });
    }
  };

  const handleBulkDelete = () => {
    // For delete, all are eligible but show confirmation
    setBulkActionDialog({
      open: true,
      action: 'delete',
      eligible: selectedGuests,
      ineligible: [],
      reasons: {},
    });
  };

  const handleExportSelected = () => {
    // Open export modal with filters
    setShowExportModal(true);
  };

  const handleBulkActionConfirm = () => {
    if (!bulkActionDialog) return;

    const { action, eligible, newRsvpStatus } = bulkActionDialog;

    switch (action) {
      case 'send_invitations': {
        let successCount = 0;
        let invitationCount = 0;
        let reminderCount = 0;

        eligible.forEach((guest) => {
          sendInvitation(guest.id, {
            onSuccess: (data) => {
              successCount++;
              if (data?.type === 'reminder') {
                reminderCount++;
              } else {
                invitationCount++;
              }

              if (successCount === eligible.length) {
                setSelectedIds([]);
                setBulkActionDialog(null);
                let message = '';
                if (invitationCount > 0 && reminderCount > 0) {
                  message = `${invitationCount} invitation(s) et ${reminderCount} rappel(s) envoyé(s) avec succès.`;
                } else if (invitationCount > 0) {
                  message = `${invitationCount} invitation(s) envoyée(s) avec succès.`;
                } else if (reminderCount > 0) {
                  message = `${reminderCount} rappel(s) envoyé(s) avec succès.`;
                }
                toast({
                  title: 'Envoi réussi',
                  description: message,
                });
              }
            },
            onError: (error) => {
              toast({
                title: 'Erreur',
                description: `Erreur lors de l'envoi à ${guest.name}: ${getApiErrorMessage(error)}`,
                variant: 'destructive',
              });
            },
          });
        });
        break;
      }

      case 'send_reminders':
        eligible.forEach((guest) => {
          sendReminder(guest.id, {
            onSuccess: () => {
              if (eligible.indexOf(guest) === eligible.length - 1) {
                setSelectedIds([]);
                setBulkActionDialog(null);
                toast({
                  title: 'Rappels envoyés',
                  description: `${eligible.length} rappel(s) envoyé(s) avec succès.`,
                });
              }
            },
            onError: (_error) => {
              toast({
                title: 'Erreur',
                description: `Erreur lors de l'envoi du rappel à ${guest.name}.`,
                variant: 'destructive',
              });
            },
          });
        });
        break;

      case 'update_rsvp':
        if (newRsvpStatus) {
          eligible.forEach((guest) => {
            updateGuest(
              {
                guestId: guest.id,
                data: { rsvp_status: newRsvpStatus } as Partial<CreateGuestFormData> & {
                  rsvp_status: RsvpStatus;
                },
              },
              {
                onSuccess: () => {
                  if (eligible.indexOf(guest) === eligible.length - 1) {
                    setSelectedIds([]);
                    setBulkActionDialog(null);
                    toast({
                      title: 'Statut mis à jour',
                      description: `${eligible.length} invité(s) mis à jour avec succès.`,
                    });
                  }
                },
              }
            );
          });
        }
        break;

      case 'check_in':
        eligible.forEach((guest) => {
          checkInGuest(guest.id, {
            onSuccess: () => {
              if (eligible.indexOf(guest) === eligible.length - 1) {
                setSelectedIds([]);
                setBulkActionDialog(null);
                toast({
                  title: 'Check-in effectué',
                  description: `${eligible.length} invité(s) enregistré(s) avec succès.`,
                });
              }
            },
            onError: (error) => {
              toast({
                title: 'Erreur',
                description: `Erreur lors du check-in de ${guest.name}: ${getApiErrorMessage(error)}`,
                variant: 'destructive',
              });
            },
          });
        });
        break;

      case 'undo_check_in':
        eligible.forEach((guest) => {
          undoCheckIn(guest.id, {
            onSuccess: () => {
              if (eligible.indexOf(guest) === eligible.length - 1) {
                setSelectedIds([]);
                setBulkActionDialog(null);
                toast({
                  title: 'Check-in annulé',
                  description: `Le check-in de ${eligible.length} invité(s) a été annulé.`,
                });
              }
            },
            onError: (error) => {
              toast({
                title: 'Erreur',
                description: `Erreur lors de l'annulation du check-in de ${guest.name}: ${getApiErrorMessage(error)}`,
                variant: 'destructive',
              });
            },
          });
        });
        break;

      case 'delete':
        // Delete all eligible guests
        eligible.forEach((guest) => {
          deleteGuest(guest.id, {
            onSuccess: () => {
              if (eligible.indexOf(guest) === eligible.length - 1) {
                setSelectedIds([]);
                setBulkActionDialog(null);
                toast({
                  title: 'Invités supprimés',
                  description: `${eligible.length} invité(s) supprimé(s) avec succès.`,
                });
              }
            },
          });
        });
        break;
    }
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
      <PermissionGuard eventId={eventId!} permissions={['guests.view']}>
        <GuestStats stats={stats} isLoading={isLoadingGuests && isLoadingStats} />
      </PermissionGuard>

      {/* Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <GuestFilters filters={filters} onFiltersChange={setFilters} />

        <div className="flex items-center gap-2">
          <PermissionGuard eventId={eventId!} permissions={['guests.export']}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting || !hasActiveSubscription}>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>Export CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                  Export Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>Export PDF</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowExportModal(true)}>
                  Exporter avec filtres...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </PermissionGuard>

          <PermissionGuard eventId={eventId!} permissions={['guests.import']}>
            <Button
              variant="outline"
              onClick={() => setShowImport(true)}
              disabled={!hasActiveSubscription}
              title={!hasActiveSubscription ? 'Abonnement requis' : undefined}
            >
              <Upload className="mr-2 h-4 w-4" />
              Importer
            </Button>
          </PermissionGuard>

          <PermissionGuard eventId={eventId!} permissions={['guests.create']}>
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
          </PermissionGuard>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <PermissionGuard eventId={eventId!} permissions={['guests.view']}>
          <BulkActionsBar
            selectedCount={selectedIds.length}
            selectedGuests={selectedGuests}
            onDeselectAll={() => setSelectedIds([])}
            onSendInvitations={
              guestPermissions.canSendInvitations ? handleBulkSendInvitations : undefined
            }
            onSendReminders={
              guestPermissions.canSendInvitations ? handleBulkSendReminders : undefined
            }
            onUpdateRsvp={guestPermissions.canEdit ? handleBulkUpdateRsvp : undefined}
            onCheckIn={guestPermissions.canCheckIn ? handleBulkCheckIn : undefined}
            onUndoCheckIn={guestPermissions.canCheckIn ? handleBulkUndoCheckIn : undefined}
            onExport={guestPermissions.canExport ? handleExportSelected : undefined}
            onDelete={guestPermissions.canDelete ? handleBulkDelete : undefined}
          />
        </PermissionGuard>
      )}

      {/* Guests List */}
      <PermissionGuard
        eventId={eventId!}
        permissions={['guests.view']}
        fallback={
          <EmptyState
            icon={Users}
            title="Accès restreint"
            description="Vous n'avez pas les permissions nécessaires pour consulter les invités de cet événement."
          />
        }
      >
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
              !filters.search && !filters.rsvp_status && canAddGuests && guestPermissions.canCreate
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
              onViewInvitationDetails={(guest) => setGuestForInvitationDetails(guest)}
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
      </PermissionGuard>

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

      {/* Bulk Action Dialog */}
      {bulkActionDialog && (
        <BulkActionDialog
          open={bulkActionDialog.open}
          onClose={() => setBulkActionDialog(null)}
          onConfirm={handleBulkActionConfirm}
          action={bulkActionDialog.action}
          eligible={bulkActionDialog.eligible}
          ineligible={bulkActionDialog.ineligible}
          ineligibleReasons={bulkActionDialog.reasons}
          newRsvpStatus={bulkActionDialog.newRsvpStatus}
          currentStatusBreakdown={bulkActionDialog.currentStatusBreakdown}
        />
      )}

      {/* Invitation Details Sheet */}
      <InvitationDetailsSheet
        open={!!guestForInvitationDetails}
        onOpenChange={(open) => {
          if (!open) {
            setGuestForInvitationDetails(null);
          }
        }}
        eventId={eventId!}
        guestId={guestForInvitationDetails?.id || null}
      />

      {/* Export Guests Modal */}
      <ExportGuestsModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        onExport={handleExport}
        isExporting={isExporting}
      />
    </div>
  );
}
