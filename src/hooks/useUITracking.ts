import { useCallback } from 'react';
import { activityTracker } from '@/services/activityTracker';

/**
 * Hook pour tracker les interactions UI manuellement.
 *
 * Retourne une fonction `trackInteraction` à appeler dans les composants
 * pour les actions importantes : ouverture de modales, clics sur boutons,
 * changements d'onglets, application de filtres, etc.
 *
 * Usage :
 * ```tsx
 * const { trackInteraction } = useUITracking();
 *
 * // Dans un handler
 * const handleOpenModal = () => {
 *   trackInteraction('modal_open', 'delete-event-modal');
 *   setModalOpen(true);
 * };
 *
 * // Sur un changement d'onglet
 * const handleTabChange = (tab: string) => {
 *   trackInteraction('tab_change', `tab-${tab}`, { tab });
 *   setActiveTab(tab);
 * };
 *
 * // Sur un filtre appliqué
 * const handleFilter = (filters: Filters) => {
 *   trackInteraction('filter_applied', 'event-filters', { filters });
 *   applyFilters(filters);
 * };
 * ```
 */
export function useUITracking() {
  const trackInteraction = useCallback(
    (action: string, element: string, metadata?: Record<string, unknown>) => {
      activityTracker.trackInteraction(action, element, metadata);
    },
    []
  );

  const trackClick = useCallback(
    (element: string, metadata?: Record<string, unknown>) => {
      activityTracker.trackInteraction('click', element, metadata);
    },
    []
  );

  const trackModalOpen = useCallback(
    (modalName: string, metadata?: Record<string, unknown>) => {
      activityTracker.trackInteraction('modal_open', modalName, metadata);
    },
    []
  );

  const trackModalClose = useCallback(
    (modalName: string, metadata?: Record<string, unknown>) => {
      activityTracker.trackInteraction('modal_close', modalName, metadata);
    },
    []
  );

  const trackTabChange = useCallback(
    (tabName: string, metadata?: Record<string, unknown>) => {
      activityTracker.trackInteraction('tab_change', tabName, metadata);
    },
    []
  );

  const trackFilterApplied = useCallback(
    (filterName: string, metadata?: Record<string, unknown>) => {
      activityTracker.trackInteraction('filter_applied', filterName, metadata);
    },
    []
  );

  return {
    trackInteraction,
    trackClick,
    trackModalOpen,
    trackModalClose,
    trackTabChange,
    trackFilterApplied,
  };
}
