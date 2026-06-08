import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PhotoFilters as PhotoFiltersType } from '@/types';

interface PhotoFiltersProps {
  filters: PhotoFiltersType;
  onFiltersChange: (filters: PhotoFiltersType) => void;
  canModerate?: boolean;
}

export function PhotoFilters({ filters, onFiltersChange, canModerate = false }: PhotoFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
      page: 1, // Reset to first page when searching
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center w-full max-w-3xl">
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou email de la personne qui a ajouté la photo..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 w-full"
        />
      </div>
      {canModerate && (
        <Select
          value={filters.moderation_status || 'all'}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              moderation_status: value === 'all' ? undefined : (value as PhotoFiltersType['moderation_status']),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Moderation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Validees</SelectItem>
            <SelectItem value="rejected">Rejetees</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
