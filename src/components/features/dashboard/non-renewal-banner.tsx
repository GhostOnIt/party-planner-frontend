import { AlertTriangle, Clock3, ArchiveRestore } from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrentSubscription } from "@/hooks/useSubscription";

export function NonRenewalBanner() {
  const { data, isLoading } = useCurrentSubscription();

  if (isLoading || !data?.lifecycle) return null;

  const phase = data.lifecycle.phase;
  if (!['renewal_due', 'renewal_last_day', 'grace_period', 'archived', 'expired'].includes(phase)) {
    return null;
  }

  const getMessage = () => {
    if (phase === 'renewal_last_day') {
      return "Dernier rappel: votre abonnement expire aujourd'hui. Renouvelez pour éviter les restrictions.";
    }
    if (phase === 'renewal_due') {
      return `Votre abonnement expire dans ${data.lifecycle?.days_to_expiry ?? 0} jour(s). Renouvelez pour conserver l'accès complet.`;
    }
    if (phase === 'grace_period') {
      return "Période de grâce active: certaines actions sont restreintes. Réactivez votre abonnement pour restaurer toutes les fonctionnalités.";
    }
    if (phase === 'archived') {
      return "Vos données sont archivées après non-renouvellement. Réactivez l'abonnement pour restaurer l'accès complet immédiatement.";
    }
    return "Votre abonnement a expiré. Certaines fonctionnalités sont restreintes.";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        {phase === 'archived' ? (
          <ArchiveRestore className="mt-0.5 h-5 w-5 text-amber-700" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
        )}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-amber-900">Renouvellement d'abonnement</h3>
          <p className="text-sm text-amber-800">{getMessage()}</p>
          {phase === 'grace_period' && data.lifecycle?.archive_in_days !== null && (
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <Clock3 className="h-4 w-4" />
              <span>Archivage automatique dans {data.lifecycle.archive_in_days} jour(s)</span>
            </div>
          )}
          <Link
            to="/plans"
            className="inline-flex items-center rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Renouveler maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}

