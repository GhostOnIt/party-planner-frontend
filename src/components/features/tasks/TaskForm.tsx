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
import type { Task, CreateTaskFormData, TaskPriority } from '@/types';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().optional(),
  assigned_to_user_id: z.number().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const priorities: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
];

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onSubmit: (data: CreateTaskFormData) => void;
  isSubmitting?: boolean;
  collaborators?: { id: number; name: string }[];
  canAssign?: boolean;
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  onSubmit,
  isSubmitting = false,
  collaborators = [],
  canAssign = false,
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
    },
  });

  const priority = watch('priority');
  const assignedTo = watch('assigned_to_user_id');

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
        });
      } else {
        reset({
          title: '',
          description: '',
          priority: 'medium',
          due_date: '',
          assigned_to_user_id: undefined,
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
                  {collaborators.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
