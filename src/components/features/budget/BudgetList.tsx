import { MoreHorizontal, Paperclip, Pencil, ReceiptText, Trash2, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useBudgetCategories } from '@/hooks/useSettings';
import type { BudgetItem, BudgetPaymentAttachment, BudgetItemPayment } from '@/types';
import { cn } from '@/lib/utils';

interface BudgetListProps {
  items: BudgetItem[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  onEdit: (item: BudgetItem) => void;
  onDelete: (item: BudgetItem) => void;
  onMarkPaid: (item: BudgetItem) => void;
  onMarkUnpaid: (item: BudgetItem) => void;
  onPreviewAttachment: (item: BudgetItem, payment: BudgetItemPayment, attachment: BudgetPaymentAttachment) => void;
}

function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(value);
}

function getPaymentStatus(item: BudgetItem): { label: string; className: string } {
  switch (item.payment_status) {
    case 'paid':
      return { label: 'Payé', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' };
    case 'partially_paid':
      return { label: 'Partiel', className: 'border-amber-200 bg-amber-50 text-amber-700' };
    default:
      return { label: 'Non payé', className: 'border-slate-200 bg-slate-50 text-slate-700' };
  }
}

const DEFAULT_CATEGORY_SLUGS = [
  'location', 'catering', 'decoration', 'entertainment', 'photography', 'transportation', 'other',
];

export function BudgetList({
  items,
  isLoading = false,
  selectedIds,
  onSelectChange,
  onEdit,
  onDelete,
  onMarkPaid,
  onMarkUnpaid,
  onPreviewAttachment,
}: BudgetListProps) {
  const { data: userCategories = [] } = useBudgetCategories();
  const categoryBySlug = Object.fromEntries(
    userCategories.map((c) => [c.slug, { name: c.name, color: c.color }])
  );

  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectChange([]);
    } else {
      onSelectChange(items.map((item) => String(item.id)));
    }
  };

  const handleSelectOne = (id: string) => {
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
              <TableHead className="text-center">Paiement</TableHead>
              <TableHead className="text-center">Justif.</TableHead>
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
            <TableHead className="text-center">Justif.</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isOverBudget =
              item.actual_cost !== null &&
              item.actual_cost > item.estimated_cost;
            const paymentStatus = getPaymentStatus(item);
            const attachments = item.payments
              ?.flatMap((payment) => payment.attachments.map((attachment) => ({ payment, attachment })))
              ?? [];

            return (
              <TableRow
                key={item.id}
                className={cn(selectedIds.includes(String(item.id)) && 'bg-muted/50')}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(String(item.id))}
                    onCheckedChange={() => handleSelectOne(String(item.id))}
                    aria-label={`Selectionner ${item.name}`}
                  />
                </TableCell>
                <TableCell>
                  <CategoryBadge
                    category={item.category}
                    label={DEFAULT_CATEGORY_SLUGS.includes(item.category) ? undefined : categoryBySlug[item.category]?.name}
                    color={DEFAULT_CATEGORY_SLUGS.includes(item.category) ? undefined : categoryBySlug[item.category]?.color}
                  />
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
                  <div className="flex flex-col items-center gap-1">
                    <Badge variant="outline" className={paymentStatus.className}>
                      {paymentStatus.label}
                    </Badge>
                    {Number(item.total_paid ?? 0) > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(Number(item.total_paid))}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {attachments.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 px-2"
                          title="Voir les justificatifs"
                        >
                          <Paperclip className="h-4 w-4" />
                          <span className="text-xs">{attachments.length}</span>
                          <span className="sr-only">Voir les justificatifs</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {attachments.map(({ payment, attachment }) => (
                          <DropdownMenuItem
                            key={attachment.id}
                            onClick={() => onPreviewAttachment(item, payment, attachment)}
                          >
                            <Paperclip className="mr-2 h-4 w-4" />
                            {attachment.original_name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="text-muted-foreground">-</span>
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
                      <DropdownMenuItem onClick={() => onMarkPaid(item)}>
                        <ReceiptText className="mr-2 h-4 w-4" />
                        Enregistrer un paiement
                      </DropdownMenuItem>
                      {item.payment_status !== 'unpaid' && (
                        <DropdownMenuItem onClick={() => onMarkUnpaid(item)}>
                          <X className="mr-2 h-4 w-4" />
                          Annuler les paiements
                        </DropdownMenuItem>
                      )}
                      {item.payments?.flatMap((payment) =>
                        payment.attachments.map((attachment) => (
                          <DropdownMenuItem
                            key={attachment.id}
                            onClick={() => onPreviewAttachment(item, payment, attachment)}
                          >
                            <Paperclip className="mr-2 h-4 w-4" />
                            Voir {attachment.original_name}
                          </DropdownMenuItem>
                        ))
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
