import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { activityTracker } from '@/services/activityTracker';

/**
 * Hook qui track automatiquement la navigation entre les pages.
 * Enregistre chaque changement de route avec :
 * - Le path de la page
 * - La durée passée sur la page précédente
 * - La page précédente (referrer interne)
 *
 * A monter dans le layout principal (MainLayout).
 */
export function usePageTracking() {
  const location = useLocation();
  const previousPath = useRef<string | null>(null);
  const pageEnterTime = useRef<number>(Date.now());

  useEffect(() => {
    const currentPath = location.pathname;

    // Calculer la durée passée sur la page précédente
    const duration = previousPath.current
      ? Math.round((Date.now() - pageEnterTime.current) / 1000)
      : 0;

    // Tracker la navigation vers la nouvelle page
    activityTracker.trackNavigation(currentPath, {
      previous_page: previousPath.current || undefined,
      duration_on_previous_page: duration > 0 ? duration : undefined,
    });

    // Mettre à jour les refs
    previousPath.current = currentPath;
    pageEnterTime.current = Date.now();
  }, [location.pathname]);
}
