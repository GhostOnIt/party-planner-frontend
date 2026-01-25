import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { categoryConfig } from './CategoryBadge';
import { useBudgetCategories } from '@/hooks/useSettings';
import type { BudgetItem, CreateBudgetItemFormData, BudgetCategory } from '@/types';

// Default categories (fallback if user categories are not loaded)
const defaultCategories: { value: BudgetCategory; label: string }[] = [
  { value: 'location', label: categoryConfig.location.label },
  { value: 'catering', label: categoryConfig.catering.label },
  { value: 'decoration', label: categoryConfig.decoration.label },
  { value: 'entertainment', label: categoryConfig.entertainment.label },
  { value: 'photography', label: categoryConfig.photography.label },
  { value: 'transportation', label: categoryConfig.transportation.label },
  { value: 'other', label: categoryConfig.other.label },
];

const budgetItemSchema = z.object({
  category: z.string().min(1, 'La catégorie est requise'), // Accept any string for custom categories
  name: z.string().min(1, 'Le nom est requis').max(255),
  estimated_cost: z.number().min(0, 'Le cout doit etre positif'),
  actual_cost: z.number().min(0, 'Le cout doit etre positif').optional(),
  vendor_name: z.string().optional(),
  notes: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetItemSchema>;

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: BudgetItem;
  onSubmit: (data: CreateBudgetItemFormData) => void;
  isSubmitting?: boolean;
}

export function BudgetForm({
  open,
  onOpenChange,
  item,
  onSubmit,
  isSubmitting = false,
}: BudgetFormProps) {
  const isEditing = !!item;
  
  // Load user's custom budget categories
  const { data: userBudgetCategories } = useBudgetCategories();
  
  // Use user's categories if available, otherwise fallback to default
  const categories = userBudgetCategories && userBudgetCategories.length > 0
    ? userBudgetCategories.map((cat) => ({
        value: cat.slug as BudgetCategory,
        label: cat.name,
      }))
    : defaultCategories;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      category: (categories[0]?.value || 'other') as string,
      name: '',
      estimated_cost: 0,
      actual_cost: undefined,
      vendor_name: '',
      notes: '',
    },
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    if (open) {
      if (item) {
        reset({
          category: item.category,
          name: item.name,
          estimated_cost: item.estimated_cost,
          actual_cost: item.actual_cost ?? undefined,
          vendor_name: item.vendor_name ?? '',
          notes: item.notes ?? '',
        });
      } else {
        reset({
          category: (categories[0]?.value || 'other') as string,
          name: '',
          estimated_cost: 0,
          actual_cost: undefined,
          vendor_name: '',
          notes: '',
        });
      }
    }
  }, [open, item, reset, categories]);

  const handleFormSubmit = (data: BudgetFormValues) => {
    onSubmit({
      category: data.category as BudgetCategory,
      name: data.name,
      estimated_cost: data.estimated_cost,
      actual_cost: data.actual_cost,
      vendor_name: data.vendor_name || undefined,
      notes: data.notes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier la depense' : 'Ajouter une depense'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de la depense'
              : 'Ajoutez une nouvelle depense au budget'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categorie *</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue('category', value as BudgetCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectionnez une categorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              placeholder="Ex: Location de salle"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="estimated_cost">Cout estime (XAF) *</Label>
              <Input
                id="estimated_cost"
                type="number"
                min="0"
                placeholder="0"
                {...register('estimated_cost', { valueAsNumber: true })}
                aria-invalid={!!errors.estimated_cost}
              />
              {errors.estimated_cost && (
                <p className="text-sm text-destructive">
                  {errors.estimated_cost.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_cost">Cout reel (XAF)</Label>
              <Input
                id="actual_cost"
                type="number"
                min="0"
                placeholder="0"
                {...register('actual_cost', { valueAsNumber: true })}
                aria-invalid={!!errors.actual_cost}
              />
              {errors.actual_cost && (
                <p className="text-sm text-destructive">
                  {errors.actual_cost.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor_name">Fournisseur</Label>
            <Input
              id="vendor_name"
              placeholder="Ex: Traiteur Delice"
              {...register('vendor_name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes additionnelles..."
              rows={3}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Enregistrement...'
                : isEditing
                  ? 'Modifier'
                  : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
