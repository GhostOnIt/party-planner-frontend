/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, UserPlus, Users, Pencil, Trash2, Shield, Lock, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import {
  CollaboratorList,
  InviteCollaboratorForm,
  ChangeRoleDialog,
} from '@/components/features/collaborators';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RoleForm } from '@/components/features/roles/RoleForm';
import {
  useCustomRoles,
  usePermissions,
  useCreateCustomRole,
  useUpdateCustomRole,
  useDeleteCustomRole,
} from '@/hooks/useCustomRoles';
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
  CustomRoleFormData,
  CustomRole,
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
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<CustomRole | null>(null);
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
  const { data: permissionsData, isLoading: permissionsModulesLoading } = usePermissions();
  const createRoleMutation = useCreateCustomRole(eventId!);
  const updateRoleMutation = useUpdateCustomRole(eventId!, editingRole?.id || 0);
  const deleteRoleMutation = useDeleteCustomRole(eventId!, roleToDelete?.id || 0);

  const collaborators = collaboratorsData?.data || [];

  // Check access using featureAccess (combines entitlements + permissions)
  const canManage = userPermissions?.canManage || false;
  const canInvite = featureAccess.collaborators.canInvite;
  const canCreateCustomRoles =
    (userPermissions?.canCreateCustomRoles && featureAccess.collaborators.canAccess) || false;
  const customRoles = (rolesData?.roles || []).filter((r) => !r.is_system);

  const permissionNameToId = new Map<string, number>();
  (permissionsData?.permissions || []).forEach((module) => {
    module.permissions.forEach((p) => {
      permissionNameToId.set(p.name, p.id);
    });
  });

  const getRoleAssignedCount = (roleId: number) => {
    return collaborators.filter((c) => {
      const ids =
        (c.custom_role_ids && Array.isArray(c.custom_role_ids) ? c.custom_role_ids : []) ||
        (c.custom_roles ? c.custom_roles.map((r) => r.id) : []) ||
        (c.custom_role_id ? [c.custom_role_id] : []);
      return ids.includes(roleId);
    }).length;
  };

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

  const handleCreateRole = (data: CustomRoleFormData) => {
    createRoleMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateRole(false);
        toast({
          title: 'Rôle créé',
          description: 'Le rôle personnalisé a été créé avec succès.',
        });
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.errors?.name?.[0] ||
          'Une erreur est survenue lors de la création du rôle.';
        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      },
    });
  };

  const handleUpdateRole = (data: CustomRoleFormData) => {
    if (!editingRole) return;

    updateRoleMutation.mutate(data, {
      onSuccess: () => {
        setEditingRole(null);
        toast({
          title: 'Rôle modifié',
          description: 'Le rôle personnalisé a été modifié avec succès.',
        });
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.errors?.name?.[0] ||
          error?.response?.data?.errors?.permissions?.[0] ||
          'Une erreur est survenue lors de la modification du rôle.';
        toast({
          title: 'Erreur',
          description: errorMessage,
          variant: 'destructive',
        });
      },
    });
  };

  const handleDeleteRole = () => {
    if (!roleToDelete) return;

    deleteRoleMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: 'Rôle supprimé',
          description: 'Le rôle personnalisé a été supprimé avec succès.',
        });
        setRoleToDelete(null);
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.errors?.role?.[0] ||
          'Une erreur est survenue lors de la suppression du rôle.';
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
              {canCreateCustomRoles && (
                <Button variant="outline" onClick={() => setShowCreateRole(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau rôle
                </Button>
              )}
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

      {/* Custom Roles Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Rôles personnalisés
            </h3>
            <p className="text-sm text-muted-foreground">
              Définissez des accès granulaires spécifiques à cet événement.
            </p>
          </div>
        </div>

        {customRoles.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Shield className="h-10 w-10 text-muted-foreground/50 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Aucun rôle personnalisé</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Créez des rôles sur mesure pour limiter l'accès à certaines fonctionnalités.
              </p>
              {canCreateCustomRoles && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setShowCreateRole(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un rôle
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRoles.map((role) => {
              const assignedCount = getRoleAssignedCount(role.id);
              const canDelete = assignedCount === 0;

              return (
                <Card
                  key={role.id}
                  className="group hover:shadow-md transition-all duration-200 border-muted-foreground/20 hover:border-primary/50"
                >
                  <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1 pr-2">
                      <CardTitle className="text-base font-semibold truncate leading-none">
                        {role.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-xs min-h-[2.5em]">
                        {role.description || 'Aucune description fournie.'}
                      </CardDescription>
                    </div>

                    {canCreateCustomRoles && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 -mt-1 -mr-2 text-muted-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingRole(role)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setRoleToDelete(role)}
                            disabled={!canDelete}
                            className={
                              !canDelete
                                ? 'opacity-50 cursor-not-allowed'
                                : 'text-destructive focus:text-destructive'
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardHeader>

                  <CardContent className="px-5 pb-5">
                    <div className="flex items-center gap-3 pt-2">
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 font-normal text-xs px-2 py-0.5"
                      >
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        <span>{role.permissions?.length || 0} perm.</span>
                      </Badge>

                      <Badge
                        variant={assignedCount > 0 ? 'default' : 'outline'}
                        className={`flex items-center gap-1 font-normal text-xs px-2 py-0.5 ${assignedCount === 0 ? 'text-muted-foreground border-dashed' : ''}`}
                      >
                        <Users className="h-3 w-3" />
                        <span>
                          {assignedCount} membre{assignedCount > 1 ? 's' : ''}
                        </span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Form Modal */}
      <InviteCollaboratorForm
        open={showInviteForm}
        onOpenChange={setShowInviteForm}
        onSubmit={handleInvite}
        isSubmitting={isInviting}
        availableRoles={assignableRoles}
        customRoles={customRoles}
      />

      {/* Create Custom Role Dialog */}
      <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un rôle pour cet événement</DialogTitle>
            <DialogDescription>
              Choisissez précisément les permissions. Ce rôle sera disponible uniquement sur cet
              événement.
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            permissions={permissionsData?.permissions || []}
            onSubmit={handleCreateRole}
            isSubmitting={createRoleMutation.isPending || permissionsModulesLoading}
            submitLabel="Créer le rôle"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Custom Role Dialog */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Modifiez le nom, la description et les permissions du rôle "{editingRole?.name}".
            </DialogDescription>
          </DialogHeader>

          {editingRole && (
            <RoleForm
              initialData={{
                name: editingRole.name,
                description: editingRole.description || '',
                permissions: (editingRole.permissions || [])
                  .map((permName) => permissionNameToId.get(permName))
                  .filter((v): v is number => typeof v === 'number'),
              }}
              permissions={permissionsData?.permissions || []}
              onSubmit={handleUpdateRole}
              isSubmitting={updateRoleMutation.isPending || permissionsModulesLoading}
              submitLabel="Modifier le rôle"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Custom Role Confirmation */}
      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le rôle</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le rôle "{roleToDelete?.name}" ? Cette action est
              irréversible.
              <br />
              <span className="text-sm">
                Note: un rôle ne peut pas être supprimé s'il est assigné à au moins un
                collaborateur.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              disabled={deleteRoleMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRoleMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
