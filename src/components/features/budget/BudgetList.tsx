import { Check, MoreHorizontal, Pencil, Trash2, X, CheckCircle2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryBadge } from './CategoryBadge';
import type { BudgetItem } from '@/types';
import { cn } from '@/lib/utils';

interface BudgetListProps {
  items: BudgetItem[];
  isLoading?: boolean;
  selectedIds: number[];
  onSelectChange: (ids: number[]) => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (item: BudgetItem) => void;
  onMarkPaid: (item: BudgetItem) => void;
  onMarkUnpaid: (item: BudgetItem) => void;
}

function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(value);
}

export function BudgetList({
  items,
  isLoading = false,
  selectedIds,
  onSelectChange,
  onEdit,
  onDelete,
  onMarkPaid,
  onMarkUnpaid,
}: BudgetListProps) {
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectChange([]);
    } else {
      onSelectChange(items.map((item) => item.id));
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Categorie</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Fournisseur</TableHead>
              <TableHead className="text-right">Estime</TableHead>
              <TableHead className="text-right">Reel</TableHead>
              <TableHead className="text-center">Paye</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(ref) => {
                  if (ref) {
                    (ref as HTMLButtonElement).dataset.state = someSelected
                      ? 'indeterminate'
                      : allSelected
                        ? 'checked'
                        : 'unchecked';
                  }
                }}
                onCheckedChange={handleSelectAll}
                aria-label="Selectionner tout"
              />
            </TableHead>
            <TableHead>Categorie</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead className="text-right">Estime</TableHead>
            <TableHead className="text-right">Reel</TableHead>
            <TableHead className="text-center">Paye</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isOverBudget =
              item.actual_cost !== null &&
              item.actual_cost > item.estimated_cost;

            return (
              <TableRow
                key={item.id}
                className={cn(selectedIds.includes(item.id) && 'bg-muted/50')}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onCheckedChange={() => handleSelectOne(item.id)}
                    aria-label={`Selectionner ${item.name}`}
                  />
                </TableCell>
                <TableCell>
                  <CategoryBadge category={item.category} />
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.vendor_name || '-'}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.estimated_cost)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-medium',
                    isOverBudget && 'text-destructive'
                  )}
                >
                  {formatCurrency(item.actual_cost)}
                </TableCell>
                <TableCell className="text-center">
                  {item.paid ? (
                    <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      {item.paid ? (
                        <DropdownMenuItem onClick={() => onMarkUnpaid(item)}>
                          <X className="mr-2 h-4 w-4" />
                          Marquer non paye
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onMarkPaid(item)}>
                          <Check className="mr-2 h-4 w-4" />
                          Marquer paye
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(item)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
