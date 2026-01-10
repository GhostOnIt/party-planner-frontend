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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAvailableRoles } from '@/hooks/useCollaborators';
import type { Collaborator, CollaboratorRole } from '@/types';

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborator: Collaborator | null;
  onConfirm: (collaboratorId: number, userId: number, role: CollaboratorRole) => void;
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

  const [selectedRole, setSelectedRole] = useState<CollaboratorRole>('coordinator');

  useEffect(() => {
    if (collaborator && collaborator.role !== 'owner') {
      setSelectedRole(collaborator.role);
    } else if (filteredRoles.length > 0) {
      setSelectedRole(filteredRoles[0].value as CollaboratorRole);
    }
  }, [collaborator, filteredRoles]);

  const handleConfirm = () => {
    if (collaborator) {
      onConfirm(collaborator.id, collaborator.user_id, selectedRole);
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
            <Label>Nouveau role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setSelectedRole(value as Exclude<CollaboratorRole, 'owner'>)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <p className="font-medium">{role.label}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Modification...' : 'Modifier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
