import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const STORAGE_PREFIX = 'pp_onboarding_v1_';

/**
 * Tutoriels ciblés (premier événement, annuaire invités / envoi).
 * Persistance localStorage par utilisateur.
 */
export function OnboardingRunner() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: events, isLoading, isError } = useEvents({ per_page: 1 });
  const guidePage = ['/dashboard', '/events', '/events/create'].includes(location.pathname);
  const hasNoEvents = !!events && events.total === 0;

  const [firstEventOpen, setFirstEventOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const k = (s: string) => `${STORAGE_PREFIX}${user.id}_${s}`;

    if (guidePage && hasNoEvents && !isLoading && !isError
      && !localStorage.getItem(k('first_event_v2'))
      && !sessionStorage.getItem(k('first_event_deferred'))) {
      setFirstEventOpen(true);
    } else {
      setFirstEventOpen(false);
    }

    if (location.pathname.startsWith('/admin/guests') && !localStorage.getItem(k('guest_onboarding'))) {
      setGuestOpen(true);
    } else {
      setGuestOpen(false);
    }
  }, [user?.id, location.pathname, guidePage, hasNoEvents, isLoading, isError]);

  if (!user?.id) return null;

  const k = (s: string) => `${STORAGE_PREFIX}${user.id}_${s}`;
  const deferGuide = () => {
    sessionStorage.setItem(k('first_event_deferred'), '1');
    setFirstEventOpen(false);
  };

  return (
    <>
      {guidePage && (
        <div className="mb-3 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setFirstEventOpen(true)}>
            Revoir le guide de création
          </Button>
        </div>
      )}
      {firstEventOpen && (
        <AlertDialog
          open={firstEventOpen}
          onOpenChange={(o) => {
            if (!o) {
              deferGuide();
            }
          }}
        >
        <AlertDialogContent className="max-h-[85dvh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Votre événement, pas à pas</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Préparez votre événement en trois étapes.</p>
                <ol className="list-decimal space-y-3 pl-5">
                  <li><strong>Vérifier votre accès.</strong> Avant le formulaire, nous vérifierons votre forfait et vos créations disponibles. Un essai sera proposé si vous y avez droit.</li>
                  <li><strong>Décrire votre événement.</strong> Préparez son nom, son type, sa date, son heure et son lieu. La description, le modèle et la photo sont facultatifs.</li>
                  <li><strong>Ajouter vos invités.</strong> Après la création, vous pourrez préparer votre liste et envoyer les invitations quand vous serez prêt.</li>
                </ol>
                <p>La création ne déclenche aucun envoi d’invitation. Vous pourrez modifier les informations ensuite.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                deferGuide();
              }}
            >
              Plus tard
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                localStorage.setItem(k('first_event_v2'), 'started');
                setFirstEventOpen(false);
                navigate('/events/create');
              }}
            >
              Créer mon événement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      )}

      {guestOpen && (
        <AlertDialog
          open={guestOpen}
          onOpenChange={(o) => {
            if (!o) {
              localStorage.setItem(k('guest_onboarding'), '1');
              setGuestOpen(false);
            }
          }}
        >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuaire invités et envois</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Filtrez par événement avec le menu « Tous les événements », puis sélectionnez des invités dans le
                tableau.
              </span>
              <span className="block">
                Utilisez « Envoyer un message » pour lancer une campagne une fois des lignes sélectionnées.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                localStorage.setItem(k('guest_onboarding'), '1');
                setGuestOpen(false);
              }}
            >
              Plus tard
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                localStorage.setItem(k('guest_onboarding'), '1');
                setGuestOpen(false);
              }}
            >
              Compris
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      )}
    </>
  );
}
