import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

// Map common color names to hex for native color input (value must be #rrggbb)
const COLOR_NAME_TO_HEX: Record<string, string> = {
  gray: '#6b7280',
  grey: '#6b7280',
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  orange: '#f97316',
  purple: '#a855f7',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6',
  cyan: '#06b6d4',
};
function toHexColor(color: string | null | undefined): string {
  if (!color) return '#6b7280';
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return color;
  return COLOR_NAME_TO_HEX[color.toLowerCase()] ?? '#6b7280';
}
function formColorForPicker(color: string | undefined): string {
  if (!color) return '#6b7280';
  if (/^#[0-9A-Fa-f]{6}$/.test(color)) return color;
  return toHexColor(color);
}

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  useEventTypes,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
  type UserEventType,
  type CreateEventTypeData,
} from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/skeleton';

export function EventTypesManager() {
  const { toast } = useToast();
  const { data: eventTypes, isLoading } = useEventTypes();
  const createMutation = useCreateEventType();
  const updateMutation = useUpdateEventType();
  const deleteMutation = useDeleteEventType();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<UserEventType | null>(null);
  const [formData, setFormData] = useState<CreateEventTypeData>({
    name: '',
    slug: '',
    color: '#6b7280',
  });

  const handleCreate = () => {
    setFormData({ name: '', slug: '', color: '#6b7280' });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (type: UserEventType) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      slug: type.slug,
      color: toHexColor(type.color),
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (type: UserEventType) => {
    setSelectedType(type);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: 'Type créé',
          description: 'Le type d\'événement a été créé avec succès.',
        });
        setIsCreateDialogOpen(false);
        setFormData({ name: '', slug: '', color: '#6b7280' });
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
    if (!selectedType) return;

    updateMutation.mutate(
      { id: selectedType.id, data: formData },
      {
        onSuccess: () => {
          toast({
            title: 'Type modifié',
            description: 'Le type d\'événement a été modifié avec succès.',
          });
          setIsEditDialogOpen(false);
          setSelectedType(null);
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
    if (!selectedType) return;

    deleteMutation.mutate(selectedType.id, {
      onSuccess: () => {
        toast({
          title: 'Type supprimé',
          description: 'Le type d\'événement a été supprimé avec succès.',
        });
        setIsDeleteDialogOpen(false);
        setSelectedType(null);
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
          <h3 className="text-lg font-semibold">Types d'événement</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les types d'événement disponibles pour votre compte
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un type
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Couleur</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventTypes?.map((type) => (
              <TableRow key={type.id}>
                <TableCell className="font-medium">{type.name}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{type.slug}</code>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: toHexColor(type.color) }}
                    />
                    <span className="text-sm font-mono">{toHexColor(type.color)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {type.is_default ? (
                    <Badge variant="secondary">Par défaut</Badge>
                  ) : (
                    <Badge variant="outline">Personnalisé</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {!type.is_default && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(type)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(type)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un type d'événement</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau type d'événement personnalisé pour votre compte
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Conférence"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                }
                placeholder="Ex: conference"
              />
              <p className="text-xs text-muted-foreground">
                Identifiant unique (lettres minuscules, chiffres, tirets et underscores uniquement)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-color">Couleur</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="type-color"
                  value={formColorForPicker(formData.color)}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded-md border border-input bg-transparent p-1"
                  title="Choisir une couleur"
                />
                <Input
                  value={formData.color ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '') {
                      setFormData({ ...formData, color: '#6b7280' });
                    } else if (/^#[0-9A-Fa-f]{0,6}$/.test(v) || /^[0-9A-Fa-f]{0,6}$/.test(v)) {
                      const hex = v.startsWith('#') ? v : `#${v}`;
                      setFormData({ ...formData, color: hex });
                    }
                  }}
                  placeholder="#6b7280"
                  className="font-mono text-sm max-w-32"
                />
              </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le type d'événement</DialogTitle>
            <DialogDescription>
              Modifiez les informations du type d'événement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type-color">Couleur</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  id="edit-type-color"
                  value={formColorForPicker(formData.color)}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded-md border border-input bg-transparent p-1"
                  title="Choisir une couleur"
                />
                <Input
                  value={formData.color ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '') {
                      setFormData({ ...formData, color: '#6b7280' });
                    } else if (/^#[0-9A-Fa-f]{0,6}$/.test(v) || /^[0-9A-Fa-f]{0,6}$/.test(v)) {
                      const hex = v.startsWith('#') ? v : `#${v}`;
                      setFormData({ ...formData, color: hex });
                    }
                  }}
                  placeholder="#6b7280"
                  className="font-mono text-sm max-w-32"
                />
              </div>
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
            <AlertDialogTitle>Supprimer le type d'événement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le type "{selectedType?.name}" ? Cette action est
              irréversible. Si ce type est utilisé dans des événements, vous devrez d'abord modifier
              ou supprimer ces événements.
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

