import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, CreditCard, Plus, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PaymentHistory, PaymentForm, PaymentStatus as PaymentStatusComponent } from '@/components/features/payment';
import { PlanSelector } from '@/components/features/subscription';
import { useSubscriptions } from '@/hooks/useSubscription';
import { usePayments, useRetryPayment, useInitiatePayment } from '@/hooks/usePayment';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/api/client';
import type { Subscription, Event as EventType, PlanType, PaymentMethod } from '@/types';

const planNames = {
  starter: 'Starter',
  pro: 'Pro',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paid: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const statusLabels: Record<string, string> = {
  active: 'Actif',
  paid: 'Actif',
  expired: 'Expire',
  failed: 'Échoué',
  cancelled: 'Annule',
  pending: 'En attente',
};

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const navigate = useNavigate();

  // Use new field names with fallbacks for compatibility
  const plan = subscription.plan_type || subscription.plan || 'starter';
  const status = subscription.payment_status || subscription.status || 'pending';
  const expiresAtStr = subscription.expires_at || subscription.ends_at;
  const endsAt = expiresAtStr ? parseISO(expiresAtStr) : new Date();
  const isExpired = isPast(endsAt);

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Plan {planNames[plan] || plan}</h3>
                <Badge className={statusColors[status] || statusColors.pending}>
                  {statusLabels[status] || status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Evenement #{subscription.event_id}
              </p>
              <p className="text-sm text-muted-foreground">
                {isExpired ? (
                  <span className="text-destructive">
                    Expire le {format(endsAt, 'dd MMMM yyyy', { locale: fr })}
                  </span>
                ) : (
                  <>Valide jusqu'au {format(endsAt, 'dd MMMM yyyy', { locale: fr })}</>
                )}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/events/${subscription.event_id}`)}
          >
            Voir l'evenement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Pricing configuration
const isSandbox = import.meta.env.VITE_PAYMENT_ENV === 'sandbox';
const planPrices: Record<PlanType, number> = isSandbox
  ? { starter: 150, pro: 300 }
  : { starter: 5000, pro: 15000 };
const currency = isSandbox ? 'EUR' : 'XAF';

type FlowStep = 'select-event' | 'select-plan' | 'payment' | 'processing' | 'success';

function ActivatePlanTab() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventFromUrl = searchParams.get('event');
  const { data: eventsData, isLoading: isLoadingEvents } = useEvents();
  const { data: subscriptions = [] } = useSubscriptions();
  const { mutate: initiatePayment, isPending: isPaymentPending } = useInitiatePayment();

  const [flowStep, setFlowStep] = useState<FlowStep>(eventFromUrl ? 'select-plan' : 'select-event');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(eventFromUrl);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentId, setPaymentId] = useState<number | null>(null);

  // Extract events array from paginated response
  const events: EventType[] = eventsData?.data || [];

  // Filter events that don't have an active subscription
  const eventsWithoutSubscription = events.filter((event: EventType) => {
    const eventSubscription = subscriptions.find(
      (s) => s.event_id === event.id &&
        ((s.payment_status || s.status) === 'paid')
    );
    return !eventSubscription;
  });

  const selectedEvent: EventType | undefined = events.find((e) => e.id === Number(selectedEventId));
  const existingSubscription = selectedEventId
    ? subscriptions.find((s) => s.event_id === Number(selectedEventId))
    : null;

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedPlan(null);
    setFlowStep('select-plan');
  };

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
    setFlowStep('payment');
  };

  const handlePaymentSubmit = (data: { phone_number: string; method: PaymentMethod }) => {
    if (!selectedEventId || !selectedPlan) return;

    setFlowStep('processing');

    initiatePayment(
      {
        event_id: Number(selectedEventId),
        plan_type: selectedPlan,
        phone_number: data.phone_number,
        method: data.method,
      },
      {
        onSuccess: (response) => {
          setPaymentId(response.payment.id);
          setFlowStep('success');
          toast({
            title: 'Paiement initie',
            description: 'Verifiez votre telephone pour confirmer le paiement.',
          });
        },
        onError: (error) => {
          setFlowStep('payment');
          toast({
            title: 'Erreur',
            description: getApiErrorMessage(error) || 'Impossible d\'initier le paiement.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const resetFlow = () => {
    setFlowStep('select-event');
    setSelectedEventId(null);
    setSelectedPlan(null);
    setShowPaymentModal(false);
    setPaymentId(null);
  };

  const handlePaymentSuccess = () => {
    if (!selectedEventId) return;

    // Afficher un message de succès
    toast({
      title: 'Paiement réussi',
      description: 'Votre abonnement a été activé avec succès.',
    });

    // Fermer le modal
    setShowPaymentModal(false);
    resetFlow();

    // Rediriger vers le détail de l'événement après un court délai
    setTimeout(() => {
      navigate(`/events/${selectedEventId}`);
    }, 500);
  };

  if (isLoadingEvents) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Activer un plan
          </CardTitle>
          <CardDescription>
            Selectionnez un evenement et choisissez un plan pour debloquer toutes les fonctionnalites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Event Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">1. Selectionnez un evenement</label>
            {eventsWithoutSubscription.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  {events.length === 0
                    ? "Vous n'avez pas encore d'evenement."
                    : "Tous vos evenements ont deja un abonnement actif."}
                </p>
                {events.length === 0 && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/events/create')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Creer un evenement
                  </Button>
                )}
              </div>
            ) : (
              <Select value={selectedEventId || ''} onValueChange={handleEventSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un evenement..." />
                </SelectTrigger>
                <SelectContent>
                  {eventsWithoutSubscription.map((event) => (
                    <SelectItem key={event.id} value={String(event.id)}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.title}</span>
                        <span className="text-muted-foreground">
                          - {format(parseISO(event.date), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Step 2: Plan Selection */}
          {selectedEventId && (
            <div className="space-y-4">
              <label className="text-sm font-medium">2. Choisissez un plan</label>

              {selectedEvent && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm">
                    <span className="font-medium">Evenement:</span> {selectedEvent.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(selectedEvent.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              )}

              <PlanSelector
                currentSubscription={existingSubscription}
                onSelectPlan={handlePlanSelect}
                isLoading={isPaymentPending}
                prices={planPrices}
                currency={currency}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={(open) => {
        if (!open && flowStep !== 'processing') {
          setShowPaymentModal(false);
          if (flowStep === 'success') {
            resetFlow();
          } else {
            setFlowStep('select-plan');
          }
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {flowStep === 'success' ? 'Paiement initie' : 'Paiement Mobile Money'}
            </DialogTitle>
            <DialogDescription>
              {flowStep === 'success'
                ? 'Verifiez votre telephone pour confirmer'
                : `Plan ${selectedPlan ? planNames[selectedPlan] : ''} pour ${selectedEvent?.title || ''}`}
            </DialogDescription>
          </DialogHeader>

          {flowStep === 'payment' && selectedPlan && (
            <PaymentForm
              amount={planPrices[selectedPlan]}
              currency={currency}
              onSubmit={handlePaymentSubmit}
              isLoading={isPaymentPending}
              description={`Plan ${planNames[selectedPlan]}`}
              planType={selectedPlan}
            />
          )}

          {flowStep === 'processing' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">
                Traitement en cours...
              </p>
            </div>
          )}

          {flowStep === 'success' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <p className="mt-4 text-center text-sm">
                Une demande de paiement a ete envoyee sur votre telephone.
                <br />
                Confirmez le paiement avec votre code PIN.
              </p>
              {paymentId && (
                <div className="mt-4 w-full">
                  <ErrorBoundary>
                    <PaymentStatusComponent 
                      paymentId={paymentId}
                      onSuccess={handlePaymentSuccess}
                    />
                  </ErrorBoundary>
                </div>
              )}
              <div className="mt-6 flex gap-2">
                <Button variant="outline" onClick={resetFlow}>
                  Nouveau paiement
                </Button>
                <Button onClick={() => {
                  setShowPaymentModal(false);
                  resetFlow();
                }}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SubscriptionsPage() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'subscriptions';

  const { data: subscriptions = [], isLoading: isLoadingSubscriptions } = useSubscriptions();
  const { data: payments = [], isLoading: isLoadingPayments } = usePayments();
  const { mutate: retryPayment } = useRetryPayment();

  // Filter using new field names with fallbacks
  const getStatus = (s: Subscription): string => s.payment_status || s.status || 'pending';
  const activeSubscriptions = subscriptions.filter((s) => getStatus(s) === 'paid' || getStatus(s) === 'active');
  const expiredSubscriptions = subscriptions.filter((s) => getStatus(s) !== 'paid' && getStatus(s) !== 'active');

  const handleRetryPayment = (paymentId: number) => {
    retryPayment(paymentId, {
      onSuccess: () => {
        toast({
          title: 'Paiement relance',
          description: 'Verifiez votre telephone pour confirmer.',
        });
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Impossible de relancer le paiement.',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Abonnements"
        description="Gerez vos abonnements et paiements"
      />

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="subscriptions">
            <Crown className="mr-2 h-4 w-4" />
            Abonnements ({subscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="mr-2 h-4 w-4" />
            Paiements ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="activate">
            <Plus className="mr-2 h-4 w-4" />
            Activer un plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-6 space-y-6">
          {/* Active Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-green-600" />
                Abonnements actifs
              </CardTitle>
              <CardDescription>
                {activeSubscriptions.length} abonnement{activeSubscriptions.length !== 1 ? 's' : ''} actif{activeSubscriptions.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSubscriptions ? (
                <SubscriptionListSkeleton />
              ) : activeSubscriptions.length === 0 ? (
                <EmptyState
                  icon={Crown}
                  title="Aucun abonnement actif"
                  description="Souscrivez a un plan pour debloquer toutes les fonctionnalites."
                />
              ) : (
                <div className="space-y-4">
                  {activeSubscriptions.map((subscription) => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expired/Cancelled Subscriptions */}
          {expiredSubscriptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <Crown className="h-5 w-5" />
                  Abonnements expires/annules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expiredSubscriptions.map((subscription) => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Historique des paiements
              </CardTitle>
              <CardDescription>
                Tous vos paiements Mobile Money
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentHistory
                payments={payments}
                isLoading={isLoadingPayments}
                onRetry={handleRetryPayment}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activate" className="mt-6">
          <ActivatePlanTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
