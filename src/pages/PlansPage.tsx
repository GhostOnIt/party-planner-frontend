import { Link, useNavigate } from 'react-router-dom';
import { Crown, Check, ArrowRight, Calendar, Clock, Gift, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';
import {
  usePlans,
  PLAN_FEATURE_LABELS,
  PLAN_LIMIT_LABELS,
  formatLimitValue,
} from '@/hooks/useAdminPlans';
import type { Plan } from '@/hooks/useAdminPlans';

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

// Helper to get feature display text
function getFeatureText(featureKey: string, plan: Plan): string {
  const label = PLAN_FEATURE_LABELS[featureKey];
  if (label) return label;

  // Fallback for limit-based features
  if (featureKey.includes('guests.max_per_event')) {
    const limit = plan.limits?.['guests.max_per_event'];
    return `Invités ${formatLimitValue(limit)} par événement`;
  }
  if (featureKey.includes('collaborators.max_per_event')) {
    const limit = plan.limits?.['collaborators.max_per_event'];
    return `Collaborateurs ${formatLimitValue(limit)} par événement`;
  }
  if (featureKey.includes('events.creations_per_billing_period')) {
    const limit = plan.limits?.['events.creations_per_billing_period'];
    return `${formatLimitValue(limit)} événements par période`;
  }

  return featureKey;
}

function PricingCard({ plan, isPopular = false }: { plan: Plan; isPopular?: boolean }) {
  const navigate = useNavigate();

  // Get enabled features
  const enabledFeatures = Object.entries(plan.features || {})
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key);

  // Get key limits
  const eventsLimit = plan.limits?.['events.creations_per_billing_period'];
  const guestsLimit = plan.limits?.['guests.max_per_event'];
  const collaboratorsLimit = plan.limits?.['collaborators.max_per_event'];

  const handleSelectPlan = () => {
    if (plan.is_trial) {
      // Trial is auto-assigned, redirect to dashboard
      navigate('/dashboard');
    } else {
      // Navigate to subscribe page
      navigate(`/subscribe/${plan.slug}`);
    }
  };

  return (
    <Card
      className={cn(
        'relative flex flex-col h-full',
        isPopular && 'border-primary border-2 shadow-lg scale-105'
      )}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          Le plus populaire
        </Badge>
      )}

      {plan.is_trial && (
        <Badge className="absolute -top-3 right-4 bg-blue-100 text-blue-800 border-blue-300">
          Essai gratuit
        </Badge>
      )}

      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {plan.is_trial ? (
            <Gift className="h-8 w-8 text-blue-600" />
          ) : (
            <Crown
              className={cn('h-8 w-8', isPopular ? 'text-primary' : 'text-muted-foreground')}
            />
          )}
        </div>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="min-h-[40px]">{plan.description || ''}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Price */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">
              {plan.price === 0 ? 'Gratuit' : formatCurrency(plan.price)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">par mois</p>
          <div className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{plan.duration_label}</span>
          </div>
        </div>

        {/* Key Limits */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-3">
          {eventsLimit !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span>Événements</span>
              <span className="font-medium">{formatLimitValue(eventsLimit)}</span>
            </div>
          )}
          {guestsLimit !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span>Invités par événement</span>
              <span className="font-medium">{formatLimitValue(guestsLimit)}</span>
            </div>
          )}
          {collaboratorsLimit !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span>Collaborateurs</span>
              <span className="font-medium">{formatLimitValue(collaboratorsLimit)}</span>
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {enabledFeatures.slice(0, 8).map((featureKey) => (
            <li key={featureKey} className="flex items-start gap-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5 bg-primary/10 text-primary">
                <Check className="h-3 w-3" />
              </div>
              <span className="text-sm">{getFeatureText(featureKey, plan)}</span>
            </li>
          ))}
          {enabledFeatures.length > 8 && (
            <li className="text-xs text-muted-foreground text-center">
              + {enabledFeatures.length - 8} autres fonctionnalités
            </li>
          )}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          className="w-full"
          variant={isPopular ? 'default' : 'outline'}
          size="lg"
          onClick={handleSelectPlan}
          disabled={plan.is_trial}
        >
          {plan.is_trial ? (
            <>Déjà inclus</>
          ) : plan.price === 0 ? (
            <>
              Commencer
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Choisir {plan.name}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PlansPage() {
  const { data: plansData, isLoading, error } = usePlans();
  const plans = plansData || [];

  // Filter out trial plan from pricing (it's auto-assigned)
  const paidPlans = plans.filter((p) => !p.is_trial && p.is_active);

  // Debug: log plans data
  if (process.env.NODE_ENV === 'development') {
    console.log('Plans data:', { plansData, plans, paidPlans, isLoading, error });
  }

  // Find popular plan (usually the middle one or PRO)
  const popularPlanIndex = paidPlans.length > 1 ? Math.floor(paidPlans.length / 2) : -1;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Nos plans tarifaires"
          description="Choisissez le plan adapté à vos besoins"
        />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Nos plans tarifaires"
          description="Choisissez le plan adapté à vos besoins"
        />
        <div className="text-center py-12">
          <p className="text-destructive">Erreur lors du chargement des plans.</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : String(error)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nos plans tarifaires"
        description="Choisissez le plan adapté à vos besoins"
      />

      {/* Pricing Cards */}
      {paidPlans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun plan disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {paidPlans.map((plan, index) => (
            <PricingCard key={plan.id} plan={plan} isPopular={index === popularPlanIndex} />
          ))}
        </div>
      )}

      {/* FAQ / Additional Info */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Questions frequentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Comment fonctionne la facturation ?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Chaque plan est facturé mensuellement. Vous bénéficiez de toutes les fonctionnalités
              incluses pendant la durée de votre abonnement. L'essai gratuit de 14 jours est
              automatiquement activé à l'inscription.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Puis-je changer de plan ?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Oui, vous pouvez passer à un plan supérieur à tout moment. La différence de prix sera
              calculée au prorata de la durée restante.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Quels modes de paiement acceptez-vous ?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Nous acceptons les paiements via MTN Mobile Money et Airtel Money. Le paiement est
              securise et confirme instantanement.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Que se passe-t-il a la fin de mon abonnement ?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              A la fin de votre abonnement, vous conservez l'acces en lecture a vos donnees mais ne
              pouvez plus ajouter d'invites ou modifier l'evenement. Vous pouvez renouveler a tout
              moment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">Prêt à organiser vos événements ?</h2>
        <p className="text-muted-foreground mb-6">Choisissez le plan qui vous convient.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/events/create">
              Créer un événement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/subscriptions">Voir mon abonnement</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
