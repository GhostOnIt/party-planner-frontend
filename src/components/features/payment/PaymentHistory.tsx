import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CreditCard, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Payment, PaymentStatus, PaymentMethod } from '@/types';

interface PaymentHistoryProps {
  payments: Payment[];
  isLoading?: boolean;
  onRetry?: (paymentId: number) => void;
}

const statusConfig: Record<
  PaymentStatus,
  { icon: typeof CheckCircle2; color: string; label: string }
> = {
  pending: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    label: 'En attente',
  },
  completed: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800',
    label: 'Complete',
  },
  failed: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    label: 'Echoue',
  },
  refunded: {
    icon: RefreshCw,
    color: 'bg-blue-100 text-blue-800',
    label: 'Rembourse',
  },
};

const methodLabels: Record<PaymentMethod, string> = {
  mtn_mobile_money: 'MTN Mobile Money',
  airtel_money: 'Airtel Money',
};

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

export function PaymentHistory({
  payments,
  isLoading = false,
  onRetry,
}: PaymentHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CreditCard className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">Aucun paiement</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Vous n'avez effectue aucun paiement pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Methode</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => {
            const config = statusConfig[payment.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <TableRow key={payment.id}>
                <TableCell className="whitespace-nowrap">
                  {payment.created_at
                    ? format(parseISO(payment.created_at), 'dd MMM yyyy HH:mm', {
                        locale: fr,
                      })
                    : '-'}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {payment.transaction_reference || '-'}
                </TableCell>
                <TableCell>
                  {payment.payment_method && methodLabels[payment.payment_method]
                    ? methodLabels[payment.payment_method]
                    : payment.payment_method || '-'}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(payment.amount || 0)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={config.color}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {payment.status === 'failed' && onRetry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetry(payment.id)}
                    >
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Reessayer
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
