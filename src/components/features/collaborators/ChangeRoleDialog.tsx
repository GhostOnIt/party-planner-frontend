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
import type { Collaborator, CollaboratorRole } from '@/types';

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborator: Collaborator | null;
  onConfirm: (collaboratorId: number, userId: number, role: CollaboratorRole) => void;
  isSubmitting?: boolean;
}

const roles: { value: Exclude<CollaboratorRole, 'owner'>; label: string; description: string }[] = [
  {
    value: 'editor',
    label: 'Editeur',
    description: 'Peut modifier l\'evenement, les invites, les taches et le budget',
  },
  {
    value: 'viewer',
    label: 'Lecteur',
    description: 'Peut uniquement consulter l\'evenement',
  },
];

export function ChangeRoleDialog({
  open,
  onOpenChange,
  collaborator,
  onConfirm,
  isSubmitting = false,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<Exclude<CollaboratorRole, 'owner'>>('editor');

  useEffect(() => {
    if (collaborator && collaborator.role !== 'owner') {
      setSelectedRole(collaborator.role as Exclude<CollaboratorRole, 'owner'>);
    }
  }, [collaborator]);

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
              onValueChange={(value) => setSelectedRole(value as Exclude<CollaboratorRole, 'owner'>)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
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
