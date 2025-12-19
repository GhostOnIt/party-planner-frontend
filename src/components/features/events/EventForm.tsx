import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Event, CreateEventFormData, EventType } from '@/types';

const eventTypes: { value: EventType; label: string }[] = [
  { value: 'mariage', label: 'Mariage' },
  { value: 'anniversaire', label: 'Anniversaire' },
  { value: 'baby_shower', label: 'Baby Shower' },
  { value: 'soiree', label: 'Soiree' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'autre', label: 'Autre' },
];

const eventFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(255),
  type: z.enum(['mariage', 'anniversaire', 'baby_shower', 'soiree', 'brunch', 'autre']),
  date: z.string().min(1, 'La date est requise'),
  time: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  expected_guests: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === '' || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  budget: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === '' || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  theme: z.string().optional(),
  template_id: z.number().optional(),
});

type EventFormValues = z.input<typeof eventFormSchema>;
type EventFormOutput = z.output<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event;
  onSubmit: (data: CreateEventFormData & { template_id?: number }) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

// Helper to block 'e', 'E', '+', '-', '.' in number inputs
const blockInvalidNumberKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
    e.preventDefault();
  }
};

export function EventForm({ event, onSubmit, onCancel, isSubmitting = false }: EventFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: event?.title || '',
      type: event?.type || 'autre',
      date: event?.date || '',
      time: event?.time || '',
      location: event?.location || '',
      description: event?.description || '',
      expected_guests: event?.expected_guests || undefined,
      budget: event?.budget || undefined,
      theme: event?.theme || '',
    },
  });

  const selectedDate = watch('date');
  const selectedType = watch('type');

  const handleFormSubmit = (data: EventFormOutput) => {
    onSubmit({
      title: data.title,
      type: data.type,
      date: data.date,
      time: data.time || undefined,
      location: data.location || undefined,
      description: data.description || undefined,
      expected_guests: data.expected_guests,
      budget: data.budget,
      theme: data.theme || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Titre de l'evenement *</Label>
        <Input
          id="title"
          placeholder="Ex: Mariage de Sophie et Thomas"
          {...register('title')}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>Type d'evenement *</Label>
        <Select value={selectedType} onValueChange={(value) => setValue('type', value as EventType)}>
          <SelectTrigger>
            <SelectValue placeholder="Selectionnez un type" />
          </SelectTrigger>
          <SelectContent>
            {eventTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* Date and Time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate
                  ? format(new Date(selectedDate), 'PPP', { locale: fr })
                  : 'Selectionnez une date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={(date) =>
                  setValue('date', date ? format(date, 'yyyy-MM-dd') : '')
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Heure</Label>
          <Input
            id="time"
            type="time"
            {...register('time')}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Lieu</Label>
        <Input
          id="location"
          placeholder="Ex: Salle des fetes de Paris"
          {...register('location')}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Decrivez votre evenement..."
          rows={4}
          {...register('description')}
        />
      </div>

      {/* Expected guests and Budget */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="expected_guests">Nombre d'invites prevu</Label>
          <Input
            id="expected_guests"
            type="number"
            min="0"
            placeholder="Ex: 100"
            onKeyDown={blockInvalidNumberKeys}
            {...register('expected_guests')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget (FCFA)</Label>
          <Input
            id="budget"
            type="number"
            min="0"
            placeholder="Ex: 500000"
            onKeyDown={blockInvalidNumberKeys}
            {...register('budget')}
          />
        </div>
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Input
          id="theme"
          placeholder="Ex: Champetre, Boheme, Classique..."
          {...register('theme')}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? event
              ? 'Modification...'
              : 'Creation...'
            : event
            ? 'Modifier'
            : 'Creer l\'evenement'}
        </Button>
      </div>
    </form>
  );
}
