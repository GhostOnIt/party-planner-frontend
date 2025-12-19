import { Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PlanType } from '@/types';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  plan: PlanType;
  price: number;
  currency?: string;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelect?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

// Plan duration in months
const planDurations: Record<PlanType, { months: number; label: string }> = {
  starter: { months: 4, label: '4 mois' },
  pro: { months: 8, label: '8 mois' },
};

const formatCurrency = (amount: number, currency: string) => {
  if (currency === 'XAF' || currency === 'FCFA') {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }
  if (currency === 'EUR') {
    return `${amount.toLocaleString('fr-FR')} €`;
  }
  return `${amount} ${currency}`;
};

const planDetails: Record<PlanType, { name: string; description: string; features: PlanFeature[] }> = {
  starter: {
    name: 'Starter',
    description: 'Pour les petits evenements',
    features: [
      { text: 'Jusqu\'a 50 invites', included: true },
      { text: 'Gestion des taches', included: true },
      { text: 'Suivi du budget', included: true },
      { text: 'Galerie photos (50 max)', included: true },
      { text: 'Collaborateurs illimites', included: false },
      { text: 'Export PDF/Excel', included: false },
      { text: 'Support prioritaire', included: false },
    ],
  },
  pro: {
    name: 'Pro',
    description: 'Pour les grands evenements',
    features: [
      { text: 'Invites illimites', included: true },
      { text: 'Gestion des taches', included: true },
      { text: 'Suivi du budget', included: true },
      { text: 'Galerie photos illimitee', included: true },
      { text: 'Collaborateurs illimites', included: true },
      { text: 'Export PDF/Excel', included: true },
      { text: 'Support prioritaire', included: true },
    ],
  },
};

export function PlanCard({
  plan,
  price,
  currency = 'XAF',
  isCurrentPlan = false,
  isPopular = false,
  onSelect,
  isLoading = false,
  disabled = false,
}: PlanCardProps) {
  const details = planDetails[plan];

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        isPopular && 'border-primary shadow-lg',
        isCurrentPlan && 'border-green-500 bg-green-50/50'
      )}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Populaire
        </Badge>
      )}
      {isCurrentPlan && (
        <Badge variant="outline" className="absolute -top-3 left-1/2 -translate-x-1/2 border-green-500 text-green-700">
          Plan actuel
        </Badge>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{details.name}</CardTitle>
        <CardDescription>{details.description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">{formatCurrency(price, currency)}</span>
          <span className="text-muted-foreground text-sm">/evenement</span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Valide {planDurations[plan].label}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {details.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
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

      <CardFooter>
        <Button
          className="w-full"
          variant={isPopular ? 'default' : 'outline'}
          onClick={onSelect}
          disabled={isCurrentPlan || isLoading || disabled}
        >
          {isLoading
            ? 'Chargement...'
            : isCurrentPlan
            ? 'Plan actuel'
            : 'Choisir ce plan'}
        </Button>
      </CardFooter>
    </Card>
  );
}
