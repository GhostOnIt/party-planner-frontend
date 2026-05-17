import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminQuoteStages,
  useCreateQuoteStage,
  useUpdateQuoteStageConfig,
  useDeleteQuoteStage,
  useReorderQuoteStages,
} from '@/hooks/useQuoteRequests';
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
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

/**
 * Gestionnaire des étapes du workflow Demande Business.
 * Utilisé comme onglet admin dans SettingsPage.
 */
export function QuoteStagesManager() {
  const { toast } = useToast();
  const { data: stages = [] } = useAdminQuoteStages();
  const { mutate: createStage, isPending: isCreating } = useCreateQuoteStage();
  const { mutate: updateStage } = useUpdateQuoteStageConfig();
  const { mutate: deleteStage } = useDeleteQuoteStage();
  const { mutate: reorderStages } = useReorderQuoteStages();

  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sortedStages = [...stages].sort((a, b) => a.sort_order - b.sort_order);

  const handleCreate = () => {
    if (!newName.trim() || !newSlug.trim()) return;
    const maxOrder = stages.reduce((max, s) => Math.max(max, s.sort_order), -1);
    createStage(
      { name: newName.trim(), slug: newSlug.trim(), sort_order: maxOrder + 1 },
      {
        onSuccess: () => {
          setNewName('');
          setNewSlug('');
          toast({ title: 'Étape créée' });
        },
        onError: () =>
          toast({
            title: 'Erreur',
            description: 'Le slug est peut-être déjà utilisé.',
            variant: 'destructive',
          }),
      }
    );
  };

  const handleSaveEdit = (stageId: string) => {
    if (!editName.trim()) return;
    updateStage(
      { stageId, name: editName.trim() },
      {
        onSuccess: () => {
          setEditingId(null);
          toast({ title: 'Étape mise à jour' });
        },
      }
    );
  };

  const handleToggleActive = (stageId: string, currentlyActive: boolean) => {
    updateStage(
      { stageId, is_active: !currentlyActive },
      {
        onSuccess: () =>
          toast({ title: !currentlyActive ? 'Étape activée' : 'Étape désactivée' }),
      }
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sortedStages.length) return;

    const newOrder = sortedStages.map((s, i) => {
      if (i === index) return { id: s.id, sort_order: sortedStages[swapIndex].sort_order };
      if (i === swapIndex) return { id: s.id, sort_order: sortedStages[index].sort_order };
      return { id: s.id, sort_order: s.sort_order };
    });
    reorderStages(newOrder, {
      onSuccess: () => toast({ title: 'Ordre mis à jour' }),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteStage(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        toast({ title: 'Étape supprimée' });
      },
      onError: () =>
        toast({
          title: 'Erreur',
          description: 'Cette étape ne peut pas être supprimée.',
          variant: 'destructive',
        }),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Workflow Demande Business</h3>
        <p className="text-sm text-muted-foreground">
          Configurez les étapes par lesquelles passent les demandes de devis Business.
        </p>
      </div>

      <div className="space-y-2">
        {sortedStages.map((stage, index) => (
          <Card key={stage.id}>
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  disabled={index === sortedStages.length - 1}
                  onClick={() => handleMove(index, 'down')}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              <span className="text-xs text-muted-foreground w-6">{stage.sort_order}</span>

              <div className="flex-1">
                {editingId === stage.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(stage.id);
                      }}
                    />
                    <Button size="sm" className="h-8" onClick={() => handleSaveEdit(stage.id)}>
                      OK
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditingId(null)}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => {
                      setEditingId(stage.id);
                      setEditName(stage.name);
                    }}
                  >
                    <span className="font-medium">{stage.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{stage.slug}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {stage.is_system && <Badge variant="secondary">Système</Badge>}
                <Switch
                  checked={stage.is_active}
                  onCheckedChange={() => handleToggleActive(stage.id, stage.is_active)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={stage.is_system}
                  onClick={() => setDeleteId(stage.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add new stage */}
      <Card>
        <CardContent className="p-3">
          <p className="text-sm font-medium mb-2">Ajouter une étape personnalisée</p>
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom de l'étape"
              className="flex-1"
            />
            <Input
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="slug_unique"
              className="w-[180px]"
            />
            <Button
              size="sm"
              disabled={isCreating || !newName.trim() || !newSlug.trim()}
              onClick={handleCreate}
            >
              <Plus className="mr-1 h-4 w-4" /> {isCreating ? 'Création...' : 'Ajouter'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette étape ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les demandes associées à cette étape ne seront pas supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
