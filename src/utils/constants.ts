import type { CollaboratorRole } from '@/types';

/**
 * Labels for collaborator roles
 */
export const ROLE_LABELS: Record<CollaboratorRole, string> = {
  owner: 'Propriétaire',
  coordinator: 'Coordinateur',
  guest_manager: "Gestionnaire d'Invités",
  planner: 'Planificateur',
  accountant: 'Comptable',
  photographer: 'Photographe',
  supervisor: 'Superviseur',
  reporter: 'Rapporteur',
  editor: 'Éditeur',
  viewer: 'Lecteur',
};
