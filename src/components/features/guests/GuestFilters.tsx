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
import type { RsvpStatus, GuestFilters as GuestFiltersType } from '@/types';

const rsvpStatuses: { value: RsvpStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'accepted', label: 'Confirme' },
  { value: 'declined', label: 'Decline' },
  { value: 'maybe', label: 'Peut-etre' },
];

interface GuestFiltersProps {
  filters: GuestFiltersType;
  onFiltersChange: (filters: GuestFiltersType) => void;
}

export function GuestFilters({ filters, onFiltersChange }: GuestFiltersProps) {
  const hasFilters = filters.rsvp_status || filters.search;

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      rsvp_status: value === 'all' ? undefined : (value as RsvpStatus),
      page: 1,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({ per_page: filters.per_page });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <SearchInput
          value={filters.search || ''}
          onChange={handleSearchChange}
          placeholder="Rechercher un invite..."
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.rsvp_status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Statut RSVP" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {rsvpStatuses.map((status) => (
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
            className="h-10 px-3"
          >
            <X className="mr-1 h-4 w-4" />
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}

export { rsvpStatuses };
