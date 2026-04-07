import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const STORAGE_PREFIX = 'pp_onboarding_v1_';

/**
 * Tutoriels ciblés (premier événement, annuaire invités, premier envoi).
 * Progression persistée dans localStorage par utilisateur.
 */
export function OnboardingRunner() {
  const { user } = useAuthStore();
  const location = useLocation();
  const lockRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;

    const storageKey = (suffix: string) => `${STORAGE_PREFIX}${user.id}_${suffix}`;

    const run = async () => {
      if (lockRef.current) return;

      let driverModule: typeof import('driver.js');
      try {
        driverModule = await import('driver.js');
        await import('driver.js/dist/driver.css');
      } catch {
        return;
      }

      const { driver } = driverModule;
      const path = location.pathname;

      if (path === '/events' && !localStorage.getItem(storageKey('first_event'))) {
        const el = document.querySelector('[data-tour="onboarding-create-event"]');
        if (!el) return;
        lockRef.current = true;
        const d = driver({
          showProgress: true,
          steps: [
            {
              element: '[data-tour="onboarding-create-event"]',
              popover: {
                title: 'Créer votre premier événement',
                description:
                  'Cliquez ici pour créer un événement, puis vous pourrez inviter des invités et suivre le budget.',
              },
            },
          ],
          onDestroyed: () => {
            localStorage.setItem(storageKey('first_event'), '1');
            lockRef.current = false;
          },
        });
        d.drive();
        return;
      }

      if (path.startsWith('/admin/guests') && !localStorage.getItem(storageKey('guest_list'))) {
        const filterEl = document.querySelector('[data-tour="onboarding-guest-event-filter"]');
        const sendEl = document.querySelector('[data-tour="onboarding-send-message"]');
        const steps: {
          element: string;
          popover: { title: string; description: string };
        }[] = [];
        if (filterEl) {
          steps.push({
            element: '[data-tour="onboarding-guest-event-filter"]',
            popover: {
              title: 'Filtrer par événement',
              description: 'Choisissez un événement pour voir la liste des invités associés.',
            },
          });
        }
        if (sendEl) {
          steps.push({
            element: '[data-tour="onboarding-send-message"]',
            popover: {
              title: 'Premier envoi',
              description:
                'Sélectionnez des invités dans le tableau, puis envoyez un SMS ou un message depuis la campagne.',
            },
          });
        }
        if (steps.length === 0) return;
        lockRef.current = true;
        const d = driver({
          showProgress: true,
          steps,
          onDestroyed: () => {
            localStorage.setItem(storageKey('guest_list'), '1');
            localStorage.setItem(storageKey('first_send'), '1');
            lockRef.current = false;
          },
        });
        d.drive();
      }
    };

    const t = window.setTimeout(run, 700);
    return () => window.clearTimeout(t);
  }, [user?.id, location.pathname]);

  return null;
}
