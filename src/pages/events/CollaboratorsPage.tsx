/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import {
  CollaboratorList,
  InviteCollaboratorForm,
  ChangeRoleDialog,
} from '@/components/features/collaborators';
import { useCustomRoles } from '@/hooks/useCustomRoles';
import {
  useCollaborators,
  useCurrentUserPermissions,
  useInviteCollaborator,
  useUpdateCollaborator,
  useRemoveCollaborator,
  useResendInvitation,
} from '@/hooks/useCollaborators';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { getAssignableRoles } from '@/utils/collaboratorPermissions';
import type {
  Collaborator,
  InviteCollaboratorFormData,
  CollaboratorRole,
} from '@/types';

interface CollaboratorsPageProps {
  eventId?: string;
}

export function CollaboratorsPage({ eventId: propEventId }: CollaboratorsPageProps) {
  const { id: paramEventId } = useParams<{ id: string }>();
  const eventId = propEventId || paramEventId;
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [collaboratorToChangeRole, setCollaboratorToChangeRole] = useState<Collaborator | null>(
    null
  );
  const [collaboratorToRemove, setCollaboratorToRemove] = useState<Collaborator | null>(null);

  const { data: collaboratorsData, isLoading } = useCollaborators(eventId!);
  const { data: userPermissions, isLoading: permissionsLoading } = useCurrentUserPermissions(
    eventId!
  );
  const { mutate: inviteCollaborator, isPending: isInviting } = useInviteCollaborator(eventId!);
  const { mutate: updateCollaborator, isPending: isUpdating } = useUpdateCollaborator(eventId!);
  const { mutate: removeCollaborator, isPending: isRemoving } = useRemoveCollaborator(eventId!);
  const { mutate: resendInvitation } = useResendInvitation(eventId!);
  const featureAccess = useFeatureAccess(eventId!);

  const { data: rolesData } = useCustomRoles(eventId!);
  const collaborators = collaboratorsData?.data || [];

  // Check access using featureAccess (combines entitlements + permissions)
  const canManage = userPermissions?.canManage || false;
  const canInvite = featureAccess.collaborators.canInvite;
  const customRoles = (rolesData?.roles || []).filter((r) => !r.is_system);

  // Get assignable roles for the current user
  const assignableRoles = getAssignableRoles(collaborators, user?.id);
  const handleInvite = (data: InviteCollaboratorFormData) => {
    inviteCollaborator(data, {
      onSuccess: () => {
        setShowInviteForm(false);
        toast({
          title: 'Invitation envoyee',
          description: `Une invitation a ete envoyee a ${data.email}.`,
        });
      },
      onError: (error: any) => {
        // Extract error message from API response
        let errorMessage = "Une erreur est survenue lors de l'envoi de l'invitation.";

        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data?.errors?.email?.[0]) {
          errorMessage = error.response.data.errors.email[0];
        }

        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      },
    });
  };

  const handleChangeRole = (
    collaboratorId: number,
    userId: number,
    roles: CollaboratorRole[],
    customRoleIds: number[]
  ) => {
    updateCollaborator(
      { collaboratorId, userId, roles, custom_role_ids: customRoleIds },
      {
        onSuccess: () => {
          setCollaboratorToChangeRole(null);
          toast({
            title: 'Role modifie',
            description: 'Le role du collaborateur a ete modifie avec succes.',
          });
        },
        onError: (error: any) => {
          let errorMessage = 'Une erreur est survenue lors de la modification du role.';

          if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          }

          toast({
            title: 'Erreur',
            description: errorMessage,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleRemove = () => {
    if (collaboratorToRemove) {
      // Use user_id instead of collaborator id
      removeCollaborator(collaboratorToRemove.user_id, {
        onSuccess: () => {
          setCollaboratorToRemove(null);
          toast({
            title: 'Collaborateur retire',
            description: `${collaboratorToRemove.user.name} a ete retire de l'evenement.`,
          });
        },
        onError: (error: any) => {
          let errorMessage = 'Une erreur est survenue lors de la suppression.';

          if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          }

          toast({
            title: 'Erreur',
            description: errorMessage,
            variant: 'destructive',
          });
        },
      });
    }
  };

  const handleResendInvitation = (collaborator: Collaborator) => {
    // Use user_id instead of collaborator id
    resendInvitation(collaborator.user_id, {
      onSuccess: () => {
        toast({
          title: 'Invitation renvoyee',
          description: `L'invitation a ete renvoyee a ${collaborator.user.email}.`,
        });
      },
      onError: (error: any) => {
        let errorMessage = "Une erreur est survenue lors du renvoi de l'invitation.";

        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      },
    });
  };

  if (!eventId) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Collaborateurs
              </CardTitle>
              <CardDescription>Gerez les personnes qui ont acces a cet evenement.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {canInvite && (
                <Button onClick={() => setShowInviteForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Inviter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="font-medium">{collaborators.length}</span>
              <span className="ml-1 text-muted-foreground">collaborateur(s)</span>
            </div>
            <div>
              <span className="font-medium">
                {collaborators.filter((c) => !c.accepted_at).length}
              </span>
              <span className="ml-1 text-muted-foreground">en attente</span>
            </div>
            <div>
              <span className="font-medium">{customRoles.length}</span>
              <span className="ml-1 text-muted-foreground">rôle(s) personnalisé(s)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collaborators List */}
      {!isLoading && collaborators.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Aucun collaborateur"
          description={
            !featureAccess.collaborators.canAccess
              ? 'Cette fonctionnalité nécessite un abonnement actif.'
              : "Vous n'avez pas encore invite de collaborateurs. Invitez des personnes pour travailler ensemble sur cet evenement."
          }
          action={
            canInvite
              ? {
                  label: 'Inviter un collaborateur',
                  onClick: () => setShowInviteForm(true),
                }
              : undefined
          }
        />
      ) : (
        <CollaboratorList
          collaborators={collaborators}
          isLoading={isLoading || permissionsLoading || featureAccess.isLoading}
          currentUserId={user?.id}
          canManage={canManage}
          onChangeRole={setCollaboratorToChangeRole}
          onRemove={setCollaboratorToRemove}
          onResendInvitation={handleResendInvitation}
        />
      )}

      {/* Rôles personnalisés : gérés dans Paramètres */}
      {customRoles.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{customRoles.length}</span> rôle(s) personnalisé(s)
              disponible(s) pour cet événement. Gérez vos rôles dans{' '}
              <Link to="/settings" className="text-primary underline">
                Paramètres
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      )}

      {/* Invite Form Modal */}
      <InviteCollaboratorForm
        open={showInviteForm}
        onOpenChange={setShowInviteForm}
        onSubmit={handleInvite}
        isSubmitting={isInviting}
        availableRoles={assignableRoles}
        customRoles={customRoles}
      />

      {/* Change Role Dialog */}
      <ChangeRoleDialog
        open={!!collaboratorToChangeRole}
        onOpenChange={() => setCollaboratorToChangeRole(null)}
        collaborator={collaboratorToChangeRole}
        eventId={eventId!}
        onConfirm={handleChangeRole}
        isSubmitting={isUpdating}
        availableRoles={assignableRoles}
      />

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!collaboratorToRemove} onOpenChange={() => setCollaboratorToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer le collaborateur</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir retirer {collaboratorToRemove?.user.name} de cet evenement ?
              Cette personne n'aura plus acces a l'evenement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? 'Suppression...' : 'Retirer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
