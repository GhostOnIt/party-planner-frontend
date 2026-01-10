import { ROLE_LABELS } from '@/utils/constants';
import type { Collaborator, CollaboratorRole } from '@/types';

/**
 * Utility functions for collaborator permissions and role management
 */

export interface CollaboratorPermissions {
  canManage: boolean;
  canInvite: boolean;
  canEditRoles: boolean;
  canRemoveCollaborators: boolean;
  canCreateCustomRoles: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isOwner: boolean;
  isCoordinator: boolean;
  effectiveRole: string;
}

/**
 * Get effective role name from collaborator
 */
export function getEffectiveRole(collaborator: Collaborator): string {
  if (collaborator.custom_role) {
    return collaborator.custom_role.name;
  }

  return getSystemRoleDisplayName(collaborator.role);
}

/**
 * Get display name for system roles
 */
export function getSystemRoleDisplayName(role: CollaboratorRole): string {
  return ROLE_LABELS[role] || role;
}

/**
 * Check if a role has management permissions
 */
export function roleCanManage(role: CollaboratorRole): boolean {
  return ['owner', 'coordinator'].includes(role);
}

/**
 * Check if a role can invite collaborators
 */
export function roleCanInvite(role: CollaboratorRole): boolean {
  return ['owner', 'coordinator'].includes(role);
}

/**
 * Check if a role can edit other collaborators' roles
 */
export function roleCanEditRoles(role: CollaboratorRole): boolean {
  return ['owner', 'coordinator'].includes(role);
}

/**
 * Check if a role can remove collaborators
 */
export function roleCanRemoveCollaborators(role: CollaboratorRole): boolean {
  return ['owner', 'coordinator'].includes(role);
}

/**
 * Check if a role can create custom roles
 */
export function roleCanCreateCustomRoles(role: CollaboratorRole): boolean {
  return ['owner', 'coordinator'].includes(role);
}

/**
 * Check if a role has view permissions
 */
export function roleCanView(_role: CollaboratorRole): boolean {
  return true; // All roles can view something
}

/**
 * Check if a role has edit permissions
 */
export function roleCanEdit(role: CollaboratorRole): boolean {
  return [
    'owner',
    'coordinator',
    'guest_manager',
    'planner',
    'accountant',
    'photographer',
    'editor',
  ].includes(role);
}

/**
 * Check if a role has delete permissions
 */
export function roleCanDelete(role: CollaboratorRole): boolean {
  return role === 'owner';
}

/**
 * Check if a role is owner
 */
export function isOwner(role: CollaboratorRole): boolean {
  return role === 'owner';
}

/**
 * Check if a role is coordinator
 */
export function isCoordinator(role: CollaboratorRole): boolean {
  return role === 'coordinator';
}

/**
 * Get all permissions for a collaborator
 */
export function getCollaboratorPermissions(
  collaborator: Collaborator | null | undefined
): CollaboratorPermissions {
  if (!collaborator) {
    return {
      canManage: false,
      canInvite: false,
      canEditRoles: false,
      canRemoveCollaborators: false,
      canCreateCustomRoles: false,
      canView: false,
      canEdit: false,
      canDelete: false,
      isOwner: false,
      isCoordinator: false,
      effectiveRole: 'Aucun',
    };
  }

  const role = collaborator.role;
  const customRole = collaborator.custom_role;

  // If has custom role, use custom role permissions
  if (customRole) {
    const permissions = customRole.permissions || [];
    return {
      canManage:
        permissions.includes('collaborators.invite') ||
        permissions.includes('collaborators.edit_roles'),
      canInvite: permissions.includes('collaborators.invite'),
      canEditRoles: permissions.includes('collaborators.edit_roles'),
      canRemoveCollaborators: permissions.includes('collaborators.remove'),
      canCreateCustomRoles: false, // Custom roles can't create other custom roles
      canView: permissions.some((p: string) => p.includes('.view')),
      canEdit: permissions.some((p: string) => p.includes('.edit') || p.includes('.create')),
      canDelete: permissions.some((p: string) => p.includes('.delete')),
      isOwner: false,
      isCoordinator: false,
      effectiveRole: customRole.name,
    };
  }

  // Use system role permissions
  return {
    canManage: roleCanManage(role),
    canInvite: roleCanInvite(role),
    canEditRoles: roleCanEditRoles(role),
    canRemoveCollaborators: roleCanRemoveCollaborators(role),
    canCreateCustomRoles: roleCanCreateCustomRoles(role),
    canView: roleCanView(role),
    canEdit: roleCanEdit(role),
    canDelete: roleCanDelete(role),
    isOwner: isOwner(role),
    isCoordinator: isCoordinator(role),
    effectiveRole: getSystemRoleDisplayName(role),
  };
}

/**
 * Find current user collaborator from collaborators list
 */
export function findCurrentUserCollaborator(
  collaborators: Collaborator[],
  currentUserId: number | undefined
): Collaborator | null {
  if (!currentUserId) return null;

  return collaborators.find((c) => c.user_id === currentUserId) || null;
}

/**
 * Get current user permissions from collaborators list
 */
export function getCurrentUserPermissions(
  collaborators: Collaborator[],
  currentUserId: number | undefined
): CollaboratorPermissions {
  const collaborator = findCurrentUserCollaborator(collaborators, currentUserId);
  return getCollaboratorPermissions(collaborator);
}

/**
 * Check if user can manage collaborators
 */
export function canUserManageCollaborators(
  collaborators: Collaborator[],
  currentUserId: number | undefined
): boolean {
  const permissions = getCurrentUserPermissions(collaborators, currentUserId);
  return permissions.canManage;
}

/**
 * Check if user can invite collaborators
 */
export function canUserInviteCollaborators(
  collaborators: Collaborator[],
  currentUserId: number | undefined
): boolean {
  const permissions = getCurrentUserPermissions(collaborators, currentUserId);
  return permissions.canInvite;
}

/**
 * Check if user can edit roles
 */
export function canUserEditRoles(
  collaborators: Collaborator[],
  currentUserId: number | undefined
): boolean {
  const permissions = getCurrentUserPermissions(collaborators, currentUserId);
  return permissions.canEditRoles;
}

/**
 * Check if user can remove collaborators
 */
export function canUserRemoveCollaborators(
  collaborators: Collaborator[],
  currentUserId: number | undefined
): boolean {
  const permissions = getCurrentUserPermissions(collaborators, currentUserId);
  return permissions.canRemoveCollaborators;
}

/**
 * Check if user can create custom roles
 */
export function canUserCreateCustomRoles(
  collaborators: Collaborator[],
  currentUserId: number | undefined
): boolean {
  const permissions = getCurrentUserPermissions(collaborators, currentUserId);
  return permissions.canCreateCustomRoles;
}

/**
 * Check if user is owner
 */
export function isCurrentUserOwner(
  collaborators: Collaborator[],
  currentUserId: number | undefined
): boolean {
  const permissions = getCurrentUserPermissions(collaborators, currentUserId);
  return permissions.isOwner;
}

/**
 * Get available assignable roles for the current user
 */
export function getAssignableRoles(
  collaborators: Collaborator[],
  currentUserId: number | undefined
): CollaboratorRole[] {
  const permissions = getCurrentUserPermissions(collaborators, currentUserId);

  if (permissions.isOwner) {
    return [
      'coordinator',
      'guest_manager',
      'planner',
      'accountant',
      'photographer',
      'supervisor',
      'reporter',
    ];
  }

  if (permissions.isCoordinator) {
    return ['guest_manager', 'planner', 'accountant', 'photographer', 'supervisor', 'reporter'];
  }

  return [];
}
