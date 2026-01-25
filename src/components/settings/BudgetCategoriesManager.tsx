import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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
  useBudgetCategories,
  useCreateBudgetCategory,
  useUpdateBudgetCategory,
  useDeleteBudgetCategory,
  type UserBudgetCategory,
  type CreateBudgetCategoryData,
} from '@/hooks/useSettings';
import { Skeleton } from '@/components/ui/skeleton';

export function BudgetCategoriesManager() {
  const { toast } = useToast();
  const { data: categories, isLoading } = useBudgetCategories();
  const createMutation = useCreateBudgetCategory();
  const updateMutation = useUpdateBudgetCategory();
  const deleteMutation = useDeleteBudgetCategory();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<UserBudgetCategory | null>(null);
  const [formData, setFormData] = useState<CreateBudgetCategoryData>({
    name: '',
    slug: '',
    color: 'gray',
  });

  const handleCreate = () => {
    setFormData({ name: '', slug: '', color: 'gray' });
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (category: UserBudgetCategory) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      color: category.color || 'gray',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (category: UserBudgetCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: 'Catégorie créée',
          description: 'La catégorie de budget a été créée avec succès.',
        });
        setIsCreateDialogOpen(false);
        setFormData({ name: '', slug: '', color: 'gray' });
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
    if (!selectedCategory) return;

    updateMutation.mutate(
      { id: selectedCategory.id, data: formData },
      {
        onSuccess: () => {
          toast({
            title: 'Catégorie modifiée',
            description: 'La catégorie de budget a été modifiée avec succès.',
          });
          setIsEditDialogOpen(false);
          setSelectedCategory(null);
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
    if (!selectedCategory) return;

    deleteMutation.mutate(selectedCategory.id, {
      onSuccess: () => {
        toast({
          title: 'Catégorie supprimée',
          description: 'La catégorie de budget a été supprimée avec succès.',
        });
        setIsDeleteDialogOpen(false);
        setSelectedCategory(null);
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
          <h3 className="text-lg font-semibold">Catégories de budget</h3>
          <p className="text-sm text-muted-foreground">
            Gérez les catégories de budget disponibles pour vos événements
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une catégorie
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
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{category.slug}</code>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: category.color || '#gray' }}
                    />
                    <span className="text-sm">{category.color || 'gray'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {category.is_default ? (
                    <Badge variant="secondary">Par défaut</Badge>
                  ) : (
                    <Badge variant="outline">Personnalisé</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {!category.is_default && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category)}
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
            <DialogTitle>Créer une catégorie de budget</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle catégorie de budget personnalisée pour votre compte
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nom *</Label>
              <Input
                id="cat-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Location de matériel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">Slug *</Label>
              <Input
                id="cat-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                }
                placeholder="Ex: location-materiel"
              />
              <p className="text-xs text-muted-foreground">
                Identifiant unique (lettres minuscules, chiffres, tirets et underscores uniquement)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-color">Couleur</Label>
              <Input
                id="cat-color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="Ex: blue"
              />
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
            <DialogTitle>Modifier la catégorie de budget</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la catégorie de budget
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-cat-name">Nom *</Label>
              <Input
                id="edit-cat-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cat-slug">Slug *</Label>
              <Input
                id="edit-cat-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cat-color">Couleur</Label>
              <Input
                id="edit-cat-color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
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
            <AlertDialogTitle>Supprimer la catégorie de budget ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie "{selectedCategory?.name}" ? Cette action est
              irréversible. Si cette catégorie est utilisée dans des éléments de budget, vous devrez d'abord modifier
              ou supprimer ces éléments.
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

