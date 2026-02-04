import { useState } from 'react';
import { Check, Crown, Gift, Building2, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePlans, PLAN_FEATURE_LABELS, formatLimitValue } from '@/hooks/useAdminPlans';
import { useSubscribeToPlan } from '@/hooks/useSubscription';
import type { Plan } from '@/hooks/useAdminPlans';
import { useNavigate } from 'react-router-dom';

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

// Get icon and colors for plan
function getPlanStyle(plan: Plan, isPopular: boolean) {
  if (plan.is_trial) {
    return {
      icon: Gift,
      primaryColor: 'from-slate-600 to-slate-700',
      accentColor: 'slate',
    };
  }

  // Determine colors based on plan name or price
  const planName = plan.name.toLowerCase();
  if (planName.includes('pro') || isPopular) {
    return {
      icon: Crown,
      primaryColor: 'from-[#4F46E5] to-[#7C3AED]',
      accentColor: 'indigo',
    };
  }

  if (planName.includes('agence') || planName.includes('entreprise')) {
    return {
      icon: Building2,
      primaryColor: 'from-[#E91E8C] to-[#C2185B]',
      accentColor: 'pink',
    };
  }

  // Default
  return {
    icon: Crown,
    primaryColor: 'from-[#4F46E5] to-[#7C3AED]',
    accentColor: 'indigo',
  };
}

interface PricingCardProps {
  plan: Plan;
  isPopular: boolean;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function PricingCard({ plan, isPopular, isHovered, onMouseEnter, onMouseLeave }: PricingCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: subscribeToPlan, isPending: isSubscribing } = useSubscribeToPlan();

  // Get enabled features (only those that have a label, to hide deprecated ones like planning.enabled, support.dedicated, assistance.human)
  const enabledFeatures = Object.entries(plan.features || {})
    .filter(([key, enabled]) => enabled && PLAN_FEATURE_LABELS[key])
    .map(([key]) => key);

  // Get key limits
  const eventsLimit = plan.limits?.['events.creations_per_billing_period'];
  const guestsLimit = plan.limits?.['guests.max_per_event'];
  const collaboratorsLimit = plan.limits?.['collaborators.max_per_event'];

  const planStyle = getPlanStyle(plan, isPopular);
  const Icon = planStyle.icon;

  const stats = [];
  if (eventsLimit !== undefined) {
    stats.push({ label: 'Événements', value: formatLimitValue(eventsLimit) });
  }
  if (guestsLimit !== undefined) {
    stats.push({ label: 'Invités par événement', value: formatLimitValue(guestsLimit) });
  }
  if (collaboratorsLimit !== undefined) {
    stats.push({ label: 'Collaborateurs', value: formatLimitValue(collaboratorsLimit) });
  }

  const handleSelectPlan = () => {
    if (plan.is_trial && plan.price === 0) {
      // Trial plan - subscribe directly (no payment needed)
      subscribeToPlan(
        { plan_id: plan.id },
        {
          onSuccess: () => {
            toast({
              title: 'Essai gratuit activé',
              description: 'Votre essai gratuit a été activé avec succès.',
            });
            navigate('/dashboard');
          },
          onError: (error: unknown) => {
            const errorMessage =
              (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
              "Impossible d'activer l'essai gratuit.";
            toast({
              title: 'Erreur',
              description: errorMessage,
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      // Paid plan - navigate to subscribe page
      navigate(`/subscribe/${plan.slug}`);
    }
  };

  const getCtaText = () => {
    if (isSubscribing) return 'Traitement...';
    if (plan.is_trial) return "Activer l'essai gratuit";
    if (plan.price === 0) return 'Commencer';
    return `Choisir ${plan.name}`;
  };

  return (
    <Card
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'relative bg-white border-slate-200 overflow-hidden transition-all duration-300',
        isPopular
          ? 'md:scale-105 border-[#4F46E5] shadow-2xl shadow-[#4F46E5]/10 ring-2 ring-[#4F46E5]/20'
          : isHovered
            ? 'border-slate-300 shadow-xl'
            : 'shadow-lg'
      )}
    >
      {/* Badge for popular plan */}
      {isPopular && (
        <div className="absolute top-0 right-0 left-0">
          <div className={cn('h-1 bg-gradient-to-r', planStyle.primaryColor)} />
          <div className="flex justify-center -mt-3">
            <div
              className={cn(
                'px-4 py-1 rounded-full bg-gradient-to-r text-white text-sm font-medium shadow-lg',
                planStyle.primaryColor
              )}
            >
              Le plus populaire
            </div>
          </div>
        </div>
      )}

      {/* Badge for trial */}
      {plan.is_trial && (
        <div className="absolute top-0 right-0 left-0">
          <div className="h-1 bg-gradient-to-r from-slate-600 to-slate-700" />
          <div className="flex justify-center -mt-3">
            <div className="px-4 py-1 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 text-white text-sm font-medium shadow-lg">
              Essai gratuit
            </div>
          </div>
        </div>
      )}

      <div className={cn('p-6', (isPopular || plan.is_trial) && 'pt-10')}>
        {/* Icon */}
        <div className="mb-4">
          <div
            className={cn(
              'inline-flex p-2.5 rounded-lg bg-gradient-to-br shadow-sm',
              planStyle.primaryColor
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Plan Name & Description */}
        <div className="mb-5">
          <h3 className="text-xl font-bold mb-1.5 text-slate-900">{plan.name}</h3>
          <p className="text-xs text-slate-600 text-balance leading-relaxed">{plan.description || ''}</p>
        </div>

        {/* Pricing */}
        <div className="mb-5">
          <div className="flex items-baseline gap-1.5">
            {plan.price === 0 ? (
              <>
                <span className="text-4xl font-bold text-slate-900">Gratuit</span>
                <span className="text-xs text-slate-500 ml-1.5">{plan.duration_label}</span>
              </>
            ) : (
              <>
                <span className="text-4xl font-bold text-slate-900">
                  {plan.price.toLocaleString('fr-FR')}
                </span>
                <span className="text-base text-slate-600">FCFA</span>
                <span className="text-xs text-slate-500">{plan.duration_label}</span>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="mb-5 p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
            {stats.map((stat) => (
              <div key={stat.label} className="flex justify-between items-center text-xs">
                <span className="text-slate-600">{stat.label}</span>
                <span className="font-semibold text-slate-900">{stat.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <Button
          className={cn(
            'w-full mb-5 group transition-all duration-300',
            isPopular
              ? cn('bg-gradient-to-r text-white shadow-lg hover:shadow-xl', planStyle.primaryColor, 'hover:opacity-90')
              : 'bg-slate-900 text-white hover:bg-slate-800'
          )}
          size="default"
          onClick={handleSelectPlan}
          disabled={isSubscribing}
        >
          {getCtaText()}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Features List */}
        <div className="space-y-2.5">
          {enabledFeatures.slice(0, 8).map((featureKey) => (
            <div key={featureKey} className="flex items-start gap-2.5">
              <div className="shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-[#4F46E5]" />
              </div>
              <span className="text-xs text-slate-700 leading-relaxed">{getFeatureText(featureKey, plan)}</span>
            </div>
          ))}
          {enabledFeatures.length > 8 && (
            <div className="pt-1.5">
              <span className="text-xs text-[#E91E8C] font-medium">
                + {enabledFeatures.length - 8} autres fonctionnalités
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

const faqs = [
  {
    question: 'Comment fonctionne la facturation ?',
    answer:
      "Chaque plan est facturé mensuellement. Vous bénéficiez de toutes les fonctionnalités incluses pendant la durée de votre abonnement. L'essai gratuit est disponible une seule fois par compte et peut être activé depuis cette page.",
  },
  {
    question: 'Puis-je changer de plan ?',
    answer:
      'Oui, vous pouvez passer à un plan supérieur à tout moment. La différence de prix sera calculée au prorata de la durée restante.',
  },
  {
    question: 'Quels modes de paiement acceptez-vous ?',
    answer:
      'Nous acceptons les paiements via MTN Mobile Money et Airtel Money. Le paiement est sécurisé et confirmé instantanément.',
  },
  {
    question: 'Que se passe-t-il à la fin de mon abonnement ?',
    answer:
      "À la fin de votre abonnement, vous conservez l'accès en lecture à vos données mais ne pouvez plus ajouter d'invités ou modifier l'événement. Vous pouvez renouveler à tout moment.",
  },
  {
    question: 'Puis-je annuler mon abonnement à tout moment ?',
    answer:
      "Oui, vous pouvez annuler votre abonnement à tout moment depuis les paramètres de votre compte. Aucun frais d'annulation ne sera appliqué.",
  },
];

export function PlansPage() {
  const { data: plansData, isLoading, error } = usePlans();
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  // Ensure plans is always an array
  const plans = Array.isArray(plansData) ? plansData : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <Skeleton className="h-12 w-64 mx-auto mb-8" />
            <Skeleton className="h-16 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
          </div>
        </section>
        <section className="px-4 pb-20">
          <div className="container mx-auto max-w-7xl">
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-8">
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-12 w-full" />
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-xl mb-2">Erreur lors du chargement des plans.</p>
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#4F46E5]/5 to-[#7C3AED]/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-[#E91E8C]/5 to-[#C2185B]/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">
          {/* Top Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="p-1 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#C2185B]">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">
                Tarification simple et transparente
              </span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-5 text-balance tracking-tight">
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#E91E8C] bg-clip-text text-transparent">
                Plans tarifaires
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto text-balance leading-relaxed">
              Commencez immédiatement gratuitement. Passez à un plan supérieur pour plus de
              fonctionnalités, d'événements et de collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-20">
        <div className="container mx-auto max-w-6xl">
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Aucun plan disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const isPopular = plan.is_popular ?? false;
                return (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    isPopular={isPopular}
                    isHovered={hoveredPlan === plan.id}
                    onMouseEnter={() => setHoveredPlan(plan.id)}
                    onMouseLeave={() => setHoveredPlan(null)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-20 bg-slate-50">
        <div className="container mx-auto max-w-3xl">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent">
              Questions fréquentes
            </h2>
            <p className="text-slate-600">Trouvez les réponses aux questions les plus courantes</p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-slate-200 rounded-lg bg-white shadow-sm px-6 data-[state=open]:shadow-md data-[state=open]:border-[#4F46E5]/30"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="font-semibold text-lg text-slate-900">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-slate-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

         
        </div>
      </section>
    </div>
  );
}