import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  MoreHorizontal,
  CreditCard,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  Infinity,
  Gift,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  useTogglePlanActive,
  PLAN_FEATURE_LABELS,
  PLAN_LIMIT_LABELS,
} from '@/hooks/useAdminPlans';
import type { Plan, PlanFeatures, PlanLimits } from '@/hooks/useAdminPlans';

const planFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'Le prix doit etre positif'),
  duration_days: z.number().min(1, 'La duree doit etre au moins 1 jour'),
  is_trial: z.boolean(),
  is_one_time_use: z.boolean().optional(),
  is_active: z.boolean(),
  sort_order: z.number().min(0),
  limits: z.object({
    'events.creations_per_billing_period': z.number(),
    'guests.max_per_event': z.number(),
    'collaborators.max_per_event': z.number(),
    'photos.max_per_event': z.number(),
  }),
  features: z.record(z.string(), z.boolean()), // Accept any string key including dots
});

type PlanFormValues = z.infer<typeof planFormSchema>;

const defaultLimits: PlanLimits = {
  'events.creations_per_billing_period': 1,
  'guests.max_per_event': 10,
  'collaborators.max_per_event': 1,
  'photos.max_per_event': 5,
};

const defaultFeatures: PlanFeatures = {
  'budget.enabled': false,
  'planning.enabled': false,
  'tasks.enabled': false,
  'guests.manage': false,
  'guests.import': false,
  'guests.export': false,
  'invitations.sms': false,
  'invitations.whatsapp': false,
  'collaborators.manage': false,
  'roles_permissions.enabled': false,
  'exports.pdf': false,
  'exports.excel': false,
  'exports.csv': false,
  'history.enabled': false,
  'reporting.enabled': false,
  'branding.custom': false,
  'support.whatsapp_priority': false,
  'support.dedicated': false,
  'multi_client.enabled': false,
  'assistance.human': false,
};

export function AdminPlansPage() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [deletePlan, setDeletePlan] = useState<Plan | null>(null);
  const [unlimitedFlags, setUnlimitedFlags] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useAdminPlans();
  const plans = data?.data || [];
  const { mutate: createPlan, isPending: isCreating } = useCreatePlan();
  const { mutate: updatePlan, isPending: isUpdating } = useUpdatePlan();
  const { mutate: deletePlanMutation, isPending: isDeleting } = useDeletePlan();
  const { mutate: toggleActive } = useTogglePlanActive();

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      duration_days: 30,
      is_trial: false,
      is_one_time_use: false,
      is_active: true,
      sort_order: 0,
      limits: defaultLimits as any,
      features: defaultFeatures,
    },
  });

  const openCreateForm = () => {
    form.reset({
      name: '',
      slug: '',
      description: '',
      price: 0,
      duration_days: 30,
      is_trial: false,
      is_one_time_use: false,
      is_active: true,
      sort_order: plans.length,
      limits: defaultLimits as any,
      features: defaultFeatures,
    });
    setUnlimitedFlags({});
    setEditPlan(null);
    setFormOpen(true);
  };

  const openEditForm = (plan: Plan) => {
    const limits = plan.limits || defaultLimits;
    const newUnlimitedFlags: Record<string, boolean> = {};

    Object.keys(PLAN_LIMIT_LABELS).forEach((key) => {
      const value = limits[key];
      newUnlimitedFlags[key] = value === -1;
    });

    setUnlimitedFlags(newUnlimitedFlags);

    form.reset({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      price: plan.price,
      duration_days: plan.duration_days,
      is_trial: plan.is_trial,
      is_one_time_use: plan.is_one_time_use ?? false,
      is_active: plan.is_active,
      sort_order: plan.sort_order,
      limits: {
        'events.creations_per_billing_period': limits['events.creations_per_billing_period'] ?? 1,
        'guests.max_per_event': limits['guests.max_per_event'] ?? 10,
        'collaborators.max_per_event': limits['collaborators.max_per_event'] ?? 1,
        'photos.max_per_event': limits['photos.max_per_event'] ?? 5,
      },
      features: { ...defaultFeatures, ...plan.features },
    });
    setEditPlan(plan);
    setFormOpen(true);
  };

  const handleSubmit = (data: PlanFormValues) => {
    // Apply unlimited flags to limits
    const finalLimits: Record<string, number> = { ...data.limits };
    Object.keys(unlimitedFlags).forEach((key) => {
      if (unlimitedFlags[key]) {
        finalLimits[key] = -1;
      }
    });

    // Backend expects nested structure: { events: { creations_per_billing_period: ... }, guests: { max_per_event: ... }, ... }
    const transformedLimits: Record<string, Record<string, number>> = {};

    Object.entries(finalLimits).forEach(([key, value]) => {
      if (key === 'events.creations_per_billing_period') {
        transformedLimits.events = { creations_per_billing_period: value };
      } else if (key === 'guests.max_per_event') {
        transformedLimits.guests = { max_per_event: value };
      } else if (key === 'collaborators.max_per_event') {
        transformedLimits.collaborators = { max_per_event: value };
      } else if (key === 'photos.max_per_event') {
        transformedLimits.photos = { max_per_event: value };
      }
    });

    const formData: any = {
      name: data.name,
      slug: data.slug || undefined,
      description: data.description || undefined,
      price: data.price,
      duration_days: data.duration_days,
      is_trial: data.is_trial,
      is_one_time_use: data.is_one_time_use ?? false,
      is_active: data.is_active,
      sort_order: data.sort_order,
      limits: transformedLimits,
      features: data.features,
    };

    if (editPlan) {
      updatePlan(
        { planId: editPlan.id, data: formData },
        {
          onSuccess: () => {
            toast({ title: 'Plan mis a jour' });
            setFormOpen(false);
          },
          onError: (error: any) => {
            toast({
              title: 'Erreur',
              description: error?.response?.data?.message || 'Impossible de mettre a jour le plan.',
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      createPlan(formData, {
        onSuccess: () => {
          toast({ title: 'Plan cree' });
          setFormOpen(false);
        },
        onError: (error: any) => {
          toast({
            title: 'Erreur',
            description: error?.response?.data?.message || 'Impossible de creer le plan.',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deletePlan) return;

    deletePlanMutation(deletePlan.id, {
      onSuccess: () => {
        toast({ title: 'Plan supprime' });
        setDeletePlan(null);
      },
      onError: (error: any) => {
        toast({
          title: 'Erreur',
          description: error?.response?.data?.message || 'Impossible de supprimer le plan.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleToggleActive = (plan: Plan) => {
    toggleActive(plan.id, {
      onSuccess: () => {
        toast({
          title: plan.is_active ? 'Plan desactive' : 'Plan active',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans d'abonnement"
        description="Gerez les plans et tarifs de la plateforme"
        actions={
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau plan
          </Button>
        }
      />

      {/* Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des plans</CardTitle>
          <CardDescription>{plans.length} plan(s) configures</CardDescription>
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
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Aucun plan configure</p>
              <Button className="mt-4" onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                Creer un plan
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Duree</TableHead>
                    <TableHead>Evenements</TableHead>
                    <TableHead>Abonnes</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              plan.is_trial
                                ? 'bg-blue-100 text-blue-600'
                                : plan.price >= 25000
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-green-100 text-green-600'
                            }`}
                          >
                            {plan.is_trial ? (
                              <Gift className="h-5 w-5" />
                            ) : (
                              <CreditCard className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            <p className="text-xs text-muted-foreground">{plan.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString()} FCFA`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{plan.duration_days} jours</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {plan.limits?.['events.creations_per_billing_period'] === -1 ? (
                            <>
                              <Infinity className="h-4 w-4 text-muted-foreground" />
                              <span>Illimite</span>
                            </>
                          ) : (
                            <span>{plan.limits?.['events.creations_per_billing_period'] || 0}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{plan.active_subscriptions_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {plan.is_trial && (
                            <Badge variant="outline" className="border-blue-300 text-blue-600">
                              Essai
                            </Badge>
                          )}
                          {plan.is_active ? (
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
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditForm(plan)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(plan)}>
                              {plan.is_active ? (
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
                              onClick={() => setDeletePlan(plan)}
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
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPlan ? 'Modifier le plan' : 'Nouveau plan'}</DialogTitle>
            <DialogDescription>
              {editPlan
                ? 'Modifiez les informations du plan'
                : "Creez un nouveau plan d'abonnement"}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit, (errors) => {
              console.error('Form validation errors:', errors);
              toast({
                title: 'Erreur de validation',
                description: 'Veuillez corriger les erreurs dans le formulaire.',
                variant: 'destructive',
              });
            })}
            className="space-y-6"
          >
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="limits">Limites</TabsTrigger>
                <TabsTrigger value="features">Fonctionnalites</TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input id="name" {...form.register('name')} />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (auto-genere si vide)</Label>
                    <Input id="slug" {...form.register('slug')} placeholder="pro" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...form.register('description')} rows={2} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (FCFA)</Label>
                    <Input
                      id="price"
                      type="number"
                      {...form.register('price', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_days">Duree (jours)</Label>
                    <Input
                      id="duration_days"
                      type="number"
                      {...form.register('duration_days', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Ordre d'affichage</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      {...form.register('sort_order', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_trial"
                      checked={form.watch('is_trial')}
                      onCheckedChange={(checked) => {
                        form.setValue('is_trial', checked);
                        // If trial is enabled, automatically set is_one_time_use to true
                        if (checked) {
                          form.setValue('is_one_time_use', true);
                        }
                      }}
                    />
                    <Label htmlFor="is_trial">Plan d'essai gratuit</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_one_time_use"
                      checked={form.watch('is_one_time_use') ?? false}
                      onCheckedChange={(checked) => form.setValue('is_one_time_use', checked)}
                      disabled={form.watch('is_trial')}
                    />
                    <Label
                      htmlFor="is_one_time_use"
                      className={form.watch('is_trial') ? 'text-muted-foreground' : ''}
                    >
                      Usage unique {form.watch('is_trial') && '(activé automatiquement)'}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="is_active"
                      checked={form.watch('is_active')}
                      onCheckedChange={(checked) => form.setValue('is_active', checked)}
                    />
                    <Label htmlFor="is_active">Plan actif</Label>
                  </div>
                </div>
              </TabsContent>

              {/* Limits Tab */}
              <TabsContent value="limits" className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Definissez les quotas et limites pour ce plan. Cochez "Illimite" pour ne pas
                  imposer de limite.
                </p>

                <div className="space-y-4">
                  {Object.entries(PLAN_LIMIT_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-4 rounded-lg border p-4">
                      <div className="flex-1">
                        <Label>{label}</Label>
                        <p className="text-xs text-muted-foreground">{key}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          className="w-24"
                          disabled={unlimitedFlags[key]}
                          {...form.register(`limits.${key}` as any, { valueAsNumber: true })}
                        />
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`unlimited-${key}`}
                            checked={unlimitedFlags[key] || false}
                            onCheckedChange={(checked) => {
                              setUnlimitedFlags((prev) => ({
                                ...prev,
                                [key]: !!checked,
                              }));
                            }}
                          />
                          <Label htmlFor={`unlimited-${key}`} className="text-sm">
                            Illimite
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">
                  Selectionnez les fonctionnalites incluses dans ce plan.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(PLAN_FEATURE_LABELS).map(([key, label]) => {
                    // Access features using getValues to handle keys with dots properly
                    const features = form.watch('features') || {};
                    const currentValue = features[key as keyof typeof features] || false;

                    return (
                      <div key={key} className="flex items-center space-x-3 rounded-lg border p-3">
                        <Checkbox
                          id={`feature-${key}`}
                          checked={!!currentValue}
                          onCheckedChange={(checked) => {
                            const currentFeatures = form.getValues('features') || {};
                            form.setValue(
                              'features',
                              {
                                ...currentFeatures,
                                [key]: !!checked,
                              },
                              { shouldValidate: true }
                            );
                          }}
                        />
                        <Label htmlFor={`feature-${key}`} className="flex-1 cursor-pointer">
                          {label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating
                  ? 'Enregistrement...'
                  : editPlan
                    ? 'Mettre a jour'
                    : 'Creer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePlan} onOpenChange={(open) => !open && setDeletePlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le plan ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. Le plan "{deletePlan?.name}" sera supprime.
              {deletePlan?.active_subscriptions_count &&
                deletePlan.active_subscriptions_count > 0 && (
                  <span className="mt-2 block text-destructive">
                    Attention: {deletePlan.active_subscriptions_count} abonnement(s) actif(s)
                    utilisent ce plan.
                  </span>
                )}
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

