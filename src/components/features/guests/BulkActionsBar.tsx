import { Mail, Send, UserCheck, UserX, Download, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { RsvpBadge } from './RsvpBadge';
import type { Guest, RsvpStatus } from '@/types';
import { getStatusBreakdown, getEligibilityForAction } from '@/utils/bulkActionUtils';

interface BulkActionsBarProps {
  selectedCount: number;
  selectedGuests: Guest[];
  onDeselectAll: () => void;
  onSendInvitations: () => void;
  onSendReminders: () => void;
  onUpdateRsvp: (status: RsvpStatus) => void;
  onCheckIn: () => void;
  onUndoCheckIn: () => void;
  onExport: () => void;
  onDelete: () => void;
}

const rsvpStatuses: { value: RsvpStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'declined', label: 'Décliné' },
  { value: 'maybe', label: 'Peut-être' },
];

export function BulkActionsBar({
  selectedCount,
  selectedGuests,
  onDeselectAll,
  onSendInvitations,
  onUpdateRsvp,
  onCheckIn,
  onUndoCheckIn,
  onExport,
  onDelete,
}: BulkActionsBarProps) {
  const statusBreakdown = getStatusBreakdown(selectedGuests);

  // Check eligibility for actions
  const checkInEligibility = getEligibilityForAction(selectedGuests, 'check_in');
  const undoCheckInEligibility = getEligibilityForAction(selectedGuests, 'undo_check_in');
  const sendInvitationsEligibility = getEligibilityForAction(selectedGuests, 'send_invitations');

  const hasEligibleForCheckIn = checkInEligibility.eligible.length > 0;
  const hasEligibleForUndoCheckIn = undoCheckInEligibility.eligible.length > 0;
  const hasEligibleForInvitations = sendInvitationsEligibility.eligible.length > 0;

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedCount} invité{selectedCount > 1 ? 's' : ''} sélectionné
            {selectedCount > 1 ? 's' : ''}
          </span>
          <Button variant="ghost" size="sm" onClick={onDeselectAll} className="h-7 px-2">
            <X className="h-3 w-3 mr-1" />
            Tout désélectionner
          </Button>
        </div>

        {/* Status breakdown badges */}
        {Object.keys(statusBreakdown).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <Badge key={status} variant="outline" className="gap-1">
                <RsvpBadge status={status as RsvpStatus} />
                <span>{count}</span>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Communication Actions */}
        {hasEligibleForInvitations && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Envoyer
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onSendInvitations}>
                <Send className="mr-2 h-4 w-4" />
                Envoyer des invitations / rappels
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* RSVP Status Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Modifier le statut RSVP
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {rsvpStatuses.map((status) => (
              <DropdownMenuItem key={status.value} onClick={() => onUpdateRsvp(status.value)}>
                <RsvpBadge status={status.value} />
                <span className="ml-2">{status.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Check-in Actions */}
        {hasEligibleForCheckIn && (
          <Button variant="outline" size="sm" onClick={onCheckIn}>
            <UserCheck className="mr-2 h-4 w-4" />
            Check-in
          </Button>
        )}

        {hasEligibleForUndoCheckIn && (
          <Button variant="outline" size="sm" onClick={onUndoCheckIn}>
            <UserX className="mr-2 h-4 w-4" />
            Annuler check-in
          </Button>
        )}

        {/* Export Selected */}
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>

        {/* Delete Selected */}
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </Button>
      </div>
    </div>
  );
}
