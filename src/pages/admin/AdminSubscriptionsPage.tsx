import { useState } from 'react';
import { format, parseISO, isPast, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Search,
  MoreHorizontal,
  FileText,
  Ban,
  Crown,
  Sparkles,
  Calendar,
  CalendarPlus,
  RefreshCw,
  Eye,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PerPageSelector } from '@/components/ui/per-page-selector';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminSubscriptions,
  useCancelSubscription,
  useExtendSubscription,
  useChangePlan,
  type AdminSubscription,
} from '@/hooks/useAdmin';
import type { AdminSubscriptionFilters, PlanType } from '@/types';

function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(num);
}

const planLabels: Record<PlanType, string> = {
  starter: 'Starter',
  pro: 'Pro',
};

const planColors: Record<PlanType, string> = {
  starter: 'bg-blue-100 text-blue-800 border-blue-200',
  pro: 'bg-amber-100 text-amber-800 border-amber-200',
};

const planIcons: Record<PlanType, typeof Sparkles> = {
  starter: Sparkles,
  pro: Crown,
};

const paymentStatusLabels: Record<string, string> = {
  pending: 'En attente',
  paid: 'Paye',
  failed: 'Echoue',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export function AdminSubscriptionsPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<AdminSubscriptionFilters>({
    page: 1,
    per_page: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [cancelSub, setCancelSub] = useState<AdminSubscription | null>(null);
  const [extendSub, setExtendSub] = useState<AdminSubscription | null>(null);
  const [extendDays, setExtendDays] = useState(30);
  const [changePlanSub, setChangePlanSub] = useState<AdminSubscription | null>(null);
  const [newPlanType, setNewPlanType] = useState<PlanType>('pro');
  const [detailsSub, setDetailsSub] = useState<AdminSubscription | null>(null);

  const { data, isLoading } = useAdminSubscriptions(filters);
  const { mutate: cancelMutation, isPending: isCancelling } = useCancelSubscription();
  const { mutate: extendMutation, isPending: isExtending } = useExtendSubscription();
  const { mutate: changePlanMutation, isPending: isChangingPlan } = useChangePlan();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handlePlanFilter = (plan: string) => {
    if (plan === 'all') {
      setFilters((prev) => {
        const { plan_type: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    } else {
      setFilters((prev) => ({ ...prev, plan_type: plan as PlanType, page: 1 }));
    }
  };

  const handlePaymentStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters((prev) => {
        const { payment_status: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    } else {
      setFilters((prev) => ({ ...prev, payment_status: status as 'pending' | 'paid' | 'failed', page: 1 }));
    }
  };

  const handleCancel = () => {
    if (!cancelSub) return;

    cancelMutation(cancelSub.id, {
      onSuccess: () => {
        toast({
          title: 'Abonnement annule',
          description: `L'abonnement a ete annule avec succes.`,
        });
        setCancelSub(null);
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Impossible d\'annuler l\'abonnement.',
          variant: 'destructive',
        });
      },
    });
  };

  

  const handleExtend = () => {
    if (!extendSub) return;
    extendMutation({ subscriptionId: extendSub.id, days: extendDays }, {
      onSuccess: () => {
        toast({ title: 'Abonnement prolonge', description: `L'abonnement a ete prolonge de ${extendDays} jours.` });
        setExtendSub(null);
        setExtendDays(30);
      },
      onError: () => {
        toast({ title: 'Erreur', description: "Impossible de prolonger l'abonnement.", variant: 'destructive' });
      },
    });
  };

  const handleChangePlan = () => {
    if (!changePlanSub) return;
    changePlanMutation({ subscriptionId: changePlanSub.id, planType: newPlanType }, {
      onSuccess: () => {
        toast({ title: 'Plan modifie', description: `Le plan a ete change en ${planLabels[newPlanType]}.` });
        setChangePlanSub(null);
      },
      onError: () => {
        toast({ title: 'Erreur', description: 'Impossible de changer le plan.', variant: 'destructive' });
      },
    });
  };

  const handleContactUser = (subscription: AdminSubscription) => {
    const email = subscription.event?.user?.email;
    if (email) {
      window.location.href = `mailto:${email}?subject=Concernant votre abonnement Party Planner`;
    } else {
      toast({ title: 'Email non disponible', description: "L'adresse email de l'utilisateur n'est pas disponible.", variant: 'destructive' });
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return isPast(parseISO(expiresAt));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Abonnements"
        description="Gestion des abonnements de la plateforme"
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select
              value={filters.plan_type || 'all'}
              onValueChange={handlePlanFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les plans</SelectItem>
                {Object.entries(planLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.payment_status || 'all'}
              onValueChange={handlePaymentStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(paymentStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>Rechercher</Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des abonnements</CardTitle>
          <CardDescription>
            {data?.total || 0} abonnement(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
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
          ) : data?.data?.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Aucun abonnement trouve</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Evenement</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((subscription) => {
                    const PlanIcon = planIcons[subscription.plan_type] || Sparkles;
                    const expired = isExpired(subscription.expires_at);

                    return (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          {subscription.event?.user ? (
                            <div>
                              <p className="text-sm font-medium">{subscription.event.user.name}</p>
                              <p className="text-xs text-muted-foreground">{subscription.event.user.email}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Utilisateur #{subscription.user_id}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {subscription.event ? (
                            <p className="text-sm">{subscription.event.title}</p>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Evenement #{subscription.event_id}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={planColors[subscription.plan_type]}
                          >
                            <PlanIcon className="mr-1 h-3 w-3" />
                            {planLabels[subscription.plan_type] || subscription.plan_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{formatCurrency(subscription.total_price)}</p>
                            <p className="text-xs text-muted-foreground">
                              {subscription.guest_count} invites
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={paymentStatusColors[subscription.payment_status]}>
                            {paymentStatusLabels[subscription.payment_status] || subscription.payment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm">
                                {subscription.expires_at ? format(parseISO(subscription.expires_at), 'dd MMM yyyy', { locale: fr }) : '-'}
                              </p>
                              {expired ? (
                                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                                  Expire
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                  Actif
                                </Badge>
                              )}
                            </div>
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
                              <DropdownMenuItem onClick={() => setDetailsSub(subscription)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir les details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleContactUser(subscription)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Contacter
                              </DropdownMenuItem>
                              {subscription.payment_status === 'paid' && !expired && (
                                <>
                                  <DropdownMenuItem onClick={() => setExtendSub(subscription)}>
                                    <CalendarPlus className="mr-2 h-4 w-4" />
                                    Prolonger
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setChangePlanSub(subscription); setNewPlanType(subscription.plan_type === 'starter' ? 'pro' : 'starter'); }}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Changer de plan
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" onClick={() => setCancelSub(subscription)}>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Annuler
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data && (data.total > 0 || (data.last_page ?? 0) > 1) && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <PerPageSelector
                value={filters.per_page || 20}
                onChange={(value) => setFilters((prev) => ({ ...prev, per_page: value, page: 1 }))}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data?.current_page === 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                >
                  Precedent
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {data?.current_page} sur {data?.last_page || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data?.current_page === data?.last_page || data?.last_page === 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation */}
      <AlertDialog open={!!cancelSub} onOpenChange={(open) => !open && setCancelSub(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler l'abonnement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous allez annuler l'abonnement {planLabels[cancelSub?.plan_type || 'starter']} de{' '}
              {cancelSub?.event?.user?.name || `l'utilisateur #${cancelSub?.user_id}`}.
              L'utilisateur perdra l'acces aux fonctionnalites premium.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Retour</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isCancelling}
            >
              {isCancelling ? 'Annulation...' : 'Confirmer l\'annulation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Extend Dialog */}
      <Dialog open={!!extendSub} onOpenChange={(open) => !open && setExtendSub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prolonger l'abonnement</DialogTitle>
            <DialogDescription>
              Prolonger l'abonnement de {extendSub?.event?.user?.name || `l'utilisateur #${extendSub?.user_id}`}.
              Expiration actuelle : {extendSub?.expires_at ? format(parseISO(extendSub.expires_at), 'dd MMM yyyy', { locale: fr }) : '-'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="days">Nombre de jours</Label>
              <Select value={extendDays.toString()} onValueChange={(v) => setExtendDays(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="14">14 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="60">60 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                  <SelectItem value="365">1 an</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {extendSub?.expires_at && (
              <p className="text-sm text-muted-foreground">
                Nouvelle expiration : {format(addDays(parseISO(extendSub.expires_at), extendDays), 'dd MMM yyyy', { locale: fr })}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendSub(null)}>Annuler</Button>
            <Button onClick={handleExtend} disabled={isExtending}>{isExtending ? 'Prolongation...' : 'Prolonger'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={!!changePlanSub} onOpenChange={(open) => !open && setChangePlanSub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer de plan</DialogTitle>
            <DialogDescription>
              Changer le plan de {changePlanSub?.event?.user?.name || `l'utilisateur #${changePlanSub?.user_id}`}. Plan actuel : {changePlanSub ? planLabels[changePlanSub.plan_type] : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nouveau plan</Label>
              <Select value={newPlanType} onValueChange={(v) => setNewPlanType(v as PlanType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(planLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value} disabled={value === changePlanSub?.plan_type}>{label} {value === changePlanSub?.plan_type && '(actuel)'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePlanSub(null)}>Annuler</Button>
            <Button onClick={handleChangePlan} disabled={isChangingPlan || newPlanType === changePlanSub?.plan_type}>{isChangingPlan ? 'Changement...' : 'Changer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!detailsSub} onOpenChange={(open) => !open && setDetailsSub(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Details de l'abonnement</DialogTitle></DialogHeader>
          {detailsSub && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilisateur</p>
                  <p className="text-sm">{detailsSub.event?.user?.name || `#${detailsSub.user_id}`}</p>
                  {detailsSub.event?.user?.email && <p className="text-xs text-muted-foreground">{detailsSub.event.user.email}</p>}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Evenement</p>
                  <p className="text-sm">{detailsSub.event?.title || `#${detailsSub.event_id}`}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plan</p>
                  <Badge variant="outline" className={planColors[detailsSub.plan_type]}>{planLabels[detailsSub.plan_type]}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Statut paiement</p>
                  <Badge className={paymentStatusColors[detailsSub.payment_status]}>{paymentStatusLabels[detailsSub.payment_status]}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de creation</p>
                  <p className="text-sm">{format(parseISO(detailsSub.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date d'expiration</p>
                  <p className="text-sm">{detailsSub.expires_at ? format(parseISO(detailsSub.expires_at), 'dd MMM yyyy', { locale: fr }) : '-'}</p>
                </div>
              </div>

              {/* Revenue Calculation Section */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-semibold mb-3">Calcul du revenu</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Prix de base ({planLabels[detailsSub.plan_type]})</span>
                    <span>{formatCurrency(detailsSub.base_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Invites ({detailsSub.guest_count} x {formatCurrency(detailsSub.guest_price_per_unit)})</span>
                    <span>{formatCurrency(detailsSub.guest_count * parseFloat(String(detailsSub.guest_price_per_unit)))}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                    <span>Revenu total</span>
                    <span className="text-green-600">{formatCurrency(parseFloat(String(detailsSub.base_price)) + (detailsSub.guest_count * parseFloat(String(detailsSub.guest_price_per_unit))))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setDetailsSub(null)}>Fermer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
