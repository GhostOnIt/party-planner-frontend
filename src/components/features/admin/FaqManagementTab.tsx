import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useAdminFaqs, useCreateFaq, useUpdateFaq, useDeleteFaq } from '@/hooks/useAdminFaqs';
import { useToast } from '@/hooks/use-toast';
import type { Faq } from '@/types';

const faqFormSchema = z.object({
  question: z.string().min(1, 'La question est requise'),
  answer: z.string().min(1, 'La réponse est requise'),
  order: z.number().min(0, "L'ordre doit être positif"),
  is_active: z.boolean(),
});

type FaqFormValues = z.infer<typeof faqFormSchema>;

export function FaqManagementTab() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editFaq, setEditFaq] = useState<Faq | null>(null);
  const [deleteFaq, setDeleteFaq] = useState<Faq | null>(null);

  const { data: faqs = [], isLoading } = useAdminFaqs();
  const { mutate: createFaq, isPending: isCreating } = useCreateFaq();
  const { mutate: updateFaq, isPending: isUpdating } = useUpdateFaq();
  const { mutate: deleteFaqMutation, isPending: isDeleting } = useDeleteFaq();

  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: '',
      answer: '',
      order: faqs.length > 0 ? Math.max(...faqs.map((f) => f.order)) + 1 : 1,
      is_active: true,
    },
  });

  const openCreateForm = () => {
    form.reset({
      question: '',
      answer: '',
      order: faqs.length > 0 ? Math.max(...faqs.map((f) => f.order)) + 1 : 1,
      is_active: true,
    });
    setEditFaq(null);
    setFormOpen(true);
  };

  const openEditForm = (faq: Faq) => {
    form.reset({
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      is_active: faq.is_active,
    });
    setEditFaq(faq);
    setFormOpen(true);
  };

  const handleSubmit = (data: FaqFormValues) => {
    if (editFaq) {
      updateFaq(
        { id: editFaq.id, data },
        {
          onSuccess: () => {
            setFormOpen(false);
          },
        }
      );
    } else {
      createFaq(data, {
        onSuccess: () => {
          setFormOpen(false);
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteFaq) return;

    deleteFaqMutation(deleteFaq.id, {
      onSuccess: () => {
        setDeleteFaq(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions fréquentes</CardTitle>
              <CardDescription>
                {faqs.length} question{faqs.length !== 1 ? 's' : ''} configurée{faqs.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button onClick={openCreateForm}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-muted-foreground">Aucune FAQ configurée</p>
              <Button className="mt-4" onClick={openCreateForm}>
                <Plus className="mr-2 h-4 w-4" />
                Créer une FAQ
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Ordre</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{faq.question}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{faq.answer}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{faq.order}</span>
                      </TableCell>
                      <TableCell>
                        {faq.is_active ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="mr-1 h-3 w-3" />
                            Inactif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditForm(faq)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteFaq(faq)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editFaq ? 'Modifier la FAQ' : 'Nouvelle FAQ'}</DialogTitle>
            <DialogDescription>
              {editFaq ? 'Modifiez les informations de la FAQ' : 'Créez une nouvelle question fréquente'}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit, (errors) => {
              console.error('Form validation errors:', errors);
              toast({
                title: 'Erreur de validation',
                description: 'Veuillez corriger les erreurs dans le formulaire.',
                variant: 'destructive',
              });
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input id="question" {...form.register('question')} placeholder="Ex: Comment fonctionne la facturation ?" />
              {form.formState.errors.question && (
                <p className="text-sm text-destructive">{form.formState.errors.question.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Réponse *</Label>
              <Textarea
                id="answer"
                {...form.register('answer')}
                rows={6}
                placeholder="Ex: Chaque plan est facturé mensuellement..."
              />
              {form.formState.errors.answer && (
                <p className="text-sm text-destructive">{form.formState.errors.answer.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="order">Ordre d'affichage</Label>
                <Input
                  id="order"
                  type="number"
                  {...form.register('order', { valueAsNumber: true })}
                  min={0}
                />
                {form.formState.errors.order && (
                  <p className="text-sm text-destructive">{form.formState.errors.order.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-8">
                <Switch
                  id="is_active"
                  checked={form.watch('is_active')}
                  onCheckedChange={(checked) => form.setValue('is_active', checked)}
                />
                <Label htmlFor="is_active">FAQ active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating
                  ? 'Enregistrement...'
                  : editFaq
                    ? 'Mettre à jour'
                    : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteFaq} onOpenChange={(open) => !open && setDeleteFaq(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la FAQ ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La FAQ "{deleteFaq?.question}" sera supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

