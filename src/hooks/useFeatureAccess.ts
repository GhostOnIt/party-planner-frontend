import { useEventEntitlements } from './useSubscription';
import {
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
    return (
      entitlements.features[featureKey as keyof typeof entitlements.features] ?? false
    );
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

  // Accès combiné : fonctionnalité + permission
  // Pour les admins, on bypass toutes les vérifications
  const canAccessGuests = isAdmin
    ? true
    : canUseFeature('guests.manage') && guestPermissions.hasAnyPermission;
  const canAccessTasks = isAdmin
    ? true
    : canUseFeature('tasks.enabled') && tasksPermissions.hasAnyPermission;
  const canAccessBudget = isAdmin
    ? true
    : canUseFeature('budget.enabled') && budgetPermissions.hasAnyPermission;
  const canAccessCollaborators = isAdmin
    ? true
    : canUseFeature('collaborators.manage') && collaboratorsPermissions.hasAnyPermission;

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

