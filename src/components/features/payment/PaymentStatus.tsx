import { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Loader2, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';
import { usePollPaymentStatus } from '@/hooks/usePayment';
import type { PaymentStatus as PaymentStatusType } from '@/types';

interface PaymentStatusProps {
  paymentId: number;
  onSuccess?: () => void;
  onFailure?: () => void;
  onRetry?: () => void;
}

const statusConfig: Record<
  PaymentStatusType,
  { icon: typeof CheckCircle2; color: string; bgColor: string; label: string; description: string }
> = {
  pending: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: 'En attente',
    description: 'Veuillez confirmer le paiement sur votre telephone',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Paiement reussi',
    description: 'Votre paiement a ete effectue avec succes',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Paiement echoue',
    description: 'Le paiement n\'a pas pu etre effectue',
  },
  refunded: {
    icon: RefreshCw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Rembourse',
    description: 'Ce paiement a ete rembourse',
  },
};

export function PaymentStatus({
  paymentId,
  onSuccess,
  onFailure,
  onRetry,
}: PaymentStatusProps) {
  const { data, error, isError } = usePollPaymentStatus(
    paymentId,
    // Stop polling if completed or failed
    true
  );

  // Handle polling error
  if (isError) {
    logger.error('Payment polling error:', error);
    return (
      <Card className="border-2 bg-red-50">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-red-600">Erreur</h3>
          <p className="mt-2 text-muted-foreground">
            Impossible de vérifier le statut du paiement.
          </p>
          {onRetry && (
            <Button onClick={onRetry} className="mt-4" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reessayer
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Debug log
  logger.log('PaymentStatus polling data:', data);

  // Derive status from poll response flags
  const getStatus = (): PaymentStatusType => {
    if (!data) return 'pending';
    if (data.is_completed) return 'completed';
    if (data.is_failed) return 'failed';
    if (data.is_pending) return 'pending';

    // Fallback to payment status if available
    const paymentStatus = data.payment?.status as string | undefined;

    // Map backend status to frontend status (backend might use different names)
    if (paymentStatus === 'success' || paymentStatus === 'completed') return 'completed';
    if (paymentStatus === 'failed' || paymentStatus === 'error') return 'failed';
    if (paymentStatus === 'refunded') return 'refunded';

    return 'pending';
  };

  const status = getStatus();
  const config = statusConfig[status];

  // Safety check - if config is undefined, use pending as fallback
  if (!config) {
    console.error('Invalid payment status:', status);
    return (
      <Card className="border-2 bg-yellow-50">
        <CardContent className="flex flex-col items-center p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
          <h3 className="mt-4 text-xl font-semibold">Verification en cours...</h3>
        </CardContent>
      </Card>
    );
  }

  const Icon = config.icon;

  // Use ref to prevent calling callbacks multiple times
  const hasCalledSuccess = useRef(false);
  const hasCalledFailure = useRef(false);

  // Trigger callbacks on status change (only once)
  useEffect(() => {
    if (status === 'completed' && onSuccess && !hasCalledSuccess.current) {
      logger.log('PaymentStatus: Calling onSuccess (once)');
      hasCalledSuccess.current = true;
      onSuccess();
    } else if (status === 'failed' && onFailure && !hasCalledFailure.current) {
      logger.log('PaymentStatus: Calling onFailure (once)');
      hasCalledFailure.current = true;
      onFailure();
    }
  }, [status, onSuccess, onFailure]);

  // Stop polling when status is final
  const isFinalStatus = status === 'completed' || status === 'failed' || status === 'refunded';

  return (
    <Card className={cn('border-2', config.bgColor)}>
      <CardContent className="flex flex-col items-center p-6 text-center">
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full',
            config.bgColor
          )}
        >
          {status === 'pending' && !isFinalStatus ? (
            <Loader2 className={cn('h-8 w-8 animate-spin', config.color)} />
          ) : (
            <Icon className={cn('h-8 w-8', config.color)} />
          )}
        </div>

        <h3 className={cn('mt-4 text-xl font-semibold', config.color)}>
          {config.label}
        </h3>

        <p className="mt-2 text-muted-foreground">{config.description}</p>

        {status === 'pending' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verification en cours...</span>
          </div>
        )}

        {status === 'failed' && onRetry && (
          <Button onClick={onRetry} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reessayer
          </Button>
        )}

        {status === 'completed' && (
          <div className="mt-4 text-sm text-green-600">
            Vous pouvez fermer cette fenetre
          </div>
        )}
      </CardContent>
    </Card>
  );
}
