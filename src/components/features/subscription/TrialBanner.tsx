import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAvailableTrial } from '@/hooks/useAdminPlans';
import { useSubscribeToPlan } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { formatLimitValue } from '@/hooks/useAdminPlans';
import { useState } from 'react';

export function TrialBanner() {
  const { data: trialData, isLoading } = useAvailableTrial();
  const subscribeMutation = useSubscribeToPlan();
  const { toast } = useToast();
  const [isSubscribing, setIsSubscribing] = useState(false);

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-muted/20 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No trial available (already used or doesn't exist)
  if (!trialData?.available || !trialData.data) {
    return null;
  }

  const trialPlan = trialData.data;

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      await subscribeMutation.mutateAsync({ plan_id: trialPlan.id });
      toast({
        title: 'Essai gratuit activé',
        description: `Votre essai gratuit de ${trialPlan.duration_label} a été activé avec succès.`,
      });
      // Refresh the page to show updated subscription
      window.location.reload();
    } catch (error: unknown) {
      toast({
        title: 'Erreur',
        description:
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Impossible d'activer l'essai gratuit.",
        variant: 'destructive',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  // Get key limits for display
  const eventsLimit = trialPlan.limits?.['events.creations_per_billing_period'];
  const guestsLimit = trialPlan.limits?.['guests.max_per_event'];

  return (
    <Card className="relative overflow-hidden border-primary/10 bg-gradient-to-br from-card to-primary/5 shadow-sm transition-all hover:shadow-md">
      {/* Decorative background element - subtle */}
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

      <CardContent className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Démarrez votre essai gratuit de {trialPlan.duration_label}
              </h3>
              <p className="text-sm text-muted-foreground">
                Profitez de toutes les fonctionnalités premium pour organiser votre premier
                événement sans engagement.
              </p>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/80">
                {eventsLimit !== undefined && (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {formatLimitValue(eventsLimit)} événement{eventsLimit > 1 ? 's' : ''}
                  </span>
                )}
                {guestsLimit !== undefined && (
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {formatLimitValue(guestsLimit)} invités
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Gestion budget & tâches
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <Button
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className="w-full sm:w-auto shadow-sm"
            >
              {isSubscribing ? 'Activation...' : "Commencer l'essai"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
            >
              <Link to="/plans">Voir les offres</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
