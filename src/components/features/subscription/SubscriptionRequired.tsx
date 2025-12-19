import { Link } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SubscriptionRequiredProps {
  eventId: string | number;
  feature?: string;
  message?: string;
}

export function SubscriptionRequired({
  eventId,
  feature = 'cette fonctionnalite',
  message
}: SubscriptionRequiredProps) {
  return (
    <Alert className="border-amber-200 bg-amber-50">
      <Lock className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Abonnement requis</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-amber-700 mb-3">
          {message || `Un abonnement actif est necessaire pour utiliser ${feature}.`}
        </p>
        <Link to={`/subscriptions?tab=activate&event=${eventId}`}>
          <Button size="sm" className="gap-2">
            <Crown className="h-4 w-4" />
            Souscrire a un plan
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
