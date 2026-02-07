import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Download, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  BudgetFilters,
  BudgetForm,
  BudgetList,
} from '@/components/features/budget';
import {
  useBudget,
  useCreateBudgetItem,
  useUpdateBudgetItem,
  useDeleteBudgetItem,
  useMarkPaid,
  useMarkUnpaid,
  useExportBudget,
} from '@/hooks/useBudget';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { PermissionGuard } from '@/components/ui/permission-guard';
import type {
  BudgetItem,
  BudgetFilters as BudgetFiltersType,
  CreateBudgetItemFormData,
  BudgetCategory,
} from '@/types';

interface BudgetPageProps {
  eventId?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(value);
}

const CATEGORY_LABELS: Record<BudgetCategory, string> = {
  location: 'Lieu',
  catering: 'Traiteur',
  decoration: 'Decoration',
  entertainment: 'Animation',
  photography: 'Photo',
  transportation: 'Transport',
  other: 'Autre',
};

const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  location: '#3b82f6',
  catering: '#f97316',
  decoration: '#ec4899',
  entertainment: '#eab308',
  photography: '#8b5cf6',
  transportation: '#22c55e',
  other: '#6b7280',
};

export function BudgetPage({ eventId: propEventId }: BudgetPageProps) {
  const { id: paramEventId } = useParams<{ id: string }>();
  const eventId = propEventId || paramEventId;
  const { toast } = useToast();

  const [filters, setFilters] = useState<BudgetFiltersType>({ per_page: 10 });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | undefined>();
  const [itemToDelete, setItemToDelete] = useState<BudgetItem | null>(null);

  const featureAccess = useFeatureAccess(eventId!);
  const { data: budgetData, isLoading: isLoadingBudget } = useBudget(eventId!, filters);
  const stats = budgetData?.stats;
  const meta = budgetData?.meta;
  const isLoadingStats = isLoadingBudget;
  const { mutate: createItem, isPending: isCreating } = useCreateBudgetItem(eventId!);
  const { mutate: updateItem, isPending: isUpdating } = useUpdateBudgetItem(eventId!);
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteBudgetItem(eventId!);
  const { mutate: markPaid } = useMarkPaid(eventId!);
  const { mutate: markUnpaid } = useMarkUnpaid(eventId!);
  const { mutate: exportBudget, isPending: isExporting } = useExportBudget(eventId!);

  const items = budgetData?.data || [];

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleAddItem = () => {
    setEditingItem(undefined);
    setShowForm(true);
  };

  const handleEditItem = (item: BudgetItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormSubmit = (data: CreateBudgetItemFormData) => {
    if (editingItem) {
      updateItem(
        { itemId: editingItem.id, data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingItem(undefined);
            toast({
              title: 'Depense modifiee',
              description: 'La depense a ete modifiee avec succes.',
            });
          },
        }
      );
    } else {
      createItem(data, {
        onSuccess: () => {
          setShowForm(false);
          toast({
            title: 'Depense ajoutee',
            description: 'La depense a ete ajoutee avec succes.',
          });
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id, {
        onSuccess: () => {
          setItemToDelete(null);
          toast({
            title: 'Depense supprimee',
            description: 'La depense a ete supprimee avec succes.',
          });
        },
      });
    }
  };

  const handleMarkPaid = (item: BudgetItem) => {
    markPaid(item.id, {
      onSuccess: () => {
        toast({
          title: 'Paiement enregistre',
          description: `"${item.name}" a ete marque comme paye.`,
        });
      },
    });
  };

  const handleMarkUnpaid = (item: BudgetItem) => {
    markUnpaid(item.id, {
      onSuccess: () => {
        toast({
          title: 'Paiement annule',
          description: `"${item.name}" a ete marque comme non paye.`,
        });
      },
    });
  };

  const handleExport = (format: 'csv' | 'pdf' | 'xlsx') => {
    exportBudget(format, {
      onSuccess: () => {
        toast({
          title: 'Export reussi',
          description: `Le budget a ete exporte en ${format.toUpperCase()}.`,
        });
      },
    });
  };

  if (!eventId) {
    return null;
  }

  const totalEstimated = stats?.total_estimated ?? 0;
  const totalActual = stats?.total_actual ?? 0;
  const totalPaid = stats?.total_paid ?? 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <PermissionGuard eventId={eventId!} permissions={['budget.view']}>
        <div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Budget estime</CardDescription>
                <CardTitle className="text-2xl">
                  {isLoadingStats ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    formatCurrency(totalEstimated)
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {stats?.items_count ?? 0} postes de depenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Depenses reelles</CardDescription>
                <CardTitle className="text-2xl">
                  {isLoadingStats ? <Skeleton className="h-8 w-32" /> : formatCurrency(totalActual)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {totalEstimated > 0
                    ? totalActual <= totalEstimated
                      ? `${formatCurrency(totalEstimated - totalActual)} economises`
                      : `${formatCurrency(totalActual - totalEstimated)} de depassement`
                    : 'Aucun budget defini'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Deja paye</CardDescription>
                <CardTitle className="text-2xl">
                  {isLoadingStats ? <Skeleton className="h-8 w-32" /> : formatCurrency(totalPaid)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {totalActual > 0
                    ? `${((totalPaid / totalActual) * 100).toFixed(0)}% des depenses`
                    : '0% des depenses'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Category Summary */}
          {stats?.by_category && stats.by_category.length > 0 && (
            <Card className='mt-4'>
              <CardHeader>
                <CardTitle>Repartition par categorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.by_category.map((cat) => {
                    const percentage =
                      totalEstimated > 0 ? (cat.estimated / totalEstimated) * 100 : 0;
                    return (
                      <div key={cat.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#6b7280' }}
                          />
                          <span className="font-medium">
                            {CATEGORY_LABELS[cat.category] || cat.category}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({cat.count} élément{cat.count !== 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(cat.estimated)}</p>
                          <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PermissionGuard>

      {/* Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BudgetFilters filters={filters} onFiltersChange={setFilters} />

        <div className="flex items-center gap-2">
          {featureAccess.budget.canExport && (
            <PermissionGuard eventId={eventId!} permissions={['budget.export']}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>Export CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>Export PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </PermissionGuard>
          )}

          {featureAccess.budget.canCreate && (
            <PermissionGuard eventId={eventId!} permissions={['budget.create']}>
              <Button onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une depense
              </Button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {/* Budget List */}
      <PermissionGuard
        eventId={eventId!}
        permissions={['budget.view']}
        fallback={
          <EmptyState
            icon={Wallet}
            title="Accès restreint"
            description="Vous n'avez pas les permissions nécessaires pour consulter le budget de cet événement."
          />
        }
      >
        {!isLoadingBudget && items.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Aucune depense"
            description={
              filters.category || filters.paid !== undefined || filters.search
                ? 'Aucune depense ne correspond a vos criteres de recherche'
                : "Vous n'avez pas encore ajoute de depenses. Commencez par en ajouter une !"
            }
            action={
              featureAccess.budget.canCreate &&
              !filters.category &&
              filters.paid === undefined &&
              !filters.search
                ? {
                    label: 'Ajouter une depense',
                    onClick: handleAddItem,
                  }
                : undefined
            }
          />
        ) : (
          <>
            <BudgetList
              items={items}
              isLoading={isLoadingBudget}
              selectedIds={selectedIds}
              onSelectChange={setSelectedIds}
              onEdit={handleEditItem}
              onDelete={setItemToDelete}
              onMarkPaid={handleMarkPaid}
              onMarkUnpaid={handleMarkUnpaid}
            />

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(meta.current_page - 1)}
                      className={cn(meta.current_page === 1 && 'pointer-events-none opacity-50')}
                    />
                  </PaginationItem>

                  {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                    .filter((page) => {
                      const current = meta.current_page;
                      return (
                        page === 1 ||
                        page === meta.last_page ||
                        (page >= current - 1 && page <= current + 1)
                      );
                    })
                    .map((page, index, array) => (
                      <PaginationItem key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2">...</span>
                        )}
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={page === meta.current_page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(meta.current_page + 1)}
                      className={cn(
                        meta.current_page === meta.last_page && 'pointer-events-none opacity-50'
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </PermissionGuard>

      {/* Budget Form Modal */}
      <BudgetForm
        open={showForm}
        onOpenChange={setShowForm}
        item={editingItem}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la depense</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer "{itemToDelete?.name}" ? Cette action est
              irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
