import { format, parseISO, isPast, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Crown, Calendar, Users, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Subscription } from '@/types';

interface SubscriptionStatusProps {
  subscription: Subscription;
  currentGuests?: number;
  currentCollaborators?: number;
  onUpgrade?: () => void;
  onRenew?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const planNames: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
};

const statusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const statusLabels: Record<string, string> = {
  paid: 'Actif',
  active: 'Actif',
  expired: 'Expiré',
  failed: 'Échoué',
  cancelled: 'Annulé',
  pending: 'En attente',
};

export function SubscriptionStatus({
  subscription,
  currentGuests = 0,
  currentCollaborators = 0,
  onUpgrade,
  onRenew,
  onCancel,
  isLoading = false,
}: SubscriptionStatusProps) {
  // Debug: log subscription data
  console.log('SubscriptionStatus data:', subscription);

  // Use new field names from backend, with fallbacks for legacy fields
  const plan = subscription.plan_type || subscription.plan || 'starter';
  const status = subscription.payment_status || subscription.status || 'pending';

  // Safely parse dates
  const endsAt = subscription.expires_at
    ? parseISO(subscription.expires_at)
    : subscription.ends_at
      ? parseISO(subscription.ends_at)
      : new Date();
  const startsAt = subscription.created_at
    ? parseISO(subscription.created_at)
    : subscription.starts_at
      ? parseISO(subscription.starts_at)
      : new Date();

  const isExpired = isPast(endsAt);
  const daysRemaining = differenceInDays(endsAt, new Date());
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  // Plan limits (Pro = unlimited, Starter = limited)
  const guestLimit = plan === 'pro' ? null : 50;
  const collaboratorLimit = plan === 'pro' ? null : 3;

  const guestUsagePercent = guestLimit
    ? Math.min((currentGuests / guestLimit) * 100, 100)
    : 0;

  const collaboratorUsagePercent = collaboratorLimit
    ? Math.min((currentCollaborators / collaboratorLimit) * 100, 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <CardTitle>Plan {planNames[plan] || plan}</CardTitle>
          </div>
          <Badge className={statusColors[status] || statusColors.pending}>
            {statusLabels[status] || status}
          </Badge>
        </div>
        <CardDescription>
          {isExpired ? (
            <span className="text-destructive">Expire depuis le {format(endsAt, 'dd MMMM yyyy', { locale: fr })}</span>
          ) : (
            <>Valide jusqu'au {format(endsAt, 'dd MMMM yyyy', { locale: fr })}</>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Expiration Warning */}
        {isExpiringSoon && !isExpired && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">
              Votre abonnement expire dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Guest Limit */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Invites
            </span>
            <span>
              {currentGuests} / {guestLimit === null ? '∞' : guestLimit}
            </span>
          </div>
          {guestLimit && (
            <Progress value={guestUsagePercent} className="h-2" />
          )}
        </div>

        {/* Collaborator Limit */}
        {collaboratorLimit !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Collaborateurs
              </span>
              <span>
                {currentCollaborators} / {collaboratorLimit}
              </span>
            </div>
            <Progress value={collaboratorUsagePercent} className="h-2" />
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Debut: {format(startsAt, 'dd/MM/yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Fin: {format(endsAt, 'dd/MM/yyyy')}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {plan === 'starter' && onUpgrade && (
            <Button onClick={onUpgrade} disabled={isLoading}>
              <Crown className="mr-2 h-4 w-4" />
              Passer au Pro
            </Button>
          )}

          {(isExpired || isExpiringSoon) && onRenew && (
            <Button variant="outline" onClick={onRenew} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Renouveler
            </Button>
          )}

          {status === 'paid' && !isExpired && onCancel && (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuler l'abonnement
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
