import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { SubscriptionStatus } from '@/components/features/subscription';
import { PaymentForm, PaymentStatus as PaymentStatusComponent } from '@/components/features/payment';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  useEventSubscription,
  useUpgradeSubscription,
  useCancelSubscription,
  useRenewSubscription,
} from '@/hooks/useSubscription';
import {
  useInitiatePayment,
} from '@/hooks/usePayment';
import { getApiErrorMessage } from '@/api/client';
import type { PlanType, PaymentMethod } from '@/types';

interface EventSubscriptionPageProps {
  eventId?: string;
}

type FlowStep = 'select-plan' | 'payment' | 'processing' | 'success';

// Check if we're in sandbox mode (via VITE_PAYMENT_ENV variable)
const isSandbox = import.meta.env.VITE_PAYMENT_ENV === 'sandbox';

// Prices in XAF (production) or EUR (sandbox)
// Sandbox requires minimum 100 EUR, using 150 EUR for safety
const planPrices: Record<PlanType, number> = isSandbox
  ? { starter: 150, pro: 300 }  // EUR for sandbox (min 100 EUR)
  : { starter: 5000, pro: 15000 };  // XAF for production

const currency = isSandbox ? 'EUR' : 'XAF';

export function EventSubscriptionPage({ eventId }: EventSubscriptionPageProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [flowStep, setFlowStep] = useState<FlowStep>('select-plan');
  const [currentPaymentId, setCurrentPaymentId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'upgrade' | 'renew'>('upgrade');

  const { data: subscription, isLoading, error } = useEventSubscription(eventId || '');
  const { mutate: upgrade } = useUpgradeSubscription(eventId || '');
  const { mutate: cancel, isPending: isCancelling } = useCancelSubscription(eventId || '');
  const { mutate: renew } = useRenewSubscription(eventId || '');
  const { mutate: initiatePayment, isPending: isInitiatingPayment } = useInitiatePayment();

  if (!eventId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Crown className="h-5 w-5" />
            Erreur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Impossible de charger les informations d'abonnement.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleUpgrade = () => {
    setSelectedPlan('pro');
    setActionType('upgrade');
    setFlowStep('select-plan');
    setShowPaymentModal(true);
  };

  const handleRenew = () => {
    if (subscription) {
      setSelectedPlan(subscription.plan_type || subscription.plan || 'starter');
      setActionType('renew');
      setFlowStep('select-plan');
      setShowPaymentModal(true);
    }
  };

  const handleActivatePlan = () => {
    navigate('/subscriptions?tab=activate');
  };

  const handlePaymentSubmit = (data: { phone_number: string; method: PaymentMethod }) => {
    if (!selectedPlan) return;

    // Clean phone number - remove spaces, dashes, parentheses
    let cleanPhone = data.phone_number.replace(/[\s\-()]/g, '');

    // Only remove country code for Congo numbers (not sandbox numbers starting with 467)
    if (!cleanPhone.startsWith('467')) {
      cleanPhone = cleanPhone.replace(/^\+?242/, '');
    }

    const payload = {
      event_id: Number(eventId),
      phone_number: cleanPhone,
      plan_type: selectedPlan,
      method: data.method,
      amount: planPrices[selectedPlan],
      currency: currency,
    };

    console.log('Payment payload:', payload);

    initiatePayment(
      payload,
      {
        onSuccess: (response) => {
          console.log('Payment response:', response);

          // Vérifier que la réponse contient bien un payment
          if (!response?.payment?.id) {
            toast({
              title: 'Erreur',
              description: response?.message || 'Réponse invalide du serveur de paiement.',
              variant: 'destructive',
            });
            return;
          }

          setCurrentPaymentId(response.payment.id);
          setFlowStep('processing');
        },
        onError: (error) => {
          console.error('Payment error:', error);
          toast({
            title: 'Erreur',
            description: getApiErrorMessage(error),
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handlePaymentSuccess = () => {
    console.log('handlePaymentSuccess called:', { selectedPlan, currentPaymentId });

    if (!selectedPlan || !currentPaymentId) {
      console.log('Missing data, returning early');
      return;
    }

    const mutationData = { plan_type: selectedPlan, payment_id: currentPaymentId };
    console.log('Subscription mutation data:', mutationData);

    const onSuccess = () => {
      setFlowStep('success');
      toast({
        title: 'Abonnement active',
        description: `Votre plan ${selectedPlan} est maintenant actif.`,
      });
      setTimeout(() => {
        setShowPaymentModal(false);
        resetFlow();
      }, 2000);
    };

    const onError = (error: unknown) => {
      console.error('='.repeat(50));
      console.error('🚨 SUBSCRIPTION MUTATION ERROR');
      console.error('='.repeat(50));
      console.error('Action type:', actionType);
      console.error('Mutation data:', mutationData);
      console.error('Error:', error);
      console.error('='.repeat(50));

      toast({
        title: 'Erreur',
        description: getApiErrorMessage(error),
        variant: 'destructive',
      });
    };

    try {
      console.log('Calling mutation for action:', actionType);
      if (actionType === 'upgrade') {
        upgrade(mutationData, { onSuccess, onError });
      } else {
        renew({ payment_id: currentPaymentId }, { onSuccess, onError });
      }
    } catch (err) {
      console.error('Sync error in handlePaymentSuccess:', err);
      onError(err);
    }
  };

  const handleCancelSubscription = () => {
    cancel(undefined, {
      onSuccess: () => {
        toast({
          title: 'Abonnement annule',
          description: 'Votre abonnement a ete annule.',
        });
        setShowCancelDialog(false);
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

  const resetFlow = () => {
    setSelectedPlan(null);
    setFlowStep('select-plan');
    setCurrentPaymentId(null);
  };

  const handleCloseModal = () => {
    if (flowStep !== 'processing') {
      setShowPaymentModal(false);
      resetFlow();
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {subscription ? (
        <SubscriptionStatus
          subscription={subscription}
          onUpgrade={(subscription.plan_type || subscription.plan) === 'starter' ? handleUpgrade : undefined}
          onRenew={handleRenew}
          onCancel={() => setShowCancelDialog(true)}
          isLoading={isCancelling}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Abonnement
            </CardTitle>
            <CardDescription>
              Aucun abonnement actif pour cet evenement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Crown}
              title="Aucun abonnement"
              description="Activez un plan pour debloquer toutes les fonctionnalites premium de cet evenement."
            />
            <div className="mt-4 flex justify-center">
              <Button onClick={handleActivatePlan}>
                <Crown className="mr-2 h-4 w-4" />
                Activer un plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Modal for Upgrade/Renew */}
      <Dialog open={showPaymentModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'upgrade'
                ? 'Passer au plan superieur'
                : 'Renouveler l\'abonnement'}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan && `Plan ${selectedPlan === 'starter' ? 'Starter' : 'Pro'}`}
            </DialogDescription>
          </DialogHeader>

          {flowStep === 'select-plan' && selectedPlan && (
            <PaymentForm
              amount={planPrices[selectedPlan]}
              currency={currency}
              description={`Abonnement ${selectedPlan}`}
              onSubmit={handlePaymentSubmit}
              isLoading={isInitiatingPayment}
              planType={selectedPlan}
            />
          )}

          {flowStep === 'processing' && currentPaymentId && (
            <ErrorBoundary>
              <PaymentStatusComponent
                paymentId={currentPaymentId}
                onSuccess={handlePaymentSuccess}
                onFailure={() => setFlowStep('select-plan')}
                onRetry={() => setFlowStep('select-plan')}
              />
            </ErrorBoundary>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler l'abonnement</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir annuler votre abonnement ? Vous perdrez acces
              aux fonctionnalites premium a la fin de la periode en cours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Garder mon abonnement</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Annulation...' : 'Annuler l\'abonnement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
