/** Nombre maximal de rôles (système + personnalisés) par collaborateur. */
export const MAX_COLLABORATOR_ROLES = 3;

/**
 * Compte effectif aligné sur l’API : si aucun rôle système mais des rôles perso,
 * le backend ajoute « supervisor » (équivalent 1 rôle système).
 */
export function effectiveCollaboratorRoleCount(
  systemRoles: string[],
  customIds: string[]
): number {
  const uniqueSystem = new Set(systemRoles.filter(Boolean)).size;
  const customCount = (customIds || []).filter(Boolean).length;
  if (uniqueSystem === 0 && customCount > 0) {
    return 1 + customCount;
  }
  return uniqueSystem + customCount;
}
