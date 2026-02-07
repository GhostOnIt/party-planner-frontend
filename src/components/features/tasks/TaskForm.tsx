import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Task, CreateTaskFormData, TaskPriority, BudgetCategory } from '@/types';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional(),
  assigned_to_user_id: z.number().optional(),
  estimated_cost: z.number().min(0, 'Le coût doit être positif').optional().nullable(),
  budget_category: z.enum(['location', 'catering', 'decoration', 'entertainment', 'photography', 'transportation', 'other']).optional().nullable(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const priorities: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
];

const budgetCategories: { value: BudgetCategory; label: string }[] = [
  { value: 'location', label: 'Lieu' },
  { value: 'catering', label: 'Traiteur' },
  { value: 'decoration', label: 'Décoration' },
  { value: 'entertainment', label: 'Animation' },
  { value: 'photography', label: 'Photographie' },
  { value: 'transportation', label: 'Transport' },
  { value: 'other', label: 'Autre' },
];

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onSubmit: (data: CreateTaskFormData) => void;
  isSubmitting?: boolean;
  collaborators?: { id: number; name: string }[];
  canAssign?: boolean;
  currentUserId?: number;
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  onSubmit,
  isSubmitting = false,
  collaborators = [],
  canAssign = false,
  currentUserId,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      assigned_to_user_id: undefined,
      estimated_cost: undefined,
      budget_category: undefined,
    },
  });

  const priority = watch('priority');
  const assignedTo = watch('assigned_to_user_id');
  const budgetCategory = watch('budget_category');

  // Reset form when dialog opens or task changes
  useEffect(() => {
    if (open) {
      if (task) {
        reset({
          title: task.title,
          description: task.description || '',
          priority: task.priority,
          due_date: task.due_date?.split('T')[0] || '',
          assigned_to_user_id: task.assigned_to || undefined,
          estimated_cost: task.estimated_cost || undefined,
          budget_category: task.budget_category || undefined,
        });
      } else {
        reset({
          title: '',
          description: '',
          priority: 'medium',
          due_date: '',
          assigned_to_user_id: undefined,
          estimated_cost: undefined,
          budget_category: undefined,
        });
      }
    }
  }, [open, task, reset]);

  const handleFormSubmit = (data: TaskFormValues) => {
    onSubmit({
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      due_date: data.due_date || undefined,
      assigned_to_user_id: data.assigned_to_user_id,
      estimated_cost: data.estimated_cost || undefined,
      budget_category: data.budget_category || undefined,
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? 'Modifier la tache' : 'Nouvelle tache'}</DialogTitle>
          <DialogDescription>
            {task
              ? 'Modifiez les informations de la tache'
              : 'Creez une nouvelle tache pour cet evenement'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Titre de la tache"
              {...register('title')}
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description de la tache..."
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="priority">Priorite *</Label>
              <Select
                value={priority}
                onValueChange={(value) => setValue('priority', value as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Date d'echeance</Label>
              <Input id="due_date" type="date" {...register('due_date')} />
            </div>
          </div>

          {canAssign && collaborators.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigne a</Label>
              <Select
                value={assignedTo?.toString() || 'unassigned'}
                onValueChange={(value) =>
                  setValue(
                    'assigned_to_user_id',
                    value === 'unassigned' ? undefined : Number(value)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Non assigne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Non assigne</SelectItem>
                  {collaborators.map((c) => {
                    const isCurrentUser = currentUserId && c.id === currentUserId;
                    return (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {isCurrentUser ? `Moi (${c.name})` : c.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Budget (optionnel)</p>
            <p className="text-xs text-muted-foreground mb-4">
              Si cette tâche génère une dépense, renseignez le coût estimé. Une ligne de dépense sera créée automatiquement.
            </p>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="estimated_cost">Coût estimé (XAF)</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  {...register('estimated_cost', { valueAsNumber: true })}
                  aria-invalid={!!errors.estimated_cost}
                />
                {errors.estimated_cost && (
                  <p className="text-sm text-destructive">{errors.estimated_cost.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_category">Catégorie</Label>
                <Select
                  value={budgetCategory || 'none'}
                  onValueChange={(value) =>
                    setValue('budget_category', value === 'none' ? undefined : (value as BudgetCategory))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    {budgetCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? task
                  ? 'Modification...'
                  : 'Creation...'
                : task
                  ? 'Modifier'
                  : 'Creer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
