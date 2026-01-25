import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchInput } from '@/components/forms/search-input';
import { categoryConfig } from './CategoryBadge';
import { useBudgetCategories } from '@/hooks/useSettings';
import type { BudgetFilters as BudgetFiltersType, BudgetCategory } from '@/types';

interface BudgetFiltersProps {
  filters: BudgetFiltersType;
  onFiltersChange: (filters: BudgetFiltersType) => void;
}

const defaultCategories: { value: BudgetCategory; label: string }[] = [
  { value: 'location', label: categoryConfig.location.label },
  { value: 'catering', label: categoryConfig.catering.label },
  { value: 'decoration', label: categoryConfig.decoration.label },
  { value: 'entertainment', label: categoryConfig.entertainment.label },
  { value: 'photography', label: categoryConfig.photography.label },
  { value: 'transportation', label: categoryConfig.transportation.label },
  { value: 'other', label: categoryConfig.other.label },
];

const paidStatuses = [
  { value: 'true', label: 'Paye' },
  { value: 'false', label: 'Non paye' },
];

export { defaultCategories as budgetCategories };

export function BudgetFilters({ filters, onFiltersChange }: BudgetFiltersProps) {
  // Load user's custom budget categories
  const { data: userBudgetCategories } = useBudgetCategories();
  
  // Use user's categories if available, otherwise fallback to default
  const categories = userBudgetCategories && userBudgetCategories.length > 0
    ? userBudgetCategories.map((cat: { slug: string; name: string }) => ({
        value: cat.slug as BudgetCategory,
        label: cat.name,
      }))
    : defaultCategories;
  
  const hasFilters = filters.category || filters.paid !== undefined || filters.search;

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category: value === 'all' ? undefined : (value as BudgetCategory),
    });
  };

  const handlePaidChange = (value: string) => {
    onFiltersChange({
      ...filters,
      paid: value === 'all' ? undefined : value === 'true',
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <SearchInput
        value={filters.search || ''}
        onChange={handleSearchChange}
        placeholder="Rechercher..."
        className="w-full sm:w-64"
      />

      <Select
        value={filters.category || 'all'}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Categorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes</SelectItem>
          {categories.map((cat: { value: BudgetCategory; label: string }) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.paid === undefined ? 'all' : String(filters.paid)}
        onValueChange={handlePaidChange}
      >
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous</SelectItem>
          {paidStatuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="gap-1"
        >
          <X className="h-4 w-4" />
          Effacer
        </Button>
      )}
    </div>
  );
}
