import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { PhotoFilters as PhotoFiltersType } from '@/types';

interface PhotoFiltersProps {
  filters: PhotoFiltersType;
  onFiltersChange: (filters: PhotoFiltersType) => void;
}

export function PhotoFilters({ filters, onFiltersChange }: PhotoFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
      page: 1, // Reset to first page when searching
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center w-full max-w-2xl">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou email de la personne qui a ajouté la photo..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 w-full"
        />
      </div>
    </div>
  );
}
