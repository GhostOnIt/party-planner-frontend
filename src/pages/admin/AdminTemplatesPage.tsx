import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  MoreHorizontal,
  FileText,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  ListTodo,
  Wallet,
  Palette,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useToggleTemplateActive,
} from '@/hooks/useAdmin';
import type { EventTemplate, EventType, TaskPriority, BudgetCategory, CreateTemplateFormData } from '@/types';

const eventTypeLabels: Record<EventType, string> = {
  mariage: 'Mariage',
  anniversaire: 'Anniversaire',
  baby_shower: 'Baby Shower',
  soiree: 'Soiree',
  brunch: 'Brunch',
  autre: 'Autre',
};

const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

const budgetCategoryLabels: Record<BudgetCategory, string> = {
  location: 'Lieu',
  catering: 'Traiteur',
  decoration: 'Decoration',
  entertainment: 'Animation',
  photography: 'Photo',
  transportation: 'Transport',
  other: 'Autre',
};

const templateFormSchema = z.object({
  event_type: z.enum(['mariage', 'anniversaire', 'baby_shower', 'soiree', 'brunch', 'autre']),
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  default_tasks: z.array(
    z.object({
      title: z.string().min(1, 'Le titre est requis'),
      description: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
    })
  ),
  default_budget_categories: z.array(
    z.object({
      name: z.string().min(1, 'Le nom est requis'),
      category: z.enum(['location', 'catering', 'decoration', 'entertainment', 'photography', 'transportation', 'other']),
      estimated_cost: z.number().optional(),
    })
  ),
  suggested_themes: z.array(z.string()),
  is_active: z.boolean(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

export function AdminTemplatesPage() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<EventTemplate | null>(null);
  const [deleteTemplate, setDeleteTemplate] = useState<EventTemplate | null>(null);
  const [newTheme, setNewTheme] = useState('');

  const { data: templates, isLoading } = useAdminTemplates();
  const { mutate: createTemplate, isPending: isCreating } = useCreateTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate();
  const { mutate: deleteTemplateMutation, isPending: isDeleting } = useDeleteTemplate();
  const { mutate: toggleActive } = useToggleTemplateActive();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      event_type: 'autre',
      name: '',
      description: '',
      default_tasks: [],
      default_budget_categories: [],
      suggested_themes: [],
      is_active: true,
    },
  });

  const {
    fields: taskFields,
    append: appendTask,
    remove: removeTask,
  } = useFieldArray({
    control: form.control,
    name: 'default_tasks',
  });

  const {
    fields: budgetFields,
    append: appendBudget,
    remove: removeBudget,
  } = useFieldArray({
    control: form.control,
    name: 'default_budget_categories',
  });

  const themes = form.watch('suggested_themes') || [];

  const openCreateForm = () => {
    form.reset({
      event_type: 'autre',
      name: '',
      description: '',
      default_tasks: [],
      default_budget_categories: [],
      suggested_themes: [],
      is_active: true,
    });
    setEditTemplate(null);
    setFormOpen(true);
  };

  const openEditForm = (template: EventTemplate) => {
    form.reset({
      event_type: template.event_type,
      name: template.name,
      description: template.description || '',
      default_tasks: template.default_tasks || [],
      default_budget_categories: template.default_budget_categories || [],
      suggested_themes: template.suggested_themes || [],
      is_active: template.is_active,
    });
    setEditTemplate(template);
    setFormOpen(true);
  };

  const handleSubmit = (data: TemplateFormValues) => {
    // Clean up budget categories - convert NaN estimated_cost to undefined
    const cleanedBudgetCategories = data.default_budget_categories.map(item => ({
      ...item,
      estimated_cost: item.estimated_cost && !Number.isNaN(item.estimated_cost) ? item.estimated_cost : undefined,
    }));

    const formData: CreateTemplateFormData = {
      ...data,
      description: data.description || undefined,
      default_budget_categories: cleanedBudgetCategories,
    };

    if (editTemplate) {
      updateTemplate(
        { templateId: editTemplate.id, data: formData },
        {
          onSuccess: () => {
            toast({ title: 'Template mis a jour' });
            setFormOpen(false);
          },
          onError: (error: any) => {
            toast({
              title: 'Erreur',
              description: error?.response?.data?.message || 'Impossible de mettre a jour le template.',
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      createTemplate(formData, {
        onSuccess: () => {
          toast({ title: 'Template cree' });
          setFormOpen(false);
        },
        onError: (error: any) => {
          toast({
            title: 'Erreur',
            description: error?.response?.data?.message || 'Impossible de creer le template.',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTemplate) return;

    deleteTemplateMutation(deleteTemplate.id, {
      onSuccess: () => {
        toast({ title: 'Template supprime' });
        setDeleteTemplate(null);
      },
      onError: (error: any) => {
        toast({
          title: 'Erreur',
          description: error?.response?.data?.message || 'Impossible de supprimer le template.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleToggleActive = (template: EventTemplate) => {
    toggleActive(
      { templateId: template.id, isActive: !template.is_active },
      {
        onSuccess: () => {
          toast({
            title: template.is_active ? 'Template desactive' : 'Template active',
          });
        },
      }
    );
  };

  const addTheme = () => {
    if (newTheme.trim() && !themes.includes(newTheme.trim())) {
      form.setValue('suggested_themes', [...themes, newTheme.trim()]);
      setNewTheme('');
    }
  };

  const removeTheme = (index: number) => {
    form.setValue(
      'suggested_themes',
      themes.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Modeles d'evenements preconfigures"
        actions={
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau template
          </Button>
        }
      />

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des templates</CardTitle>
          <CardDescription>
            {templates?.length || 0} template(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : templates?.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Aucun template</p>
              <Button className="mt-4" onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                Creer un template
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Taches</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Themes</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates?.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          {template.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {eventTypeLabels[template.event_type] || template.event_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ListTodo className="h-4 w-4 text-muted-foreground" />
                          <span>{template.default_tasks?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                          <span>{template.default_budget_categories?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Palette className="h-4 w-4 text-muted-foreground" />
                          <span>{template.suggested_themes?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {template.is_active ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3 w-3" />
                            Inactif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditForm(template)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(template)}>
                              {template.is_active ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Desactiver
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteTemplate(template)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTemplate ? 'Modifier le template' : 'Nouveau template'}</DialogTitle>
            <DialogDescription>
              {editTemplate
                ? 'Modifiez les informations du template'
                : 'Creez un nouveau modele d\'evenement'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom *</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_type">Type d'evenement *</Label>
                <Select
                  value={form.watch('event_type')}
                  onValueChange={(v) => form.setValue('event_type', v as EventType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(eventTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register('description')} rows={2} />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={form.watch('is_active')}
                onCheckedChange={(checked) => form.setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Template actif</Label>
            </div>

            <Accordion type="multiple" className="w-full">
              {/* Tasks */}
              <AccordionItem value="tasks">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4" />
                    Taches par defaut ({taskFields.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {taskFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 rounded-lg border p-3">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Titre de la tache"
                            {...form.register(`default_tasks.${index}.title`)}
                          />
                          <div className="flex gap-2">
                            <Input
                              placeholder="Description (optionnel)"
                              {...form.register(`default_tasks.${index}.description`)}
                              className="flex-1"
                            />
                            <Select
                              value={form.watch(`default_tasks.${index}.priority`) || 'medium'}
                              onValueChange={(v) =>
                                form.setValue(`default_tasks.${index}.priority`, v as TaskPriority)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(taskPriorityLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTask(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendTask({ title: '', description: '', priority: 'medium' })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une tache
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Budget */}
              <AccordionItem value="budget">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Categories budget ({budgetFields.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {budgetFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 rounded-lg border p-3">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Nom de la depense"
                            {...form.register(`default_budget_categories.${index}.name`)}
                          />
                          <div className="flex gap-2">
                            <Select
                              value={form.watch(`default_budget_categories.${index}.category`)}
                              onValueChange={(v) =>
                                form.setValue(
                                  `default_budget_categories.${index}.category`,
                                  v as BudgetCategory
                                )
                              }
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(budgetCategoryLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              placeholder="Cout estime"
                              className="w-32"
                              {...form.register(`default_budget_categories.${index}.estimated_cost`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBudget(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendBudget({ name: '', category: 'other', estimated_cost: undefined })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une categorie
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Themes */}
              <AccordionItem value="themes">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Themes suggeres ({themes.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {themes.map((theme, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {theme}
                          <button
                            type="button"
                            onClick={() => removeTheme(index)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nouveau theme"
                        value={newTheme}
                        onChange={(e) => setNewTheme(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTheme())}
                      />
                      <Button type="button" variant="outline" onClick={addTheme}>
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating
                  ? 'Enregistrement...'
                  : editTemplate
                    ? 'Mettre a jour'
                    : 'Creer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTemplate} onOpenChange={(open) => !open && setDeleteTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le template ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. Le template "{deleteTemplate?.name}" sera supprime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
