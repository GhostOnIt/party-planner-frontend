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
import { useMyQuoteRequests } from '@/hooks/useQuoteRequests';
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
  const { data: myQuoteRequests = [], isLoading: isLoadingQuoteRequests } = useMyQuoteRequests();
  const { mutate: retryPayment } = useRetryPayment();

  // Filter using new field names with fallbacks
  const getStatus = (s: Subscription): string => s.payment_status || s.status || 'pending';
  const activeSubscriptions = subscriptions.filter((s) => getStatus(s) === 'paid' || getStatus(s) === 'active');
  const expiredSubscriptions = subscriptions.filter((s) => getStatus(s) !== 'paid' && getStatus(s) !== 'active');

  const handleRetryPayment = (paymentId: string) => {
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

  const formatTrackingDate = (value?: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activityLabel = (activityType: string, fallback?: string | null) => {
    if (fallback) return fallback;
    const labels: Record<string, string> = {
      created: 'Demande enregistrée',
      stage_changed: 'Étape mise à jour',
      assigned: 'Demande assignée',
      note_added: 'Note interne ajoutée',
      call_scheduled: 'Call planifié',
      outcome_updated: 'Issue commerciale mise à jour',
    };
    return labels[activityType] ?? activityType;
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
          <TabsTrigger value="business-requests">Demandes Business ({myQuoteRequests.length})</TabsTrigger>
          
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

        <TabsContent value="business-requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Suivi des demandes Business</CardTitle>
              <CardDescription>Consultez l’état de vos demandes de devis personnalisées.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingQuoteRequests ? (
                <SubscriptionListSkeleton />
              ) : myQuoteRequests.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="Aucune demande Business"
                  description="Soumettez une demande depuis la page des plans pour être accompagné."
                />
              ) : (
                <div className="space-y-3">
                  {myQuoteRequests.map((item) => {
                    const trackingUrl = `${globalThis.location.origin}/subscriptions?tab=business-requests`;
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(trackingUrl)}`;

                    return (
                      <div key={item.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold">{item.company_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Code: {item.tracking_code} - Étape: {item.current_stage?.name ?? 'N/A'}
                            </p>
                            <p className="mt-2 text-sm">{item.business_needs}</p>

                            <div className="mt-4 rounded-md border bg-muted/20 p-3">
                              <p className="text-sm font-medium">Suivi de la demande</p>
                              <div className="mt-2 space-y-3">
                                {(item.activities ?? [])
                                  .slice()
                                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                  .map((activity) => (
                                    <div key={activity.id} className="flex gap-2">
                                      <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-primary" />
                                      <div>
                                        <p className="text-sm font-medium">
                                          {activityLabel(activity.activity_type, activity.message)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {formatTrackingDate(activity.created_at)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                {(item.activities ?? []).length === 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    Votre demande est en cours de prise en charge.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <img src={qrUrl} alt="QR de suivi" className="h-[100px] w-[100px] rounded border" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      
      </Tabs>
    </div>
  );
}
