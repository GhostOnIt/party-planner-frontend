import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, CreditCard, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PerPageSelector } from '@/components/ui/per-page-selector';
import { PageHeader } from '@/components/layout/page-header';
import { useAdminPayments, useAdminStats } from '@/hooks/useAdmin';
import type { AdminPaymentFilters, PaymentStatus, PaymentMethod } from '@/types';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount);
}

const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: 'En attente',
  completed: 'Complete',
  failed: 'Echoue',
  refunded: 'Rembourse',
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  mtn_mobile_money: 'MTN Mobile Money',
  airtel_money: 'Airtel Money',
};

const paymentMethodColors: Record<PaymentMethod, string> = {
  mtn_mobile_money: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  airtel_money: 'bg-red-50 text-red-700 border-red-200',
};

export function AdminPaymentsPage() {
  const [filters, setFilters] = useState<AdminPaymentFilters>({
    page: 1,
    per_page: 20,
  });
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useAdminPayments(filters);
  const { data: stats } = useAdminStats();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters((prev) => {
        const { status: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    } else {
      setFilters((prev) => ({ ...prev, status: status as PaymentStatus, page: 1 }));
    }
  };

  const handleMethodFilter = (method: string) => {
    if (method === 'all') {
      setFilters((prev) => {
        const { method: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    } else {
      setFilters((prev) => ({ ...prev, method: method as PaymentMethod, page: 1 }));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        description="Historique des transactions"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total encaisse </div>
            <div className="text-2xl font-bold">{formatCurrency(stats?.revenue?.total ?? 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Paiements </div>
            <div className="text-2xl font-bold">{stats?.revenue?.count ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">En attente </div>
            <div className="text-2xl font-bold">{stats?.revenue?.pending_count ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par reference ou telephone..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(paymentStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.method || 'all'}
              onValueChange={handleMethodFilter}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Methode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les methodes</SelectItem>
                {Object.entries(paymentMethodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>Rechercher</Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des paiements</CardTitle>
          <CardDescription>
            {data?.total || 0} paiement(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Aucun paiement trouve</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Methode</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm">{payment.transaction_reference}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {(payment.metadata?.phone_number as string) || "-"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const user =
                            payment.subscription?.event?.user ?? payment.subscription?.user;
                          return user ? (
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Utilisateur inconnu
                            </span>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        {payment.payment_method ? (
                          <Badge
                            variant="outline"
                            className={paymentMethodColors[payment.payment_method]}
                          >
                            {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentStatusColors[payment.status]}>
                          {paymentStatusLabels[payment.status] || payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(payment.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data && (data.total > 0 || (data.last_page ?? 0) > 1) && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <PerPageSelector
                value={filters.per_page || 20}
                onChange={(value) => setFilters((prev) => ({ ...prev, per_page: value, page: 1 }))}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data?.current_page === 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                >
                  Precedent
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {data?.current_page} sur {data?.last_page || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data?.current_page === data?.last_page || data?.last_page === 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
