import { useState } from 'react';
import { Plus, Settings, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useCustomRoles, usePermissions, useCreateCustomRole, useUpdateCustomRole, useDeleteCustomRole } from '@/hooks/useCustomRoles';
import { useToast } from '@/hooks/use-toast';
import { RoleForm } from './RoleForm';
import type { CustomRole, CustomRoleFormData } from '@/types';

interface RoleManagerProps {
  eventId: string;
  canManage: boolean;
}

export function RoleManager({ eventId, canManage }: RoleManagerProps) {
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [deletingRole, setDeletingRole] = useState<CustomRole | null>(null);

  const { data: rolesData, isLoading: rolesLoading } = useCustomRoles(eventId);
  const { data: permissionsData } = usePermissions();

  const createRoleMutation = useCreateCustomRole(eventId);
  const updateRoleMutation = useUpdateCustomRole(eventId, editingRole?.id || 0);
  const deleteRoleMutation = useDeleteCustomRole(eventId, deletingRole?.id || 0);

  const roles = rolesData?.roles || [];
  const permissions = permissionsData?.permissions || [];

  // Separate system and custom roles
  const systemRoles = roles.filter(role => role.is_system);
  const customRoles = roles.filter(role => !role.is_system);

  const handleCreateRole = (data: CustomRoleFormData) => {
    createRoleMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateForm(false);
        toast({
          title: 'Rôle créé',
          description: 'Le rôle personnalisé a été créé avec succès.',
        });
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la création du rôle.',
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
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la modification du rôle.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleDeleteRole = () => {
    if (!deletingRole) return;

    deleteRoleMutation.mutate(undefined, {
      onSuccess: () => {
        setDeletingRole(null);
        toast({
          title: 'Rôle supprimé',
          description: 'Le rôle personnalisé a été supprimé avec succès.',
        });
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la suppression du rôle.',
          variant: 'destructive',
        });
      },
    });
  };

  if (rolesLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des rôles</h2>
          <p className="text-muted-foreground">
            Gérez les rôles personnalisés pour cet événement
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rôle
          </Button>
        )}
      </div>

      {/* System Roles */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Rôles système</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {systemRoles.map((role) => (
            <Card key={role.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    {role.name}
                  </CardTitle>
                  <Badge variant="secondary">Système</Badge>
                </div>
                {role.description && (
                  <CardDescription>{role.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission.replace('.', ' › ')}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3} autres
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Roles */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Rôles personnalisés</h3>
        {customRoles.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Aucun rôle personnalisé</h3>
                <p className="text-muted-foreground mb-4">
                  Créez des rôles personnalisés adaptés aux besoins de votre événement.
                </p>
                {canManage && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer le premier rôle
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {customRoles.map((role) => (
              <Card key={role.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {role.name}
                    </CardTitle>
                    {canManage && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingRole(role)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {role.description && (
                    <CardDescription>{role.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission.replace('.', ' › ')}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 3} autres
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Role Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un rôle personnalisé</DialogTitle>
            <DialogDescription>
              Définissez les permissions pour ce nouveau rôle.
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            permissions={permissions}
            onSubmit={handleCreateRole}
            isSubmitting={createRoleMutation.isPending}
            submitLabel="Créer le rôle"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Modifiez les permissions du rôle "{editingRole?.name}".
            </DialogDescription>
          </DialogHeader>
          {editingRole && (
            <RoleForm
              initialData={{
                name: editingRole.name,
                description: editingRole.description || '',
                permissions: [], // This would need to be converted from permission names to IDs
              }}
              permissions={permissions}
              onSubmit={handleUpdateRole}
              isSubmitting={updateRoleMutation.isPending}
              submitLabel="Modifier le rôle"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation */}
      <AlertDialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le rôle</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le rôle "{deletingRole?.name}" ?
              Cette action est irréversible et supprimera également ce rôle de tous les collaborateurs qui l'utilisent.
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
    </div>
  );
}
