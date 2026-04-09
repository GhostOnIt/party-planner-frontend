import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
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

  const [firstEventOpen, setFirstEventOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const k = (s: string) => `${STORAGE_PREFIX}${user.id}_${s}`;

    if (location.pathname === '/events' && !localStorage.getItem(k('first_event'))) {
      setFirstEventOpen(true);
    } else {
      setFirstEventOpen(false);
    }

    if (location.pathname.startsWith('/admin/guests') && !localStorage.getItem(k('guest_onboarding'))) {
      setGuestOpen(true);
    } else {
      setGuestOpen(false);
    }
  }, [user?.id, location.pathname]);

  if (!user?.id) return null;

  const k = (s: string) => `${STORAGE_PREFIX}${user.id}_${s}`;

  return (
    <>
      {firstEventOpen && (
        <AlertDialog
          open={firstEventOpen}
          onOpenChange={(o) => {
            if (!o) {
              localStorage.setItem(k('first_event'), '1');
              setFirstEventOpen(false);
            }
          }}
        >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Premier événement</AlertDialogTitle>
            <AlertDialogDescription>
              Utilisez le bouton « Nouvel événement » pour créer votre fête, mariage ou séminaire. Vous pourrez
              ensuite gérer les invités, le budget et les tâches au même endroit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                localStorage.setItem(k('first_event'), '1');
                setFirstEventOpen(false);
              }}
            >
              Plus tard
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                localStorage.setItem(k('first_event'), '1');
                setFirstEventOpen(false);
              }}
            >
              Compris
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
