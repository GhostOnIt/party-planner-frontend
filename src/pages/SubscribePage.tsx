import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Check, AlertCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/layout/page-header';
import { PaymentForm } from '@/components/features/payment/PaymentForm';
import { PaymentStatus } from '@/components/features/payment/PaymentStatus';
import { usePlans, formatLimitValue } from '@/hooks/useAdminPlans';
import { useSubscribeToPlan } from '@/hooks/useSubscription';
import { useInitiatePayment } from '@/hooks/usePayment';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/api/client';
import type { PaymentMethod } from '@/types';

export function SubscribePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [subscriptionCreated, setSubscriptionCreated] = useState(false);

  const { data: plans, isLoading: isLoadingPlans } = usePlans();
  const plan = plans?.find(p => p.slug === slug && p.is_active && !p.is_trial);

  const subscribeMutation = useSubscribeToPlan();
  const initiatePaymentMutation = useInitiatePayment();

  useEffect(() => {
    if (!isLoadingPlans && !plan) {
      toast({
        title: 'Plan introuvable',
        description: 'Le plan demandé n\'existe pas ou n\'est plus disponible.',
        variant: 'destructive',
      });
      navigate('/plans');
    }
  }, [plan, isLoadingPlans, navigate, toast]);

  const handlePaymentSubmit = async (data: { phone_number: string; method: PaymentMethod }) => {
    if (!plan) return;

    try {
      // First, create the subscription
      const subscriptionResult = await subscribeMutation.mutateAsync({ plan_id: plan.id });
      
      if (subscriptionResult.requires_payment === false) {
        // Trial or free plan - no payment needed
        toast({
          title: 'Abonnement activé',
          description: 'Votre abonnement a été activé avec succès.',
        });
        navigate('/dashboard');
        return;
      }

      setSubscriptionCreated(true);

      // Then initiate payment
      const paymentResult = await initiatePaymentMutation.mutateAsync({
        amount: plan.price,
        currency: 'XAF',
        method: data.method,
        phone_number: data.phone_number,
        description: `Abonnement ${plan.name}`,
        subscription_id: subscriptionResult.subscription?.id,
      });

      setPaymentId(paymentResult.payment?.id || null);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: getApiErrorMessage(error) || 'Une erreur est survenue lors de la souscription.',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: 'Paiement réussi',
      description: 'Votre abonnement a été activé avec succès.',
    });
    navigate('/dashboard');
  };

  const handlePaymentFailure = () => {
    toast({
      title: 'Paiement échoué',
      description: 'Le paiement n\'a pas pu être effectué. Veuillez réessayer.',
      variant: 'destructive',
    });
  };

  if (isLoadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Plan introuvable"
          description="Le plan demandé n'existe pas ou n'est plus disponible."
        />
        <Card>
          <CardContent className="pt-6">
            <Button onClick={() => navigate('/plans')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If payment is in progress, show payment status
  if (paymentId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Paiement en cours"
          description="Suivez le statut de votre paiement"
        />
        <PaymentStatus
          paymentId={paymentId}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Souscrire à ${plan.name}`}
        description="Finalisez votre abonnement en effectuant le paiement"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle>{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description || ''}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price */}
              <div className="text-center py-4 border-b">
                <div className="text-3xl font-bold">
                  {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString('fr-FR')} FCFA`}
                </div>
                <div className="text-sm text-muted-foreground mt-1">par mois</div>
              </div>

              {/* Key Features */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Inclus dans ce plan :</h4>
                <ul className="space-y-2">
                  {plan.limits?.['events.creations_per_billing_period'] !== undefined && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>
                        {formatLimitValue(plan.limits['events.creations_per_billing_period'])} événements
                      </span>
                    </li>
                  )}
                  {plan.limits?.['guests.max_per_event'] !== undefined && (
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span>
                        {formatLimitValue(plan.limits['guests.max_per_event'])} invités par événement
                      </span>
                    </li>
                  )}
                  {Object.entries(plan.features || {})
                    .filter(([_, enabled]) => enabled)
                    .slice(0, 5)
                    .map(([key]) => (
                      <li key={key} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{key.replace(/\./g, ' ')}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/plans')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voir les autres plans
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations de paiement</CardTitle>
              <CardDescription>
                Complétez le formulaire pour finaliser votre abonnement
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionCreated && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Votre abonnement a été créé. Veuillez compléter le paiement pour l'activer.
                  </AlertDescription>
                </Alert>
              )}

              <PaymentForm
                amount={plan.price}
                currency="XAF"
                onSubmit={handlePaymentSubmit}
                isLoading={subscribeMutation.isPending || initiatePaymentMutation.isPending}
                description={`Abonnement ${plan.name} - ${plan.duration_label}`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

