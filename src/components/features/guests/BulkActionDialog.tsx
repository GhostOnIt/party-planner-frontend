import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/components/ui/alert-dialog';
import { RsvpBadge, rsvpConfig } from './RsvpBadge';
import type { Guest, RsvpStatus } from '@/types';
import { getStatusBreakdown } from '@/utils/bulkActionUtils';
import type { BulkActionType } from '@/utils/bulkActionUtils';

interface BulkActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: BulkActionType;
  eligible: Guest[];
  ineligible: Guest[];
  ineligibleReasons: Record<string, string>;
  newRsvpStatus?: RsvpStatus;
  currentStatusBreakdown?: Record<RsvpStatus, number>;
}

const actionLabels: Record<BulkActionType, string> = {
  send_invitations: 'Envoyer des invitations / rappels',
  send_reminders: 'Envoyer des rappels',
  check_in: 'Effectuer le check-in',
  undo_check_in: 'Annuler le check-in',
  update_rsvp: 'Modifier le statut RSVP',
  delete: 'Supprimer les invités',
};

const actionDescriptions: Record<BulkActionType, string> = {
  send_invitations: "Les invités recevront une invitation s'ils n'en ont pas encore, ou un rappel s'ils en ont déjà une.",
  send_reminders: 'Un rappel sera envoyé à ces invités.',
  check_in: 'Ces invités seront marqués comme présents à l\'événement.',
  undo_check_in: 'Le check-in de ces invités sera annulé.',
  update_rsvp: 'Le statut RSVP sera modifié pour ces invités.',
  delete: 'Ces invités seront définitivement supprimés. Cette action est irréversible.',
};

export function BulkActionDialog({
  open,
  onClose,
  onConfirm,
  action,
  eligible,
  ineligible,
  ineligibleReasons,
  newRsvpStatus,
  currentStatusBreakdown,
}: BulkActionDialogProps) {
  const actionLabel = actionLabels[action];
  const actionDescription = actionDescriptions[action];
  const isDestructive = action === 'delete';

  // For update_rsvp, use provided breakdown or calculate from eligible guests
  const statusBreakdown = action === 'update_rsvp'
    ? currentStatusBreakdown || getStatusBreakdown(eligible)
    : null;

  const hasEligible = eligible.length > 0;
  const hasIneligible = ineligible.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">
            {actionLabel}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-600">
            {action === 'update_rsvp' && newRsvpStatus
              ? `Ces invités passeront au statut "${rsvpConfig[newRsvpStatus].label}".`
              : actionDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Eligible guests */}
          {hasEligible && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">
                  {eligible.length} invité{eligible.length > 1 ? 's' : ''}
                </span>
                <span className="text-gray-500">
                  · Action appliquée
                </span>
              </div>

              {/* Status breakdown for RSVP update */}
              {action === 'update_rsvp' && statusBreakdown && (
                <div className="pl-3 border-l-2 border-gray-200 space-y-1.5">
                  <p className="text-xs text-gray-500 mb-2">Statuts actuels</p>
                  {Object.entries(statusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-2">
                      <RsvpBadge status={status as RsvpStatus} size="sm" />
                      <span className="text-xs text-gray-600">× {count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Ineligible guests */}
          {hasIneligible && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-600">
                  {ineligible.length} invité{ineligible.length > 1 ? 's' : ''}
                </span>
                <span className="text-gray-500">
                  · Ignoré{ineligible.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="pl-3 border-l-2 border-gray-200 space-y-1.5 max-h-32 overflow-y-auto">
                {ineligible.map((guest) => (
                  <div key={guest.id} className="text-xs">
                    <div className="font-medium text-gray-700">{guest.name}</div>
                    <div className="text-gray-500">
                      {ineligibleReasons[guest.id] || 'Non éligible'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No eligible guests */}
          {!hasEligible && (
            <div className="text-center py-6 text-sm text-gray-500">
              <p className="font-medium text-gray-700 mb-1">Aucun invité éligible</p>
              <p>Aucun des invités sélectionnés ne peut recevoir cette action.</p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Annuler
          </AlertDialogCancel>
          {hasEligible && (
            <AlertDialogAction
              onClick={onConfirm}
              className={isDestructive ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Confirmer · {eligible.length}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}