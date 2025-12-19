import { Link } from 'react-router-dom';
import { Crown, Check, ArrowRight, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';
import type { PlanType } from '@/types';

// Pricing configuration
const isSandbox = import.meta.env.VITE_PAYMENT_ENV === 'sandbox';
const planPrices: Record<PlanType, number> = isSandbox
  ? { starter: 150, pro: 300 }
  : { starter: 5000, pro: 15000 };
const currency = isSandbox ? 'EUR' : 'XAF';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: number;
  duration: string;
  durationMonths: number;
  features: PlanFeature[];
  isPopular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Ideal pour les petits evenements et les premiers pas',
    price: planPrices.starter,
    duration: '4 mois',
    durationMonths: 4,
    features: [
      { text: 'Jusqu\'a 50 invites', included: true },
      { text: 'Gestion complete des taches', included: true },
      { text: 'Suivi du budget detaille', included: true },
      { text: 'Galerie photos (50 max)', included: true },
      { text: '2 collaborateurs inclus', included: true },
      { text: 'Notifications par email', included: true },
      { text: 'Collaborateurs illimites', included: false },
      { text: 'Export PDF/Excel', included: false },
      { text: 'Support prioritaire', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les grands evenements avec toutes les fonctionnalites',
    price: planPrices.pro,
    duration: '8 mois',
    durationMonths: 8,
    isPopular: true,
    features: [
      { text: 'Invites illimites', included: true },
      { text: 'Gestion complete des taches', included: true },
      { text: 'Suivi du budget detaille', included: true },
      { text: 'Galerie photos illimitee', included: true },
      { text: 'Collaborateurs illimites', included: true },
      { text: 'Notifications par email', included: true },
      { text: 'Export PDF et Excel', included: true },
      { text: 'Support prioritaire 24/7', included: true },
      { text: 'Acces aux statistiques avancees', included: true },
    ],
  },
];

const formatCurrency = (amount: number, curr: string) => {
  if (curr === 'XAF' || curr === 'FCFA') {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }
  if (curr === 'EUR') {
    return `${amount.toLocaleString('fr-FR')} €`;
  }
  return `${amount} ${curr}`;
};

function PricingCard({ plan }: { plan: Plan }) {
  return (
    <Card
      className={cn(
        'relative flex flex-col h-full',
        plan.isPopular && 'border-primary border-2 shadow-lg scale-105'
      )}
    >
      {plan.isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          Le plus populaire
        </Badge>
      )}

      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Crown className={cn('h-8 w-8', plan.isPopular ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Price */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">{formatCurrency(plan.price, currency)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">par evenement</p>
          <div className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Valide {plan.duration}</span>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5',
                  feature.included
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {feature.included && <Check className="h-3 w-3" />}
              </div>
              <span
                className={cn(
                  'text-sm',
                  !feature.included && 'text-muted-foreground line-through'
                )}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          className="w-full"
          variant={plan.isPopular ? 'default' : 'outline'}
          size="lg"
          asChild
        >
          <Link to="/subscriptions?tab=activate">
            Choisir {plan.name}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PlansPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Nos plans tarifaires"
        description="Choisissez le plan adapte a votre evenement"
      />

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>

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
              Chaque plan est facture par evenement. Vous payez une seule fois et beneficiez de toutes les fonctionnalites pendant la duree du plan (4 ou 8 mois selon le plan choisi).
            </p>
          </div>
          <div>
            <h4 className="font-medium">Puis-je changer de plan ?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Oui, vous pouvez passer du plan Starter au plan Pro a tout moment. La difference de prix sera calculee au prorata de la duree restante.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Quels modes de paiement acceptez-vous ?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Nous acceptons les paiements via MTN Mobile Money et Airtel Money. Le paiement est securise et confirme instantanement.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Que se passe-t-il a la fin de mon abonnement ?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              A la fin de votre abonnement, vous conservez l'acces en lecture a vos donnees mais ne pouvez plus ajouter d'invites ou modifier l'evenement. Vous pouvez renouveler a tout moment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">Pret a organiser votre evenement ?</h2>
        <p className="text-muted-foreground mb-6">
          Creez votre premier evenement gratuitement et activez un plan quand vous etes pret.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/events/create">
              Creer un evenement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/subscriptions">
              Voir mes abonnements
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
