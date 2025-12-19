import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  UserPlus,
  CalendarPlus,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PageHeader } from '@/components/layout/page-header';
import { useAdminStats, useAdminUsers, useAdminPayments } from '@/hooks/useAdmin';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount);
}

const paymentStatusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers({ per_page: 5 });
  const { data: paymentsData, isLoading: paymentsLoading } = useAdminPayments({ per_page: 5 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Vue d'ensemble de la plateforme"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilisateurs</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.users?.total || 0}</p>
              )}
              {stats?.users?.new_this_month ? (
                <p className="text-xs text-muted-foreground">
                  +{stats.users.new_this_month} ce mois
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-event-mariage/10">
              <Calendar className="h-6 w-6 text-event-mariage" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Evenements</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.events?.total || 0}</p>
              )}
              {stats?.events?.active ? (
                <p className="text-xs text-muted-foreground">
                  {stats.events.active} actifs
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
              <CreditCard className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Abonnements</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.subscriptions?.total || 0}</p>
              )}
              {stats?.subscriptions?.active ? (
                <p className="text-xs text-muted-foreground">
                  {stats.subscriptions.active} actifs
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenus</p>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">
                  {formatCurrency(stats?.revenue?.total || 0)}
                </p>
              )}
              {stats?.revenue?.this_month ? (
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.revenue.this_month)} ce mois
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Derniers utilisateurs</CardTitle>
              <CardDescription>Inscriptions recentes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/users">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-1 h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : usersData?.data?.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <UserPlus className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Aucun utilisateur pour le moment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {usersData?.data?.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(parseISO(user.created_at), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Derniers paiements</CardTitle>
              <CardDescription>Transactions recentes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/payments">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="mt-1 h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : paymentsData?.data?.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CreditCard className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Aucun paiement pour le moment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentsData?.data?.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {payment.subscription?.event?.user?.name || 'Utilisateur inconnu'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(payment.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                      <Badge className={paymentStatusColors[payment.status] || ''}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Events by Type (if available) */}
      {stats?.events?.by_type && Object.keys(stats.events.by_type).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evenements par type</CardTitle>
            <CardDescription>Repartition des evenements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {Object.entries(stats.events.by_type).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2"
                >
                  <CalendarPlus className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{type.replace('_', ' ')}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
