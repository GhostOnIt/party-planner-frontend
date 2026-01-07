import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getValidationErrors } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Guest, CreateGuestFormData } from '@/types';

const guestFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional(),
  plus_one: z.boolean().optional(),
  plus_one_name: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  notes: z.string().optional(),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

interface GuestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guest?: Guest;
  onSubmit: (data: CreateGuestFormData) => void;
  isSubmitting?: boolean;
  submitError?: unknown;
}

export function GuestForm({
  open,
  onOpenChange,
  guest,
  onSubmit,
  isSubmitting = false,
  submitError,
}: GuestFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      name: guest?.name || '',
      email: guest?.email || '',
      phone: guest?.phone || '',
      plus_one: guest?.plus_one ?? true, // Par défaut coché lors de la création
      plus_one_name: guest?.plus_one_name || '',
      dietary_restrictions: guest?.dietary_restrictions || '',
      notes: guest?.notes || '',
    },
  });

  // Handle backend validation errors
  useEffect(() => {
    if (submitError && open) {
      const validationErrors = getValidationErrors(submitError);
      if (validationErrors) {
        Object.keys(validationErrors).forEach((field) => {
          const fieldName = field as keyof GuestFormValues;
          const errorMessage = validationErrors[field]?.[0];
          if (errorMessage) {
            setError(fieldName, {
              type: 'server',
              message: errorMessage,
            });
          }
        });
      }
    }
  }, [submitError, open, setError]);

  const plusOne = watch('plus_one');

  // Reset form when guest changes or modal opens
  useEffect(() => {
    if (open) {
      reset({
        name: guest?.name || '',
        email: guest?.email || '',
        phone: guest?.phone || '',
        plus_one: guest?.plus_one ?? true, // Par défaut coché lors de la création
        plus_one_name: guest?.plus_one_name || '',
        dietary_restrictions: guest?.dietary_restrictions || '',
        notes: guest?.notes || '',
      });
    }
  }, [guest, open, reset]);

  const handleFormSubmit = (data: GuestFormValues) => {
    onSubmit({
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      plus_one: data.plus_one,
      plus_one_name: data.plus_one && data.plus_one_name ? data.plus_one_name : undefined,
      dietary_restrictions: data.dietary_restrictions || undefined,
      notes: data.notes || undefined,
    });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{guest ? "Modifier l'invite" : 'Ajouter un invite'}</DialogTitle>
          <DialogDescription>
            {guest
              ? "Modifiez les informations de l'invite"
              : 'Remplissez les informations pour ajouter un nouvel invite'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              placeholder="Nom de l'invite"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telephone</Label>
              <Input
                id="phone"
                placeholder="+237 6XX XXX XXX"
                {...register('phone')}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="plus_one"
                checked={plusOne}
                onCheckedChange={(checked) => setValue('plus_one', checked as boolean)}
              />
              <Label htmlFor="plus_one" className="font-normal">
                Accompagnant (+1)
              </Label>
            </div>
            {plusOne && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="plus_one_name">Nom de l'accompagnant</Label>
                <Input
                  id="plus_one_name"
                  placeholder="Nom de l'accompagnant"
                  {...register('plus_one_name')}
                />
                {!guest && (
                  <p className="text-xs text-muted-foreground">
                    Vous pouvez laisser ce champ vide. L'invité pourra le renseigner lors de sa
                    réponse à l'invitation.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietary_restrictions">Restrictions alimentaires</Label>
            <Input
              id="dietary_restrictions"
              placeholder="Ex: Vegetarien, sans gluten..."
              {...register('dietary_restrictions')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes supplementaires..."
              rows={3}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? guest
                  ? 'Modification...'
                  : 'Ajout...'
                : guest
                  ? 'Modifier'
                  : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
