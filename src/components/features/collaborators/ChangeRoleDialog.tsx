import { useState, useEffect, useMemo } from 'react';
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
import { useCustomRoles } from '@/hooks/useCustomRoles';
import type { Collaborator, CollaboratorRole, CustomRole } from '@/types';
import {
  effectiveCollaboratorRoleCount,
  MAX_COLLABORATOR_ROLES,
} from '@/utils/collaboratorRoles';

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborator: Collaborator | null;
  eventId: string;
  onConfirm: (
    collaboratorId: string,
    userId: string,
    roles: CollaboratorRole[],
    customRoleIds: string[]
  ) => void;
  isSubmitting?: boolean;
  availableRoles?: CollaboratorRole[];
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  collaborator,
  eventId,
  onConfirm,
  isSubmitting = false,
  availableRoles = [],
}: ChangeRoleDialogProps) {
  const { data: systemRolesData } = useAvailableRoles();
  const systemRoles = systemRolesData?.roles || [];
  const { data: rolesData } = useCustomRoles(eventId);
  const customRoles: CustomRole[] = (rolesData?.roles || []).filter((r) => !r.is_system);

  // Filter system roles based on what the current user can assign
  // Memoize to avoid recreating on every render
  const filteredRoles = useMemo(
    () =>
      availableRoles.length > 0
        ? systemRoles.filter((role) => availableRoles.includes(role.value as CollaboratorRole))
        : systemRoles,
    [availableRoles, systemRoles]
  );

  const [selectedRoles, setSelectedRoles] = useState<CollaboratorRole[]>([]);
  const [selectedCustomRoleIds, setSelectedCustomRoleIds] = useState<string[]>([]);

  useEffect(() => {
    // Only update when dialog opens or collaborator changes
    if (!open) {
      return;
    }

    if (collaborator) {
      // Get current system roles, excluding owner role
      const currentRoles = (
        (collaborator.roles && collaborator.roles.length > 0
          ? collaborator.roles
          : collaborator.role
            ? [collaborator.role]
            : []) as CollaboratorRole[]
      ).filter((role) => role !== 'owner');

      // Set current custom role if any
      if (Array.isArray(collaborator.custom_role_ids)) {
        setSelectedCustomRoleIds(collaborator.custom_role_ids.map(String));
      } else if (collaborator.custom_roles && collaborator.custom_roles.length > 0) {
        setSelectedCustomRoleIds(collaborator.custom_roles.map((r) => r.id));
      } else if (collaborator.custom_role_id) {
        setSelectedCustomRoleIds([collaborator.custom_role_id]);
      } else {
        setSelectedCustomRoleIds([]);
      }

      if (currentRoles.length > 0) {
        setSelectedRoles(currentRoles);
      } else if (filteredRoles.length > 0) {
        // Default to first available role if no current roles
        setSelectedRoles([filteredRoles[0].value as CollaboratorRole]);
      }
    } else if (filteredRoles.length > 0) {
      setSelectedRoles([filteredRoles[0].value as CollaboratorRole]);
      setSelectedCustomRoleIds([]);
    }
  }, [open, collaborator, filteredRoles]);

  const handleCustomRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      const next = [...selectedCustomRoleIds, roleId];
      if (effectiveCollaboratorRoleCount(selectedRoles, next) > MAX_COLLABORATOR_ROLES) {
        return;
      }
      setSelectedCustomRoleIds(next);
    } else {
      setSelectedCustomRoleIds((prev) => prev.filter((id) => id !== roleId));
    }
  };

  const handleRoleToggle = (roleValue: CollaboratorRole, checked: boolean) => {
    if (checked) {
      const next = [...selectedRoles, roleValue];
      const uniqueNext = [...new Set(next)];
      if (effectiveCollaboratorRoleCount(uniqueNext, selectedCustomRoleIds) > MAX_COLLABORATOR_ROLES) {
        return;
      }
      setSelectedRoles(uniqueNext);
    } else {
      setSelectedRoles((prev) => prev.filter((role) => role !== roleValue));
    }
  };

  const handleConfirm = () => {
    if (collaborator) {
      onConfirm(
        collaborator.id,
        collaborator.user_id,
        selectedRoles.length > 0 ? selectedRoles : (['viewer'] as CollaboratorRole[]),
        selectedCustomRoleIds
      );
    }
  };

  const roleCount = effectiveCollaboratorRoleCount(selectedRoles, selectedCustomRoleIds);
  const hasNoSelection = selectedRoles.length === 0 && selectedCustomRoleIds.length === 0;
  const overLimit = roleCount > MAX_COLLABORATOR_ROLES;

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
            <p className="text-xs text-muted-foreground">
              Maximum {MAX_COLLABORATOR_ROLES} rôles au total (système et personnalisés).
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {/* Custom roles (if any) */}
            
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Rôles système
              </p>
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

                {customRoles.length > 0 && (
                <>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Rôles personnalisés
                  </p>

                  {customRoles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`change-custom-role-${role.id}`}
                        checked={selectedCustomRoleIds.includes(String(role.id))}
                        onChange={() => {
                          const rid = String(role.id);
                          const nextChecked = !selectedCustomRoleIds.includes(rid);
                          handleCustomRoleToggle(rid, nextChecked);
                        }}
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor={`change-custom-role-${role.id}`}
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        <div>
                          <p className="font-medium">{role.name}</p>
                          {role.description && (
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}

                  <div className="my-2 border-t" />
                </>
              )}

            </div>
            {hasNoSelection && (
              <p className="text-sm text-destructive">
                Sélectionnez au moins un rôle (système ou personnalisé)
              </p>
            )}
            {overLimit && (
              <p className="text-sm text-destructive">
                Un collaborateur ne peut avoir que {MAX_COLLABORATOR_ROLES} rôles au maximum. Retirez des
                rôles pour enregistrer.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || hasNoSelection || overLimit}
          >
            {isSubmitting ? 'Modification...' : 'Modifier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
