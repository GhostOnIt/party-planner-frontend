import { useMemo } from 'react';
import {
  Send,
  UserCheck,
  UserX,
  Download,
  Trash2,
  X,
  MoreHorizontal,
  Check,
  Ban,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RsvpBadge } from './RsvpBadge';
import type { Guest, RsvpStatus } from '@/types';
import { cn } from '@/lib/utils';
// Note: Assurez-vous que ce fichier utils existe bien, sinon il faudra le créer ou adapter la logique.
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
  className?: string;
}

const rsvpStatuses: {
  value: RsvpStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: 'accepted', label: 'Accepté', icon: Check },
  { value: 'declined', label: 'Décliné', icon: Ban },
  { value: 'maybe', label: 'Peut-être', icon: HelpCircle },
  { value: 'pending', label: 'En attente', icon: Clock },
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
  className,
}: BulkActionsBarProps) {
  // Optimisation : Calculer les stats uniquement quand la sélection change
  const statusBreakdown = useMemo(() => getStatusBreakdown(selectedGuests), [selectedGuests]);

  // Optimisation : Vérifier l'éligibilité une seule fois par changement de sélection
  const { hasEligibleForCheckIn, hasEligibleForUndoCheckIn, hasEligibleForInvitations } =
    useMemo(() => {
      const checkIn = getEligibilityForAction(selectedGuests, 'check_in');
      const undoCheckIn = getEligibilityForAction(selectedGuests, 'undo_check_in');
      const sendInvites = getEligibilityForAction(selectedGuests, 'send_invitations');

      return {
        hasEligibleForCheckIn: checkIn.eligible.length > 0,
        hasEligibleForUndoCheckIn: undoCheckIn.eligible.length > 0,
        hasEligibleForInvitations: sendInvites.eligible.length > 0,
      };
    }, [selectedGuests]);

  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'sticky bottom-6 z-40 mx-auto max-w-5xl w-full px-4 animate-in slide-in-from-bottom-4 fade-in duration-300',
        className
      )}
    >
      <div className="bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 border border-slate-200/50 shadow-sm rounded-2xl p-2 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* --- ZONE GAUCHE : Infos & Désélection --- */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3 pl-2">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold shadow-sm">
              {selectedCount}
            </span>
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">
              sélectionné{selectedCount > 1 ? 's' : ''}
            </span>
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block bg-slate-200" />

          {/* Résumé des statuts (Scrollable horizontalement sur mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <Badge
                key={status}
                variant="secondary"
                className="h-6 px-2 gap-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-medium border border-slate-100 text-slate-700 rounded-lg whitespace-nowrap"
              >
                <div className="scale-75 origin-left">
                  <RsvpBadge status={status as RsvpStatus} />
                </div>
                <span>{count}</span>
              </Badge>
            ))}
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDeselectAll}
                  className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full sm:ml-2 shrink-0 transition-colors"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tout désélectionner</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* --- ZONE DROITE : Actions --- */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          {/* 1. RSVP */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium shadow-sm"
              >
                <Check className="h-3.5 w-3.5 text-green-600" />
                <span className="hidden lg:inline">RSVP</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-sm border-slate-100">
              <DropdownMenuLabel className="text-xs text-slate-500 font-normal">
                Définir le statut pour la sélection
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {rsvpStatuses.map((status) => (
                <DropdownMenuItem
                  key={status.value}
                  onClick={() => onUpdateRsvp(status.value)}
                  className="cursor-pointer"
                >
                  <status.icon className="mr-2 h-4 w-4 text-slate-500" />
                  {status.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block bg-slate-200" />

          {/* 3. Actions Rapides (Check-in) */}
          {(hasEligibleForCheckIn || hasEligibleForUndoCheckIn) && (
            <div className="flex items-center gap-1">
              {hasEligibleForCheckIn && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onCheckIn}
                        className="h-9 w-9 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Check-in</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {hasEligibleForUndoCheckIn && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onUndoCheckIn}
                        className="h-9 w-9 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-all"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Annuler Check-in</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}

          {/* 4. Menu Plus (Export & Suppression) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-sm border-slate-100">
              {hasEligibleForInvitations && (
                <>
                  <DropdownMenuItem
                    onClick={onSendInvitations}
                    className="focus:bg-blue-50 focus:text-blue-700 cursor-pointer"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer invitations/rappels
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={onExport} className="cursor-pointer">
                <Download className="mr-2 h-4 w-4" />
                Exporter CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
