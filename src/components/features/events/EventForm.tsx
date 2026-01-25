import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { CalendarIcon, Image, X, Sparkles, ListTodo, Wallet, Palette } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PhotoUploader } from '@/components/features/photos';
import { useTemplatesByType } from '@/hooks/useTemplates';
import { useEventTypes } from '@/hooks/useSettings';
import type { Event, CreateEventFormData, EventType } from '@/types';

// Default event types (fallback if user types are not loaded)
const defaultEventTypes: { value: EventType; label: string }[] = [
  { value: 'mariage', label: 'Mariage' },
  { value: 'anniversaire', label: 'Anniversaire' },
  { value: 'baby_shower', label: 'Baby Shower' },
  { value: 'soiree', label: 'Soiree' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'autre', label: 'Autre' },
];

const eventFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(255),
  type: z.string().min(1, 'Le type est requis'), // Accept any string for custom types
  date: z.string().min(1, 'La date est requise'),
  time: z.string().min(1, "L'heure est requise"),
  location: z.string().min(1, 'Le lieu est requis'),
  description: z.string().optional(),
  expected_guests: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === '' || val === undefined || val === null) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }),
  budget: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === '' || val === undefined || val === null) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }),
  theme: z.string().optional(),
  template_id: z.number().optional(),
});

type EventFormValues = z.input<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event;
  onSubmit: (data: CreateEventFormData & { template_id?: number; cover_photo?: File }) => void;
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
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [showPhotoUploader, setShowPhotoUploader] = useState(false);

  // Load user's custom event types
  const { data: userEventTypes } = useEventTypes();
  
  // Use user's event types if available, otherwise fallback to default
  const eventTypes = userEventTypes && userEventTypes.length > 0
    ? userEventTypes.map((type) => ({
        value: type.slug as EventType,
        label: type.name,
      }))
    : defaultEventTypes;

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
      type: event?.type || (eventTypes[0]?.value || 'autre'),
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
  const selectedTemplateId = watch('template_id');
  
  // Charger les templates selon le type d'événement sélectionné
  const { data: templatesData } = useTemplatesByType(selectedType as EventType | undefined);
  const templates = templatesData?.templates || [];
  
  // Charger le template sélectionné pour l'aperçu
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Nettoyer les URLs de preview lors du démontage
  useEffect(() => {
    return () => {
      if (coverPhotoPreview) {
        URL.revokeObjectURL(coverPhotoPreview);
      }
    };
  }, [coverPhotoPreview]);

  const handlePhotoUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0]; // Prendre seulement la première photo
      setCoverPhoto(file);
      setCoverPhotoPreview(URL.createObjectURL(file));
      setShowPhotoUploader(false);
    }
  };

  const handleRemovePhoto = () => {
    if (coverPhotoPreview) {
      URL.revokeObjectURL(coverPhotoPreview);
    }
    setCoverPhoto(null);
    setCoverPhotoPreview(null);
  };

  const handleFormSubmit = (data: EventFormValues) => {
    // Transformer les données selon le schéma
    const transformed = eventFormSchema.parse(data);

    onSubmit({
      title: transformed.title,
      type: transformed.type as EventType,
      date: transformed.date,
      time: transformed.time,
      location: transformed.location,
      description: transformed.description || undefined,
      expected_guests: transformed.expected_guests,
      budget: transformed.budget,
      theme: transformed.theme || undefined,
      template_id: transformed.template_id,
      cover_photo: coverPhoto || undefined,
    });
  };

  // Réinitialiser le template si le type change
  useEffect(() => {
    if (selectedType) {
      // Réinitialiser template_id si le type change
      setValue('template_id', undefined);
    }
  }, [selectedType, setValue]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Titre de l'evenement *</Label>
        <Input
          id="title"
          placeholder="Ex: Mariage de Sophie et Thomas"
          {...register('title')}
          aria-invalid={!!errors.title}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label>Type d'evenement *</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => setValue('type', value as EventType)}
        >
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
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      {/* Template Selection */}
      {selectedType && templates.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="template">Template (optionnel)</Label>
          <Select
            value={selectedTemplateId?.toString() || 'none'}
            onValueChange={(value) => {
              if (value === 'none') {
                setValue('template_id', undefined);
              } else {
                setValue('template_id', parseInt(value));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Aucun template (création manuelle)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun template</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id.toString()}>
                  {template.name}
                  {template.description && (
                    <span className="text-xs text-muted-foreground ml-2">
                      - {template.description}
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTemplate && (
            <Card className="mt-2 border-[#4F46E5]/20 bg-gradient-to-br from-[#4F46E5]/5 to-transparent">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#4F46E5]" />
                  <span className="text-sm font-semibold text-[#1a1a2e]">
                    Aperçu du template: {selectedTemplate.name}
                  </span>
                </div>
                {selectedTemplate.description && (
                  <p className="text-sm text-[#6b7280]">{selectedTemplate.description}</p>
                )}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#e5e7eb]">
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-[#6b7280]" />
                    <div>
                      <p className="text-xs text-[#6b7280]">Tâches</p>
                      <p className="text-sm font-semibold text-[#1a1a2e]">
                        {selectedTemplate.default_tasks?.length || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[#6b7280]" />
                    <div>
                      <p className="text-xs text-[#6b7280]">Budget</p>
                      <p className="text-sm font-semibold text-[#1a1a2e]">
                        {selectedTemplate.default_budget_categories?.length || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-[#6b7280]" />
                    <div>
                      <p className="text-xs text-[#6b7280]">Thèmes</p>
                      <p className="text-sm font-semibold text-[#1a1a2e]">
                        {selectedTemplate.suggested_themes?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedTemplate.suggested_themes && selectedTemplate.suggested_themes.length > 0 && (
                  <div className="pt-2 border-t border-[#e5e7eb]">
                    <p className="text-xs text-[#6b7280] mb-2">Thèmes suggérés:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.suggested_themes.map((theme, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

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
                onSelect={(date) => setValue('date', date ? format(date, 'yyyy-MM-dd') : '')}
                initialFocus
                disabled={(date) => {
                  // Désactiver les dates passées (avant aujourd'hui)
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Heure *</Label>
          <Input id="time" type="time" {...register('time')} aria-invalid={!!errors.time} required />
          {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Lieu *</Label>
        <Input id="location" placeholder="Ex: Salle des fetes de Paris" {...register('location')} aria-invalid={!!errors.location} required />
        {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
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

      {/* Photo de couverture */}
      <div className="space-y-2">
        <Label>Photo de couverture (optionnel)</Label>
        {coverPhotoPreview ? (
          <div className="relative group">
            <div className="relative w-full max-h-96 overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
              <img
                src={coverPhotoPreview}
                alt="Aperçu de la photo de couverture"
                className="max-h-96 w-auto h-auto object-contain"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{coverPhoto?.name}</p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPhotoUploader(true)}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Image className="h-4 w-4" />
              Ajouter une photo de couverture
            </Button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Cette photo sera utilisée comme image principale de votre événement
        </p>
      </div>

      {/* Photo Uploader Modal */}
      <PhotoUploader
        open={showPhotoUploader}
        onOpenChange={setShowPhotoUploader}
        onUpload={handlePhotoUpload}
        maxFiles={1}
        isUploading={false}
      />

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
              : "Creer l'evenement"}
        </Button>
      </div>
    </form>
  );
}
