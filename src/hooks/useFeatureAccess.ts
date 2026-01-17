import { useEventEntitlements } from './useSubscription';
import {
  useGuestsPermissions,
  useTasksPermissions,
  useBudgetPermissions,
  useCollaboratorsPermissions,
} from './usePermissions';

/**
 * Hook combinant entitlements (abonnement) et permissions (rôles)
 * Vérifie d'abord si la fonctionnalité est disponible via l'abonnement du propriétaire,
 * puis vérifie les permissions de rôle de l'utilisateur connecté
 */
export function useFeatureAccess(eventId: string) {
  // Récupérer les entitlements du propriétaire de l'événement (pas de l'utilisateur connecté)
  // Cela permet aux collaborateurs d'accéder aux fonctionnalités si le propriétaire a un abonnement actif
  const { data: entitlements, isLoading: isLoadingEntitlements } = useEventEntitlements(eventId);
  const guestPermissions = useGuestsPermissions(eventId);
  const tasksPermissions = useTasksPermissions(eventId);
  const budgetPermissions = useBudgetPermissions(eventId);
  const collaboratorsPermissions = useCollaboratorsPermissions(eventId);

  const isLoading = isLoadingEntitlements;

  // Helper pour vérifier une fonctionnalité
  const canUseFeature = (featureKey: string): boolean => {
    if (!entitlements) return false;
    return (
      entitlements.features[featureKey as keyof typeof entitlements.features] ?? false
    );
  };

  // Helper pour obtenir une limite
  const getLimit = (limitKey: string): number => {
    if (!entitlements) return 0;
    return entitlements.limits[limitKey as keyof typeof entitlements.limits] ?? 0;
  };

  // Helper pour vérifier si une limite est illimitée
  const isUnlimited = (limitKey: string): boolean => {
    return getLimit(limitKey) === -1;
  };

  // Accès combiné : fonctionnalité + permission
  const canAccessGuests =
    canUseFeature('guests.manage') && guestPermissions.hasAnyPermission;
  const canAccessTasks =
    canUseFeature('tasks.enabled') && tasksPermissions.hasAnyPermission;
  const canAccessBudget =
    canUseFeature('budget.enabled') && budgetPermissions.hasAnyPermission;
  const canAccessCollaborators =
    canUseFeature('collaborators.manage') && collaboratorsPermissions.hasAnyPermission;

  return {
    entitlements,
    isLoading,
    // Helpers généraux
    canUseFeature,
    getLimit,
    isUnlimited,
    // Accès combinés par fonctionnalité
    guests: {
      canAccess: canAccessGuests,
      canView: canUseFeature('guests.manage') && guestPermissions.canView,
      canCreate: canUseFeature('guests.manage') && guestPermissions.canCreate,
      canEdit: canUseFeature('guests.manage') && guestPermissions.canEdit,
      canDelete: canUseFeature('guests.manage') && guestPermissions.canDelete,
      canImport: canUseFeature('guests.import') && guestPermissions.canImport,
      canExport: canUseFeature('guests.export') && guestPermissions.canExport,
      maxPerEvent: getLimit('guests.max_per_event'),
      isUnlimited: isUnlimited('guests.max_per_event'),
      permissions: guestPermissions,
    },
    tasks: {
      canAccess: canAccessTasks,
      canView: canUseFeature('tasks.enabled') && tasksPermissions.canView,
      canCreate: canUseFeature('tasks.enabled') && tasksPermissions.canCreate,
      canEdit: canUseFeature('tasks.enabled') && tasksPermissions.canEdit,
      canDelete: canUseFeature('tasks.enabled') && tasksPermissions.canDelete,
      permissions: tasksPermissions,
    },
    budget: {
      canAccess: canAccessBudget,
      canView: canUseFeature('budget.enabled') && budgetPermissions.canView,
      canCreate: canUseFeature('budget.enabled') && budgetPermissions.canCreate,
      canEdit: canUseFeature('budget.enabled') && budgetPermissions.canEdit,
      canDelete: canUseFeature('budget.enabled') && budgetPermissions.canDelete,
      canExport: canUseFeature('budget.enabled') && budgetPermissions.canExport,
      permissions: budgetPermissions,
    },
    collaborators: {
      canAccess: canAccessCollaborators,
      canView:
        canUseFeature('collaborators.manage') && collaboratorsPermissions.canView,
      canInvite:
        canUseFeature('collaborators.manage') && collaboratorsPermissions.canInvite,
      canEditRoles:
        canUseFeature('collaborators.manage') &&
        collaboratorsPermissions.canEditRoles,
      canRemove:
        canUseFeature('collaborators.manage') && collaboratorsPermissions.canRemove,
      isOwner: collaboratorsPermissions.isOwner,
      maxPerEvent: getLimit('collaborators.max_per_event'),
      isUnlimited: isUnlimited('collaborators.max_per_event'),
      permissions: collaboratorsPermissions,
    },
  };
}

