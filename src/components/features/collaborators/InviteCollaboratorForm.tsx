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
import type { InviteCollaboratorFormData, CollaboratorRole } from '@/types';

const inviteSchema = z.object({
  email: z.string().email('Email invalide'),
  role: z.enum(['editor', 'viewer'] as const),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteCollaboratorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InviteCollaboratorFormData) => void;
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

export function InviteCollaboratorForm({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: InviteCollaboratorFormProps) {
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
      role: 'editor',
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
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue('role', value as 'editor' | 'viewer')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectionnez un role" />
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
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi...' : 'Envoyer l\'invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
