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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAvailableRoles } from '@/hooks/useCollaborators';
import type { InviteCollaboratorFormData } from '@/types';

type InviteFormValues = {
  email: string;
  role: string;
};

interface InviteCollaboratorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InviteCollaboratorFormData) => void;
  isSubmitting?: boolean;
  availableRoles?: string[];
}

export function InviteCollaboratorForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  availableRoles = [],
}: InviteCollaboratorFormProps) {
  // Fetch available roles from API
  const { data: rolesData, isLoading: isLoadingRoles } = useAvailableRoles();
  const availableRoleDefinitions = rolesData?.roles || [];

  // Filter roles based on availableRoles prop (if provided)
  const filteredRoles =
    availableRoles.length > 0
      ? availableRoleDefinitions.filter((role) => availableRoles.includes(role.value as string))
      : availableRoleDefinitions;

  // Create schema with available role values
  const roleValues = filteredRoles.map((role) => role.value);
  const inviteSchema = z.object({
    email: z.string().email('Email invalide'),
    role: roleValues.length > 0 ? z.enum(roleValues as [string, ...string[]]) : z.string(),
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
      role: filteredRoles[0]?.value || '',
    },
  });

  const selectedRole = watch('role');

  const handleFormSubmit = (data: InviteFormValues) => {
    onSubmit(data);
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
            <Label htmlFor="role">Role *</Label>
            <Select value={selectedRole} onValueChange={(value) => setValue('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selectionnez un role" />
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
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
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
