import { useEventEntitlements } from './useSubscription';
import {
  useEventPermissions,
  useGuestsPermissions,
  useTasksPermissions,
  useBudgetPermissions,
  useCollaboratorsPermissions,
} from './usePermissions';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook combinant entitlements (abonnement) et permissions (rôles)
 * Vérifie d'abord si la fonctionnalité est disponible via l'abonnement du propriétaire,
 * puis vérifie les permissions de rôle de l'utilisateur connecté
 * 
 * Les administrateurs ont accès à toutes les fonctionnalités, indépendamment des abonnements et permissions
 */
export function useFeatureAccess(eventId: string) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Récupérer les entitlements du propriétaire de l'événement (pas de l'utilisateur connecté)
  // Cela permet aux collaborateurs d'accéder aux fonctionnalités si le propriétaire a un abonnement actif
  const { data: entitlements, isLoading: isLoadingEntitlements } = useEventEntitlements(eventId);
  const { data: eventPermissions } = useEventPermissions(eventId);
  const isOwner = eventPermissions?.is_owner ?? false;
  const guestPermissions = useGuestsPermissions(eventId);
  const tasksPermissions = useTasksPermissions(eventId);
  const budgetPermissions = useBudgetPermissions(eventId);
  const collaboratorsPermissions = useCollaboratorsPermissions(eventId);

  const isLoading = isLoadingEntitlements;

  // Helper pour vérifier une fonctionnalité
  const canUseFeature = (featureKey: string): boolean => {
    // Les admins ont accès à toutes les fonctionnalités
    if (isAdmin) return true;
    if (!entitlements) return false;
    const restricted = entitlements.restrictions?.read_only ?? false;
    const featureEnabled = entitlements.features[featureKey as keyof typeof entitlements.features] ?? false;
    if (!featureEnabled) return false;

    if (!restricted) return true;

    // En période de grâce / archivage, on conserve majoritairement la lecture.
    if (featureKey === 'guests.manage' || featureKey === 'tasks.enabled' || featureKey === 'budget.enabled') {
      return true;
    }

    return false;
  };

  // Helper pour obtenir une limite
  const getLimit = (limitKey: string): number => {
    // Les admins ont des limites illimitées
    if (isAdmin) return -1;
    if (!entitlements) return 0;
    return entitlements.limits[limitKey as keyof typeof entitlements.limits] ?? 0;
  };

  // Helper pour vérifier si une limite est illimitée
  const isUnlimited = (limitKey: string): boolean => {
    // Les admins ont toujours des limites illimitées
    if (isAdmin) return true;
    return getLimit(limitKey) === -1;
  };

  // Accès combiné : entitlement du propriétaire + permission de rôle (le propriétaire n'a pas besoin des permissions collaborateur)
  const canAccessGuests = isAdmin
    ? true
    : canUseFeature('guests.manage') && (isOwner || guestPermissions.hasAnyPermission);
  const canAccessTasks = isAdmin
    ? true
    : canUseFeature('tasks.enabled') && (isOwner || tasksPermissions.hasAnyPermission);
  const canAccessBudget = isAdmin
    ? true
    : canUseFeature('budget.enabled') && (isOwner || budgetPermissions.hasAnyPermission);
  const canAccessCollaborators = isAdmin
    ? true
    : canUseFeature('collaborators.manage') &&
        (isOwner || collaboratorsPermissions.hasAnyPermission);

  // Si admin, retourner tous les accès à true
  if (isAdmin) {
    return {
      entitlements,
      isLoading,
      // Helpers généraux
      canUseFeature: () => true,
      getLimit: () => -1,
      isUnlimited: () => true,
      // Accès combinés par fonctionnalité - tous à true pour les admins
      guests: {
        canAccess: true,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canImport: true,
        canExport: true,
        maxPerEvent: -1,
        isUnlimited: true,
        permissions: guestPermissions,
      },
      tasks: {
        canAccess: true,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        permissions: tasksPermissions,
      },
      budget: {
        canAccess: true,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        permissions: budgetPermissions,
      },
      collaborators: {
        canAccess: true,
        canView: true,
        canInvite: true,
        canEditRoles: true,
        canRemove: true,
        isOwner: collaboratorsPermissions.isOwner,
        maxPerEvent: -1,
        isUnlimited: true,
        permissions: collaboratorsPermissions,
      },
    };
  }

  // Logique normale pour les utilisateurs non-admin
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
      canView: canUseFeature('guests.manage') && (isOwner || guestPermissions.canView),
      canCreate: canUseFeature('guests.manage') && (isOwner || guestPermissions.canCreate),
      canEdit: canUseFeature('guests.manage') && (isOwner || guestPermissions.canEdit),
      canDelete: canUseFeature('guests.manage') && (isOwner || guestPermissions.canDelete),
      canImport: canUseFeature('guests.import') && (isOwner || guestPermissions.canImport),
      canExport: canUseFeature('guests.export') && (isOwner || guestPermissions.canExport),
      maxPerEvent: getLimit('guests.max_per_event'),
      isUnlimited: isUnlimited('guests.max_per_event'),
      permissions: guestPermissions,
    },
    tasks: {
      canAccess: canAccessTasks,
      canView: canUseFeature('tasks.enabled') && (isOwner || tasksPermissions.canView),
      canCreate: canUseFeature('tasks.enabled') && (isOwner || tasksPermissions.canCreate),
      canEdit: canUseFeature('tasks.enabled') && (isOwner || tasksPermissions.canEdit),
      canDelete: canUseFeature('tasks.enabled') && (isOwner || tasksPermissions.canDelete),
      permissions: tasksPermissions,
    },
    budget: {
      canAccess: canAccessBudget,
      canView: canUseFeature('budget.enabled') && (isOwner || budgetPermissions.canView),
      canCreate: canUseFeature('budget.enabled') && (isOwner || budgetPermissions.canCreate),
      canEdit: canUseFeature('budget.enabled') && (isOwner || budgetPermissions.canEdit),
      canDelete: canUseFeature('budget.enabled') && (isOwner || budgetPermissions.canDelete),
      canExport: canUseFeature('budget.enabled') && (isOwner || budgetPermissions.canExport),
      permissions: budgetPermissions,
    },
    collaborators: {
      canAccess: canAccessCollaborators,
      canView:
        canUseFeature('collaborators.manage') &&
        (isOwner || collaboratorsPermissions.canView),
      canInvite:
        canUseFeature('collaborators.manage') &&
        (isOwner || collaboratorsPermissions.canInvite),
      canEditRoles:
        canUseFeature('collaborators.manage') &&
        (isOwner || collaboratorsPermissions.canEditRoles),
      canRemove:
        canUseFeature('collaborators.manage') &&
        (isOwner || collaboratorsPermissions.canRemove),
      isOwner: collaboratorsPermissions.isOwner,
      maxPerEvent: getLimit('collaborators.max_per_event'),
      isUnlimited: isUnlimited('collaborators.max_per_event'),
      permissions: collaboratorsPermissions,
    },
  };
}

