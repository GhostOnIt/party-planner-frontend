import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAvailableRoles } from '@/hooks/useCollaborators';
import { getEffectiveRoleValues } from '@/utils/collaboratorPermissions';
import type { Collaborator, CollaboratorRole } from '@/types';

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborator: Collaborator | null;
  onConfirm: (collaboratorId: number, userId: number, roles: CollaboratorRole[]) => void;
  isSubmitting?: boolean;
  availableRoles?: CollaboratorRole[];
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  collaborator,
  onConfirm,
  isSubmitting = false,
  availableRoles = [],
}: ChangeRoleDialogProps) {
  const { data: systemRolesData } = useAvailableRoles();
  const systemRoles = systemRolesData?.roles || [];

  // Filter system roles based on what the current user can assign
  const filteredRoles =
    availableRoles.length > 0
      ? systemRoles.filter((role) => availableRoles.includes(role.value as CollaboratorRole))
      : systemRoles;

  const [selectedRoles, setSelectedRoles] = useState<CollaboratorRole[]>([]);

  useEffect(() => {
    if (collaborator) {
      // Get current roles, excluding owner role
      const currentRoles = getEffectiveRoleValues(collaborator).filter(
        (role) => role !== 'owner'
      ) as CollaboratorRole[];

      if (currentRoles.length > 0) {
        setSelectedRoles(currentRoles);
      } else if (filteredRoles.length > 0) {
        // Default to first available role if no current roles
        setSelectedRoles([filteredRoles[0].value as CollaboratorRole]);
      }
    } else if (filteredRoles.length > 0) {
      setSelectedRoles([filteredRoles[0].value as CollaboratorRole]);
    }
  }, [collaborator, filteredRoles]);

  const handleRoleToggle = (roleValue: CollaboratorRole, checked: boolean) => {
    if (checked) {
      setSelectedRoles((prev) => [...prev, roleValue]);
    } else {
      setSelectedRoles((prev) => prev.filter((role) => role !== roleValue));
    }
  };

  const handleConfirm = () => {
    if (collaborator && selectedRoles.length > 0) {
      onConfirm(collaborator.id, collaborator.user_id, selectedRoles);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le role</DialogTitle>
          <DialogDescription>
            Changer le role de {collaborator?.user.name} sur cet evenement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nouveaux rôles</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {filteredRoles.map((role) => (
                <div key={role.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`role-${role.value}`}
                    checked={selectedRoles.includes(role.value as CollaboratorRole)}
                    onChange={(e) =>
                      handleRoleToggle(role.value as CollaboratorRole, e.target.checked)
                    }
                    className="rounded border-gray-300"
                    disabled={role.value === 'owner'} // Owner role cannot be assigned
                  />
                  <label
                    htmlFor={`role-${role.value}`}
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    <div>
                      <p className="font-medium">{role.label}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            {selectedRoles.length === 0 && (
              <p className="text-sm text-destructive">Au moins un rôle doit être sélectionné</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting || selectedRoles.length === 0}>
            {isSubmitting ? 'Modification...' : 'Modifier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
