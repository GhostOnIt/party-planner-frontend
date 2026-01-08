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

  const isDestructive = action === 'delete';

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{actionLabel}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 mt-4">
            {/* Eligible guests section */}
            {eligible.length > 0 && (
              <div
                className={`rounded-m p-4 ${isDestructive ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/50'}`}
              >
                <p className="font-medium flex items-center gap-2 mb-2">
                  <span
                    className={
                      isDestructive ? 'text-destructive' : 'text-green-600 dark:text-green-400'
                    }
                  >
                    {isDestructive ? '⚠' : '✓'}
                  </span>
                  {eligible.length} invité{eligible.length > 1 ? 's' : ''} éligible
                  {eligible.length > 1 ? 's' : ''}
                </p>
                <p
                  className={`text-sm ${isDestructive ? 'text-destructive/90' : 'text-muted-foreground'}`}
                >
                  {action === 'update_rsvp' && newRsvpStatus
                    ? `Cette action modifiera le statut RSVP de ces invités en "${rsvpConfig[newRsvpStatus].label}".`
                    : action === 'send_invitations'
                      ? "Les invités recevront une invitation s'ils n'en ont pas encore, ou un rappel s'ils en ont déjà une."
                      : action === 'delete'
                        ? 'Ces invités seront définitivement supprimés. Cette action est irréversible.'
                        : 'Cette action sera appliquée à ces invités.'}
                </p>
              </div>
            )}

            {/* Status breakdown for RSVP update */}
            {action === 'update_rsvp' && statusBreakdown && (
              <div className="rounded-md bg-muted/30 p-4 border">
                <p className="font-medium mb-3">Répartition actuelle par statut :</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusBreakdown).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between p-2 rounded bg-background border"
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
              <div className="rounded-md bg-muted/50 p-4 border">
                <p className="font-medium flex items-center gap-2 mb-3">
                  <span className="text-amber-600 dark:text-amber-400">⚠</span>
                  {ineligible.length} invité{ineligible.length > 1 ? 's' : ''} ignoré
                  {ineligible.length > 1 ? 's' : ''}
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {ineligible.map((guest) => (
                    <div key={guest.id} className="text-sm bg-background rounded p-2 border">
                      <div className="flex items-center gap-2 mb-1">
                        <strong>{guest.name}</strong>
                        <RsvpBadge status={guest.rsvp_status} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {ineligibleReasons[guest.id] || 'Non éligible'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No eligible guests warning */}
            {eligible.length === 0 && (
              <div className="rounded-md bg-muted/50 p-4 border border-destructive/20">
                <p className="font-medium text-destructive">Aucun invité éligible</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Aucun des invités sélectionnés ne peut recevoir cette action.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          {eligible.length > 0 && (
            <AlertDialogAction
              onClick={onConfirm}
              className={
                isDestructive
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
            >
              Confirmer ({eligible.length} invité{eligible.length > 1 ? 's' : ''})
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
