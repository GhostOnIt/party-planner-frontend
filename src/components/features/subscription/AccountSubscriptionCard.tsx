import { format, parseISO, differenceInDays, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import {
  Crown,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Gift,
  Infinity,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentSubscription } from '@/hooks/useSubscription';
import { formatLimitValue } from '@/hooks/useAdminPlans';

export function AccountSubscriptionCard() {
  const { data, isLoading } = useCurrentSubscription();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const subscription = data?.subscription;
  const quota = data?.quota;
  const hasSubscription = data?.has_subscription;

  // No subscription
  if (!hasSubscription || !subscription) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-muted-foreground" />
            Abonnement
          </CardTitle>
          <CardDescription>Aucun abonnement actif</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Activez un plan pour créer plus d'événements et accéder à toutes les fonctionnalités.
            </p>
            <Button asChild className="w-full">
              <Link to="/plans">
                Voir les plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const plan = subscription.plan || null;
  // @ts-ignore - plan may have name property
  const planName = plan?.name || subscription.plan_type || 'Inconnu';
  // @ts-ignore - plan may have is_trial property
  const isTrial = plan?.is_trial || subscription.status === 'trial';
  const expiresAt = subscription.expires_at ? parseISO(subscription.expires_at) : null;
  const isExpired = expiresAt ? isPast(expiresAt) : false;
  const daysRemaining = expiresAt ? differenceInDays(expiresAt, new Date()) : 0;
  const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0 && !isExpired;

  // Quota info
  const quotaUsed = quota?.used || 0;
  const quotaRemaining = quota?.remaining || 0;
  const isUnlimited = quota?.is_unlimited || false;
  const quotaPercentage = quota?.percentage_used || 0;

  // Get events limit from plan
  // @ts-ignore - plan may have limits property
  const eventsLimit = plan?.limits?.['events.creations_per_billing_period'] || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isTrial ? (
                <Gift className="h-5 w-5 text-blue-600" />
              ) : (
                <Crown className="h-5 w-5 text-primary" />
              )}
              Mon abonnement
            </CardTitle>
            <CardDescription className="mt-1">
              {isTrial ? 'Essai gratuit' : 'Plan actif'}
            </CardDescription>
          </div>
          <Badge
            variant={isTrial ? 'outline' : 'default'}
            className={isTrial ? 'border-blue-300 text-blue-600' : ''}
          >
            {planName}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Expiration Warning */}
        {isExpiringSoon && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-800 border border-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Votre {isTrial ? 'essai' : 'abonnement'} expire dans {daysRemaining} jour
              {daysRemaining > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {isExpired && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-800 border border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Votre {isTrial ? 'essai' : 'abonnement'} a expiré
            </span>
          </div>
        )}

        {/* Quota d'événements */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Événements créés</span>
            <span className="text-muted-foreground">
              {quotaUsed} /{' '}
              {isUnlimited ? (
                <span className="flex items-center gap-1">
                  <Infinity className="h-4 w-4" />
                  Illimité
                </span>
              ) : (
                formatLimitValue(eventsLimit)
              )}
            </span>
          </div>
          {!isUnlimited && (
            <>
              <Progress value={quotaPercentage} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {quotaRemaining > 0
                    ? `${quotaRemaining} événement${quotaRemaining > 1 ? 's' : ''} restant${quotaRemaining > 1 ? 's' : ''}`
                    : 'Quota atteint'}
                </span>
                {quotaPercentage >= 80 && quotaRemaining > 0 && (
                  <span className="text-yellow-600 font-medium">⚠️ Quota presque atteint</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Expiration Date */}
        {expiresAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Calendar className="h-4 w-4" />
            <span>
              {isExpired
                ? `Expiré le ${format(expiresAt, 'dd MMMM yyyy', { locale: fr })}`
                : `Expire le ${format(expiresAt, 'dd MMMM yyyy', { locale: fr })}`}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          {isTrial && !isExpired && (
            <Button asChild variant="default" className="w-full">
              <Link to="/plans">
                <TrendingUp className="mr-2 h-4 w-4" />
                Passer à un plan payant
              </Link>
            </Button>
          )}

          {!isTrial && !isExpired && (
            <Button asChild variant="outline" className="w-full">
              <Link to="/plans">
                <TrendingUp className="mr-2 h-4 w-4" />
                Upgrade
              </Link>
            </Button>
          )}

          {isExpired && (
            <Button asChild variant="default" className="w-full">
              <Link to="/plans">
                Renouveler mon abonnement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}

          <Button asChild variant="ghost" className="w-full">
            <Link to="/subscriptions">Gérer mon abonnement</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
