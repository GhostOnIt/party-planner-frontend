import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Check, AlertCircle, Crown, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PaymentForm } from '@/components/features/payment/PaymentForm';
import { PaymentStatus } from '@/components/features/payment/PaymentStatus';
import {
  usePlans,
  formatLimitValue,
  PLAN_FEATURE_LABELS,
  PLAN_LIMIT_LABELS,
} from '@/hooks/useAdminPlans';
import { useSubscribeToPlan } from '@/hooks/useSubscription';
import { useInitiatePayment } from '@/hooks/usePayment';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/api/client';
import type { PaymentMethod } from '@/types';
import { cn } from '@/lib/utils';

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
      <div className="min-h-[60vh] flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement du plan…</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-[60vh] bg-muted/30 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Plan introuvable</CardTitle>
            <CardDescription>
              Le plan demandé n'existe pas ou n'est plus disponible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/plans">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentId) {
    return (
      <div className="min-h-[60vh] bg-muted/30 py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/plans" className="hover:text-foreground transition-colors">
              Plans
            </Link>
            <span>/</span>
            <span className="text-foreground">Paiement en cours</span>
          </nav>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Paiement en cours</h1>
            <p className="mt-1 text-muted-foreground">
              Suivez le statut de votre paiement. Vous recevrez une notification une fois celui-ci
              validé.
            </p>
          </div>
          <PaymentStatus
            paymentId={paymentId}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
          />
        </div>
      </div>
    );
  }

  const enabledFeatures = Object.entries(plan.features || {}).filter(
    ([key, enabled]) => enabled && PLAN_FEATURE_LABELS[key]
  );
  const limitLabels: Record<string, string> = {
    'events.creations_per_billing_period': 'événements par période',
    'guests.max_per_event': 'invités par événement',
    'collaborators.max_per_event': 'collaborateurs par événement',
    'photos.max_per_event': 'photos par événement',
  };
  const limitsEntries = plan.limits
    ? Object.entries(plan.limits).filter(
        ([, value]) => value !== undefined && value !== null
      )
    : [];

  return (
    <div className="min-h-[60vh] bg-muted/30 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/plans" className="hover:text-foreground transition-colors">
            Plans
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{plan.name}</span>
        </nav>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Finaliser votre abonnement</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Vous avez choisi le plan <strong className="text-foreground">{plan.name}</strong>.
            Complétez le paiement pour activer votre abonnement.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Plan Summary */}
          <div className="lg:col-span-1">
            <Card className={cn('h-full border-2', plan.is_popular && 'border-primary/50 shadow-lg')}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Crown className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.duration_label}</p>
                    </div>
                  </div>
                  {plan.is_popular && (
                    <Badge variant="secondary" className="shrink-0 gap-1">
                      <Sparkles className="h-3 w-3" />
                      Populaire
                    </Badge>
                  )}
                </div>
                {plan.description && (
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <div className="text-3xl font-bold tracking-tight">
                    {plan.price === 0
                      ? 'Gratuit'
                      : `${plan.price.toLocaleString('fr-FR')} FCFA`}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {plan.duration_label}
                  </div>
                </div>

                {(limitsEntries.length > 0 || enabledFeatures.length > 0) && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-foreground">Inclus dans ce plan</h4>
                    <ul className="space-y-2.5">
                      {limitsEntries.map(([key, value]) => (
                        <li key={key} className="flex items-center gap-2.5 text-sm">
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                          <span>
                            {formatLimitValue(value as number)}{' '}
                            {limitLabels[key] ?? PLAN_LIMIT_LABELS[key] ?? key.replace(/\./g, ' ')}
                          </span>
                        </li>
                      ))}
                      {enabledFeatures.map(([key]) => (
                        <li key={key} className="flex items-center gap-2.5 text-sm">
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                          <span>{PLAN_FEATURE_LABELS[key] ?? key.replace(/\./g, ' ')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <Link to="/plans">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Changer de plan
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    2
                  </span>
                  <span className="text-sm font-medium">Étape 2</span>
                </div>
                <CardTitle>Paiement</CardTitle>
                <CardDescription>
                  Saisissez votre numéro de téléphone pour recevoir la demande de paiement Mobile
                  Money (MTN ou Airtel).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscriptionCreated && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Votre abonnement a été créé. Complétez le paiement ci-dessous pour
                      l'activer.
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

                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Paiement sécurisé. Vos données sont protégées.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

