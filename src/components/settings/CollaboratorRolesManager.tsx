import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  useCollaboratorRoles,
  useCreateCollaboratorRole,
  useUpdateCollaboratorRole,
  useDeleteCollaboratorRole,
  type UserCollaboratorRole,
  type CreateCollaboratorRoleData,
} from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/skeleton';

export function CollaboratorRolesManager() {
  const { toast } = useToast();
  const { data: roles, isLoading } = useCollaboratorRoles();
  const createMutation = useCreateCollaboratorRole();
  const updateMutation = useUpdateCollaboratorRole();
  const deleteMutation = useDeleteCollaboratorRole();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserCollaboratorRole | null>(null);
  const [formData, setFormData] = useState<CreateCollaboratorRoleData>({
    name: '',
    slug: '',
    description: '',
    permissions: [],
  });

  const handleCreate = () => {
    setFormData({ name: '', slug: '', description: '', permissions: [] });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (role: UserCollaboratorRole) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      permissions: role.permissions || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (role: UserCollaboratorRole) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: 'Rôle créé',
          description: 'Le rôle a été créé avec succès.',
        });
        setIsCreateDialogOpen(false);
        setFormData({ name: '', slug: '', description: '', permissions: [] });
      },
      onError: (error: any) => {
        toast({
          title: 'Erreur',
          description: error?.response?.data?.message || 'Une erreur est survenue.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleUpdateSubmit = () => {
    if (!selectedRole) return;

    updateMutation.mutate(
      { id: selectedRole.id, data: formData },
      {
        onSuccess: () => {
          toast({
            title: 'Rôle modifié',
            description: 'Le rôle a été modifié avec succès.',
          });
          setIsEditDialogOpen(false);
          setSelectedRole(null);
        },
        onError: (error: any) => {
          toast({
            title: 'Erreur',
            description: error?.response?.data?.message || 'Une erreur est survenue.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!selectedRole) return;

    deleteMutation.mutate(selectedRole.id, {
      onSuccess: () => {
        toast({
          title: 'Rôle supprimé',
          description: 'Le rôle a été supprimé avec succès.',
        });
        setIsDeleteDialogOpen(false);
        setSelectedRole(null);
      },
      onError: (error: any) => {
        toast({
          title: 'Erreur',
          description: error?.response?.data?.message || 'Une erreur est survenue.',
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
        <Button onClick={handleCreate}>
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
            {roles?.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{role.slug}</code>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {role.description || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{role.permissions?.length || 0} permission(s)</Badge>
                </TableCell>
                <TableCell>
                  {role.is_default ? (
                    <Badge variant="secondary">Par défaut</Badge>
                  ) : (
                    <Badge variant="outline">Personnalisé</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {!role.is_default && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(role)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(role)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un rôle</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau rôle personnalisé pour vos collaborateurs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Nom *</Label>
              <Input
                id="role-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Organisateur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-slug">Slug *</Label>
              <Input
                id="role-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                }
                placeholder="Ex: organisateur"
              />
              <p className="text-xs text-muted-foreground">
                Identifiant unique (lettres minuscules, chiffres, tirets et underscores uniquement)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Décrivez les responsabilités de ce rôle..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <p className="text-xs text-muted-foreground">
                La gestion des permissions sera disponible dans une prochaine version.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={!formData.name || !formData.slug || createMutation.isPending}
            >
              {createMutation.isPending ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Modifiez les informations du rôle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">Nom *</Label>
              <Input
                id="edit-role-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-slug">Slug *</Label>
              <Input
                id="edit-role-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <p className="text-xs text-muted-foreground">
                La gestion des permissions sera disponible dans une prochaine version.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleUpdateSubmit}
              disabled={!formData.name || !formData.slug || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Modification...' : 'Modifier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le rôle ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le rôle "{selectedRole?.name}" ? Cette action est
              irréversible. Si ce rôle est utilisé dans des collaborations, vous devrez d'abord modifier
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

