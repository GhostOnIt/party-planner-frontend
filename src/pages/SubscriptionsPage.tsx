import { useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, CreditCard, Plus } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentHistory } from '@/components/features/payment';
import { useSubscriptions } from '@/hooks/useSubscription';
import { usePayments, useRetryPayment } from '@/hooks/usePayment';
import { useToast } from '@/hooks/use-toast';
import type { Subscription } from '@/types';

const planNames = {
  starter: 'Starter',
  pro: 'Pro',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paid: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
};

const statusLabels: Record<string, string> = {
  active: 'Actif',
  paid: 'Actif',
  expired: 'Expire',
  failed: 'Échoué',
  cancelled: 'Annule',
  pending: 'En attente',
};

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const navigate = useNavigate();

  // Use new field names with fallbacks for compatibility
  const plan = subscription.plan_type || subscription.plan || 'starter';
  const status = subscription.payment_status || subscription.status || 'pending';
  const expiresAtStr = subscription.expires_at || subscription.ends_at;
  const endsAt = expiresAtStr ? parseISO(expiresAtStr) : new Date();
  const isExpired = isPast(endsAt);

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Plan {planNames[plan] || plan}</h3>
                <Badge className={statusColors[status] || statusColors.pending}>
                  {statusLabels[status] || status}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {isExpired ? (
                  <span className="text-destructive">
                    Expire le {format(endsAt, 'dd MMMM yyyy', { locale: fr })}
                  </span>
                ) : (
                  <>Valide jusqu'au {format(endsAt, 'dd MMMM yyyy', { locale: fr })}</>
                )}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/events/${subscription.event_id}`)}
          >
            Voir l'evenement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-28" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

 

export function SubscriptionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'subscriptions';

  const { data: subscriptions = [], isLoading: isLoadingSubscriptions } = useSubscriptions();
  const { data: payments = [], isLoading: isLoadingPayments } = usePayments();
  const { mutate: retryPayment } = useRetryPayment();

  // Filter using new field names with fallbacks
  const getStatus = (s: Subscription): string => s.payment_status || s.status || 'pending';
  const activeSubscriptions = subscriptions.filter((s) => getStatus(s) === 'paid' || getStatus(s) === 'active');
  const expiredSubscriptions = subscriptions.filter((s) => getStatus(s) !== 'paid' && getStatus(s) !== 'active');

  const handleRetryPayment = (paymentId: number) => {
    retryPayment(paymentId, {
      onSuccess: () => {
        toast({
          title: 'Paiement relance',
          description: 'Verifiez votre telephone pour confirmer.',
        });
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Impossible de relancer le paiement.',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Abonnements"
        description="Gerez vos abonnements et paiements"
        actions={
          <Button onClick={() => navigate('/plans')}>
            <Plus className="mr-2 h-4 w-4" />
            Choisir un plan
          </Button>
        }
      />

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="subscriptions">
            <Crown className="mr-2 h-4 w-4" />
            Abonnements ({subscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="mr-2 h-4 w-4" />
            Paiements ({payments.length})
          </TabsTrigger>
          
        </TabsList>

        <TabsContent value="subscriptions" className="mt-6 space-y-6">
          {/* Active Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-green-600" />
                Abonnements actifs
              </CardTitle>
              <CardDescription>
                {activeSubscriptions.length} abonnement{activeSubscriptions.length !== 1 ? 's' : ''} actif{activeSubscriptions.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSubscriptions ? (
                <SubscriptionListSkeleton />
              ) : activeSubscriptions.length === 0 ? (
                <EmptyState
                  icon={Crown}
                  title="Aucun abonnement actif"
                  description="Souscrivez a un plan pour debloquer toutes les fonctionnalites."
                />
              ) : (
                <div className="space-y-4">
                  {activeSubscriptions.map((subscription) => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expired/Cancelled Subscriptions */}
          {expiredSubscriptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <Crown className="h-5 w-5" />
                  Abonnements expires/annules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expiredSubscriptions.map((subscription) => (
                    <SubscriptionCard key={subscription.id} subscription={subscription} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Historique des paiements
              </CardTitle>
              <CardDescription>
                Tous vos paiements Mobile Money
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentHistory
                payments={payments}
                isLoading={isLoadingPayments}
                onRetry={handleRetryPayment}
              />
            </CardContent>
          </Card>
        </TabsContent>

      
      </Tabs>
    </div>
  );
}
