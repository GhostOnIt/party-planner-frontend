import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentSubscription, useSubscribeToPlan } from '@/hooks/useSubscription';
import { useAvailableTrial } from '@/hooks/useAdminPlans';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/** Check eligibility before the user spends time filling out the event form. */
export function EventCreationAccess({ children }: { children: ReactNode }) {
  const access = useCurrentSubscription();
  const trial = useAvailableTrial();
  const subscribe = useSubscribeToPlan();
  const [activationError, setActivationError] = useState('');

  if (access.isLoading) {
    return <p role="status">Étape 1 sur 3 — Vérification de votre accès à la création…</p>;
  }

  if (access.isError || !access.data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Votre accès n’a pas pu être vérifié</AlertTitle>
        <AlertDescription>
          <p>Réessayez avant de remplir le formulaire. Aucune information n’a été envoyée.</p>
          <Button className="mt-3" variant="outline" onClick={() => access.refetch()}>Réessayer la vérification</Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (access.data.quota.can_create) return <>{children}</>;

  const noSubscription = !access.data.has_subscription;
  const availableTrial = noSubscription && trial.data?.available && trial.data.data
    ? trial.data.data : null;

  const activateTrial = async () => {
    if (!availableTrial) return;
    setActivationError('');
    try {
      await subscribe.mutateAsync({ plan_id: availableTrial.id });
      await access.refetch();
    } catch (error) {
      setActivationError(getApiErrorMessage(error));
    }
  };

  return (
    <Alert>
      <AlertTitle>Étape 1 sur 3 — {noSubscription ? 'Activer votre accès' : 'Votre quota de création est atteint'}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{noSubscription
          ? 'Un forfait actif est nécessaire pour créer un événement. Choisissez votre accès avant de remplir le formulaire.'
          : `Vous avez utilisé les créations disponibles pour votre période actuelle (${access.data.quota.used} utilisées). Consultez les offres pour continuer.`}</p>
        {trial.isLoading && noSubscription && <p role="status">Recherche d’un essai disponible…</p>}
        {availableTrial && (
          <p>Votre essai de {availableTrial.duration_label} est disponible. Il comprend {availableTrial.limits['events.creations_per_billing_period'] === -1 ? 'un nombre illimité d’événements' : `${availableTrial.limits['events.creations_per_billing_period']} création(s)`}{availableTrial.limits['guests.max_per_event'] !== undefined && (availableTrial.limits['guests.max_per_event'] === -1 ? ', sans limite d’invités par événement' : `, avec au plus ${availableTrial.limits['guests.max_per_event']} invités par événement`)}. Ses fonctionnalités dépendent de l’offre.</p>
        )}
        {trial.isError && noSubscription && <p>L’essai disponible n’a pas pu être chargé. Vous pouvez réessayer ou consulter les offres.</p>}
        {activationError && <p role="alert" className="text-destructive">{activationError}</p>}
        <div className="flex flex-wrap gap-3">
          {availableTrial && <Button onClick={activateTrial} disabled={subscribe.isPending}>{subscribe.isPending ? 'Activation en cours…' : 'Activer mon essai'}</Button>}
          <Button asChild variant="outline"><Link to="/plans">Voir les forfaits</Link></Button>
          {trial.isError && <Button variant="ghost" onClick={() => trial.refetch()}>Rechercher un essai</Button>}
        </div>
        <p>Choisir un forfait payant ne lance pas de débit automatique : le paiement demande une confirmation distincte.</p>
      </AlertDescription>
    </Alert>
  );
}
