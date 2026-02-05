import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RoleForm } from '@/components/features/roles/RoleForm';
import {
  useSettingsRoles,
  usePermissions,
  useCreateUserCustomRole,
  useUpdateUserCustomRole,
  useDeleteUserCustomRole,
  type SettingsRole,
} from '@/hooks/useCustomRoles';
import type { CustomRoleFormData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export function CollaboratorRolesManager() {
  const { toast } = useToast();
  const { data: rolesData, isLoading } = useSettingsRoles();
  const { data: permissionsData, isLoading: permissionsLoading } = usePermissions();
  const createMutation = useCreateUserCustomRole();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SettingsRole | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<SettingsRole | null>(null);

  const roles = rolesData?.roles || [];
  const editingRoleId = editingRole && typeof editingRole.id === 'number' ? editingRole.id : 0;
  const roleToDeleteId = roleToDelete && typeof roleToDelete.id === 'number' ? roleToDelete.id : 0;
  const updateMutation = useUpdateUserCustomRole(editingRoleId);
  const deleteMutation = useDeleteUserCustomRole(roleToDeleteId);

  const permissionNameToId = new Map<string, number>();
  (permissionsData?.permissions || []).forEach((module) => {
    module.permissions.forEach((p) => {
      permissionNameToId.set(p.name, p.id);
    });
  });

  const slugFromRole = (role: SettingsRole) => {
    if (typeof role.id === 'string' && role.id.startsWith('system_')) {
      return role.id.replace('system_', '');
    }
    return role.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '');
  };

  const handleCreate = (data: CustomRoleFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        toast({
          title: 'Rôle créé',
          description: 'Le rôle a été créé avec succès.',
        });
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { message?: string; errors?: { name?: string[] } } } };
        toast({
          title: 'Erreur',
          description: e?.response?.data?.message || e?.response?.data?.errors?.name?.[0] || 'Une erreur est survenue.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleUpdate = (data: CustomRoleFormData) => {
    if (!editingRole || editingRole.is_system) return;
    updateMutation.mutate(data, {
      onSuccess: () => {
        setEditingRole(null);
        toast({
          title: 'Rôle modifié',
          description: 'Le rôle a été modifié avec succès.',
        });
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { message?: string } } };
        toast({
          title: 'Erreur',
          description: e?.response?.data?.message || 'Une erreur est survenue.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!roleToDelete || roleToDelete.is_system) return;
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        setRoleToDelete(null);
        toast({
          title: 'Rôle supprimé',
          description: 'Le rôle a été supprimé avec succès.',
        });
      },
      onError: (err: unknown) => {
        const e = err as { response?: { data?: { message?: string } } };
        toast({
          title: 'Erreur',
          description: e?.response?.data?.message || 'Une erreur est survenue.',
          variant: 'destructive',
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rôles de collaborateurs</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les rôles disponibles pour inviter des collaborateurs à vos événements
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un rôle
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={String(role.id)}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {slugFromRole(role)}
                  </code>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {role.description || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {Array.isArray(role.permissions) ? role.permissions.length : 0} permission(s)
                  </Badge>
                </TableCell>
                <TableCell>
                  {role.is_system ? (
                    <Badge variant="secondary">Système</Badge>
                  ) : (
                    <Badge variant="outline">Personnalisé</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {!role.is_system && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingRole(role)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRoleToDelete(role)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un rôle</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau rôle personnalisé pour vos collaborateurs. Choisissez les permissions par module.
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            permissions={permissionsData?.permissions || []}
            onSubmit={handleCreate}
            isSubmitting={createMutation.isPending || permissionsLoading}
            submitLabel="Créer"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Modifiez les informations du rôle &quot;{editingRole?.name}&quot;
            </DialogDescription>
          </DialogHeader>
          {editingRole && !editingRole.is_system && (
            <RoleForm
              initialData={{
                name: editingRole.name,
                description: editingRole.description || '',
                permissions: (editingRole.permissions || [])
                  .map((name) => permissionNameToId.get(name))
                  .filter((id): id is number => typeof id === 'number'),
              }}
              permissions={permissionsData?.permissions || []}
              onSubmit={handleUpdate}
              isSubmitting={updateMutation.isPending || permissionsLoading}
              submitLabel="Modifier"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le rôle ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le rôle &quot;{roleToDelete?.name}&quot; ? Cette action est
              irréversible. Si ce rôle est utilisé dans des collaborations, vous devrez d&apos;abord modifier
              ces collaborations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
