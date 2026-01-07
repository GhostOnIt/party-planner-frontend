import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RsvpBadge } from './RsvpBadge';
import type { RsvpStatus } from '@/types';

export interface ExportFilters {
  rsvp_status?: RsvpStatus[];
  checked_in?: boolean;
  invitation_sent?: boolean;
}

interface ExportGuestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: 'csv' | 'pdf' | 'xlsx', filters: ExportFilters) => void;
  isExporting?: boolean;
}

const rsvpStatuses: { value: RsvpStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'declined', label: 'Décliné' },
  { value: 'maybe', label: 'Peut-être' },
];

export function ExportGuestsModal({
  open,
  onOpenChange,
  onExport,
  isExporting = false,
}: ExportGuestsModalProps) {
  const [selectedRsvpStatuses, setSelectedRsvpStatuses] = useState<RsvpStatus[]>([]);
  const [checkedInFilter, setCheckedInFilter] = useState<boolean | undefined>(undefined);
  const [invitationSentFilter, setInvitationSentFilter] = useState<boolean | undefined>(
    undefined
  );

  const handleRsvpStatusToggle = (status: RsvpStatus) => {
    setSelectedRsvpStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleExport = (format: 'csv' | 'pdf' | 'xlsx') => {
    const filters: ExportFilters = {};

    if (selectedRsvpStatuses.length > 0) {
      filters.rsvp_status = selectedRsvpStatuses;
    }

    if (checkedInFilter !== undefined) {
      filters.checked_in = checkedInFilter;
    }

    if (invitationSentFilter !== undefined) {
      filters.invitation_sent = invitationSentFilter;
    }

    onExport(format, filters);
  };

  const handleReset = () => {
    setSelectedRsvpStatuses([]);
    setCheckedInFilter(undefined);
    setInvitationSentFilter(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter les invités
          </DialogTitle>
          <DialogDescription>
            Choisissez le format d'export et les filtres à appliquer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Filtres par statut RSVP */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Statut RSVP</Label>
            <p className="text-sm text-muted-foreground">
              Sélectionnez les statuts à inclure dans l'export
            </p>
            <div className="grid grid-cols-2 gap-3">
              {rsvpStatuses.map((status) => (
                <div
                  key={status.value}
                  className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`rsvp-${status.value}`}
                    checked={selectedRsvpStatuses.includes(status.value)}
                    onCheckedChange={() => handleRsvpStatusToggle(status.value)}
                  />
                  <Label
                    htmlFor={`rsvp-${status.value}`}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <RsvpBadge status={status.value} />
                    <span>{status.label}</span>
                  </Label>
                </div>
              ))}
            </div>
            {selectedRsvpStatuses.length === 0 && (
              <p className="text-xs text-muted-foreground italic">
                Aucun filtre sélectionné : tous les statuts seront exportés
              </p>
            )}
          </div>

          <Separator />

          {/* Filtre Check-in */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Check-in</Label>
            <p className="text-sm text-muted-foreground">
              Filtrer par statut de check-in
            </p>
            <RadioGroup
              value={
                checkedInFilter === undefined
                  ? 'all'
                  : checkedInFilter === true
                  ? 'yes'
                  : 'no'
              }
              onValueChange={(value) => {
                if (value === 'all') {
                  setCheckedInFilter(undefined);
                } else if (value === 'yes') {
                  setCheckedInFilter(true);
                } else {
                  setCheckedInFilter(false);
                }
              }}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="checked-in-all" />
                <Label htmlFor="checked-in-all" className="cursor-pointer">
                  Tous
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="checked-in-yes" />
                <Label htmlFor="checked-in-yes" className="cursor-pointer">
                  Check-in effectué
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="checked-in-no" />
                <Label htmlFor="checked-in-no" className="cursor-pointer">
                  Non check-in
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Filtre Invitation envoyée */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Invitation envoyée</Label>
            <p className="text-sm text-muted-foreground">
              Filtrer par statut d'envoi d'invitation
            </p>
            <RadioGroup
              value={
                invitationSentFilter === undefined
                  ? 'all'
                  : invitationSentFilter === true
                  ? 'sent'
                  : 'not_sent'
              }
              onValueChange={(value) => {
                if (value === 'all') {
                  setInvitationSentFilter(undefined);
                } else if (value === 'sent') {
                  setInvitationSentFilter(true);
                } else {
                  setInvitationSentFilter(false);
                }
              }}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="invitation-all" />
                <Label htmlFor="invitation-all" className="cursor-pointer">
                  Tous
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sent" id="invitation-sent" />
                <Label htmlFor="invitation-sent" className="cursor-pointer">
                  Invitation envoyée
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_sent" id="invitation-not-sent" />
                <Label htmlFor="invitation-not-sent" className="cursor-pointer">
                  Invitation non envoyée
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Formats d'export */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Format d'export</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => handleExport('csv')}
                disabled={isExporting}
              >
                <FileText className="h-6 w-6" />
                <span>CSV</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => handleExport('xlsx')}
                disabled={isExporting}
              >
                <FileSpreadsheet className="h-6 w-6" />
                <span>Excel</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                <File className="h-6 w-6" />
                <span>PDF</span>
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={isExporting}>
            Réinitialiser les filtres
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

