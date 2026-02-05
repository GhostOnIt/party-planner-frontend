import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useAvailableRoles } from '@/hooks/useCollaborators';
import type { CustomRole, InviteCollaboratorFormData } from '@/types';

type InviteFormValues = {
  email: string;
  roles?: string[];
  custom_role_ids?: number[];
};

interface InviteCollaboratorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InviteCollaboratorFormData) => void;
  isSubmitting?: boolean;
  availableRoles?: string[];
  customRoles?: CustomRole[];
}

export function InviteCollaboratorForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  availableRoles = [],
  customRoles = [],
}: InviteCollaboratorFormProps) {
  // Fetch available roles from API
  const { data: rolesData, isLoading: isLoadingRoles } = useAvailableRoles();
  const availableRoleDefinitions = rolesData?.roles || [];

  // Filter and deduplicate system roles by value (API may have returned duplicates)
  const systemRolesRaw =
    availableRoles.length > 0
      ? availableRoleDefinitions.filter((role) => availableRoles.includes(role.value as string))
      : availableRoleDefinitions.filter((r) => r.is_system !== false);
  const seenValues = new Set<string>();
  const filteredRoles = systemRolesRaw.filter((role) => {
    if (seenValues.has(role.value)) return false;
    seenValues.add(role.value);
    return true;
  });

  // Create schema for invitation form
  const inviteSchema = z
    .object({
      email: z.string().email('Email invalide'),
      roles: z.array(z.string()).optional(),
      custom_role_ids: z.array(z.number()).optional(),
    })
    .superRefine((data, ctx) => {
      const rolesCount = (data.roles || []).length;
      const customCount = (data.custom_role_ids || []).length;
      if (rolesCount === 0 && customCount === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Sélectionnez au moins un rôle (système ou personnalisé)',
          path: ['roles'],
        });
      }
    });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      roles: [],
      custom_role_ids: [],
    },
  });

  const selectedRoles = watch('roles');
  const selectedCustomRoleIds = watch('custom_role_ids') || [];

  const handleFormSubmit = (data: InviteFormValues) => {
    onSubmit({
      email: data.email,
      roles:
        (data.roles || []).length > 0
          ? data.roles || []
          : selectedCustomRoleIds.length > 0
            ? ['viewer']
            : [],
      custom_role_ids: selectedCustomRoleIds,
    });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (isLoadingRoles) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Inviter un collaborateur</DialogTitle>
          <DialogDescription>
            Envoyez une invitation par email pour collaborer sur cet evenement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="collaborateur@email.com"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Rôles *</Label>
            <div className="space-y-3 max-h-56 overflow-y-auto border rounded-md p-3">
              {/* 1. Rôles système */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-1">
                  Rôles système
                </p>
                {filteredRoles.map((role) => (
                  <div key={role.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`role-${role.value}`}
                      checked={selectedRoles?.includes(role.value) || false}
                      onChange={(e) => {
                        const currentRoles = selectedRoles || [];
                        if (e.target.checked) {
                          setValue('roles', [...currentRoles, role.value]);
                        } else {
                          setValue(
                            'roles',
                            currentRoles.filter((r) => r !== role.value)
                          );
                        }
                      }}
                      className="rounded border-gray-300"
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

              {/* 2. Séparateur puis rôles personnalisés */}
              {customRoles.filter((r) => !r.is_system).length > 0 && (
                <>
                  <div className="border-t my-2" />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-1">
                      Rôles personnalisés
                    </p>
                    {customRoles
                      .filter((r) => !r.is_system)
                      .map((role) => (
                        <div key={role.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`custom-role-${role.id}`}
                            checked={selectedCustomRoleIds.includes(role.id)}
                            onChange={() => {
                              const isChecked = selectedCustomRoleIds.includes(role.id);
                              const next = isChecked
                                ? selectedCustomRoleIds.filter((id) => id !== role.id)
                                : [...selectedCustomRoleIds, role.id];
                              setValue('custom_role_ids', next);
                            }}
                            className="rounded border-gray-300"
                          />
                          <label
                            htmlFor={`custom-role-${role.id}`}
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
                  </div>
                </>
              )}
            </div>
            {errors.roles && <p className="text-sm text-destructive">{errors.roles.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi...' : "Envoyer l'invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
