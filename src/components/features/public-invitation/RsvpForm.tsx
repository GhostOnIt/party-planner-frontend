import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, X, HelpCircle, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { RsvpResponseFormData, RsvpStatus } from '@/types';

const rsvpFormSchema = z.object({
  response: z.enum(['accepted', 'declined', 'maybe']),
  plus_one_attending: z.boolean().optional(),
  plus_one_name: z.string().optional(),
  dietary_restrictions: z.string().optional(),
  message: z.string().optional(),
});

interface RsvpFormProps {
  guestName: string;
  currentStatus: RsvpStatus;
  hasPlusOne: boolean;
  currentPlusOneName: string | null;
  currentDietaryRestrictions: string | null;
  onSubmit: (data: RsvpResponseFormData) => void;
  isSubmitting?: boolean;
}

const responseOptions = [
  {
    value: 'accepted' as const,
    label: 'Je participe',
    icon: Check,
    className: 'border-green-200 bg-green-50 hover:bg-green-100 data-[selected=true]:border-green-500 data-[selected=true]:bg-green-100',
    iconClass: 'text-green-600',
  },
  {
    value: 'declined' as const,
    label: 'Je ne peux pas',
    icon: X,
    className: 'border-red-200 bg-red-50 hover:bg-red-100 data-[selected=true]:border-red-500 data-[selected=true]:bg-red-100',
    iconClass: 'text-red-600',
  },
  {
    value: 'maybe' as const,
    label: 'Peut-etre',
    icon: HelpCircle,
    className: 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100 data-[selected=true]:border-yellow-500 data-[selected=true]:bg-yellow-100',
    iconClass: 'text-yellow-600',
  },
];

export function RsvpForm({
  guestName,
  currentStatus,
  hasPlusOne = false,
  currentPlusOneName,
  currentDietaryRestrictions,
  onSubmit,
  isSubmitting = false,
}: RsvpFormProps) {
  const [showPlusOne, setShowPlusOne] = useState(Boolean(hasPlusOne) && currentStatus === 'accepted');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RsvpResponseFormData>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      response: currentStatus !== 'pending' ? currentStatus : undefined,
      plus_one_attending: hasPlusOne,
      plus_one_name: currentPlusOneName || '',
      dietary_restrictions: currentDietaryRestrictions || '',
      message: '',
    },
  });

  const selectedResponse = watch('response');

  const handleResponseSelect = (value: 'accepted' | 'declined' | 'maybe') => {
    setValue('response', value);
    if (value !== 'accepted') {
      setShowPlusOne(false);
      setValue('plus_one_attending', false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre reponse</CardTitle>
        <CardDescription>
          Bonjour {guestName}, confirmez votre presence a cet evenement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Response Selection */}
          <div className="space-y-3">
            <Label>Votre reponse *</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {responseOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedResponse === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleResponseSelect(option.value)}
                    data-selected={isSelected}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                      option.className
                    )}
                  >
                    <Icon className={cn('h-8 w-8', option.iconClass)} />
                    <span className="font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.response && (
              <p className="text-sm text-destructive">Veuillez selectionner une reponse</p>
            )}
          </div>

          {/* Plus One Section (only if hasPlusOne is true) */}
          {hasPlusOne && (
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="plus_one_attending">Accompagnateur</Label>
                </div>
                {selectedResponse === 'accepted' ? (
                  <Switch
                    id="plus_one_attending"
                    checked={showPlusOne}
                    onCheckedChange={(checked) => {
                      setShowPlusOne(checked);
                      setValue('plus_one_attending', checked);
                    }}
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Disponible si vous acceptez
                  </span>
                )}
              </div>

              {selectedResponse === 'accepted' && showPlusOne && (
                <div className="space-y-2">
                  <Label htmlFor="plus_one_name">Nom de l'accompagnateur</Label>
                  <Input
                    id="plus_one_name"
                    placeholder="Prénom et nom"
                    {...register('plus_one_name')}
                  />
                </div>
              )}
              {selectedResponse !== 'accepted' && hasPlusOne && (
                <p className="text-sm text-muted-foreground">
                  Vous pourrez renseigner le nom de l'accompagnateur une fois que vous aurez accepté l'invitation.
                </p>
              )}
            </div>
          )}

          {/* Dietary Restrictions */}
          {selectedResponse === 'accepted' && (
            <div className="space-y-2">
              <Label htmlFor="dietary_restrictions">Restrictions alimentaires</Label>
              <Textarea
                id="dietary_restrictions"
                placeholder="Allergies, regime vegetarien, etc."
                rows={2}
                {...register('dietary_restrictions')}
              />
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (optionnel)</Label>
            <Textarea
              id="message"
              placeholder="Un petit mot pour les organisateurs..."
              rows={3}
              {...register('message')}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!selectedResponse || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Confirmer ma reponse'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
