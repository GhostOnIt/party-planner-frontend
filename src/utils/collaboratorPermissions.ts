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
 * Get effective role names from collaborator
 */
export function getEffectiveRoles(collaborator: Collaborator): string[] {
  if (collaborator.custom_role) {
    return [collaborator.custom_role.name];
  }

  if (collaborator.roles && collaborator.roles.length > 0) {
    return collaborator.roles.map((role) => ROLE_LABELS[role]);
  }

  return collaborator.role ? [ROLE_LABELS[collaborator.role]] : ['Aucun'];
}

/**
 * Get effective role values (not labels) for collaborator
 */
export function getEffectiveRoleValues(collaborator: Collaborator): string[] {
  if (collaborator.custom_role) {
    return ['custom']; // Special value for custom roles
  }

  // Check if collaborator has multiple roles (new system)
  if (collaborator.roles && collaborator.roles.length > 0) {
    return collaborator.roles;
  }

  // Fallback to single role (old system or backward compatibility)
  if (collaborator.role) {
    return [collaborator.role];
  }

  return [];
}

/**
 * Get effective role name from collaborator (primary role for backward compatibility)
 */
export function getEffectiveRole(collaborator: Collaborator): string {
  return getEffectiveRoles(collaborator)[0] || 'Aucun';
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

  // Use system role permissions (role might be undefined for legacy collaborators)
  const systemRole = role || 'viewer'; // Default to viewer if no role
  return {
    canManage: roleCanManage(systemRole),
    canInvite: roleCanInvite(systemRole),
    canEditRoles: roleCanEditRoles(systemRole),
    canRemoveCollaborators: roleCanRemoveCollaborators(systemRole),
    canCreateCustomRoles: roleCanCreateCustomRoles(systemRole),
    canView: roleCanView(systemRole),
    canEdit: roleCanEdit(systemRole),
    canDelete: roleCanDelete(systemRole),
    isOwner: isOwner(systemRole),
    isCoordinator: isCoordinator(systemRole),
    effectiveRole: getSystemRoleDisplayName(systemRole),
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

// Helper functions for multiple roles support
export function hasRole(collaborator: Collaborator, role: CollaboratorRole): boolean {
  if (collaborator.roles) {
    return collaborator.roles.includes(role);
  }
  return collaborator.role === role;
}

export function hasAnyRole(collaborator: Collaborator, roles: CollaboratorRole[]): boolean {
  if (collaborator.roles) {
    return roles.some((role) => collaborator.roles!.includes(role));
  }
  return roles.includes(collaborator.role!);
}

export function collaboratorCanManageCollaborators(collaborator: Collaborator): boolean {
  return hasAnyRole(collaborator, ['owner', 'coordinator']);
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
