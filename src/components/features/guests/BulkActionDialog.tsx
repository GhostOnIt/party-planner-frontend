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
  ineligibleReasons: Record<number, string>;
  newRsvpStatus?: RsvpStatus;
  currentStatusBreakdown?: Record<string, number>;
}

const actionLabels: Record<BulkActionType, string> = {
  send_invitations: 'Envoyer des invitations / rappels',
  send_reminders: 'Envoyer des rappels',
  check_in: 'Effectuer le check-in',
  undo_check_in: 'Annuler le check-in',
  update_rsvp: 'Modifier le statut RSVP',
  delete: 'Supprimer les invités',
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

  // For update_rsvp, use provided breakdown or calculate from eligible guests
  const statusBreakdown =
    action === 'update_rsvp' ? currentStatusBreakdown || getStatusBreakdown(eligible) : null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <AlertDialogHeader className="animate-in slide-in-from-top-2 fade-in-0 duration-300">
          <AlertDialogTitle className="text-xl">{actionLabel}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 mt-4">
            {/* Eligible guests section */}
            {eligible.length > 0 && (
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-75 shadow-sm">
                <p className="font-medium text-green-900 dark:text-green-100 flex items-center gap-2">
                  <span className="text-lg animate-in zoom-in-0 duration-300">✓</span>
                  {eligible.length} invité{eligible.length > 1 ? 's' : ''} éligible
                  {eligible.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2 animate-in fade-in-0 duration-500 delay-150">
                  {action === 'update_rsvp' && newRsvpStatus
                    ? `Cette action modifiera le statut RSVP de ces invités en "${rsvpConfig[newRsvpStatus].label}".`
                    : action === 'send_invitations'
                      ? "Les invités recevront une invitation s'ils n'en ont pas encore, ou un rappel s'ils en ont déjà une."
                      : 'Cette action sera appliquée à ces invités.'}
                </p>
              </div>
            )}

            {/* Status breakdown for RSVP update */}
            {action === 'update_rsvp' && statusBreakdown && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-150 shadow-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                  Répartition actuelle par statut :
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusBreakdown).map(([status, count], index) => (
                    <div
                      key={status}
                      className="flex items-center justify-between p-2.5 rounded bg-white dark:bg-gray-800 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${200 + index * 50}ms` }}
                    >
                      <RsvpBadge status={status as RsvpStatus} />
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ineligible guests section */}
            {ineligible.length > 0 && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-200 shadow-sm">
                <p className="font-medium text-yellow-900 dark:text-yellow-100 flex items-center gap-2">
                  <span className="text-lg animate-in zoom-in-0 duration-300">⚠</span>
                  {ineligible.length} invité{ineligible.length > 1 ? 's' : ''} ignoré
                  {ineligible.length > 1 ? 's' : ''}
                </p>
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {ineligible.map((guest, index) => (
                    <div
                      key={guest.id}
                      className="text-sm text-yellow-700 dark:text-yellow-300 bg-white dark:bg-gray-800 rounded p-2.5 animate-in fade-in-0 slide-in-from-right-2 duration-300"
                      style={{ animationDelay: `${250 + index * 50}ms` }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <strong>{guest.name}</strong>
                        <RsvpBadge status={guest.rsvp_status} />
                      </div>
                      <span className="text-xs">
                        {ineligibleReasons[guest.id] || 'Non éligible'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No eligible guests warning */}
            {eligible.length === 0 && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-75 shadow-sm">
                <p className="font-medium text-red-900 dark:text-red-100">Aucun invité éligible</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2 animate-in fade-in-0 duration-500 delay-150">
                  Aucun des invités sélectionnés ne peut recevoir cette action.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 delay-300">
          <AlertDialogCancel className="transition-all duration-200 hover:scale-105">
            Annuler
          </AlertDialogCancel>
          {eligible.length > 0 && (
            <AlertDialogAction
              onClick={onConfirm}
              className="transition-all duration-200 hover:scale-105"
            >
              Confirmer ({eligible.length} invité{eligible.length > 1 ? 's' : ''})
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
