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
import type { EventStatus, EventType, EventFilters as EventFiltersType } from '@/types';

const eventTypes: { value: EventType; label: string }[] = [
  { value: 'mariage', label: 'Mariage' },
  { value: 'anniversaire', label: 'Anniversaire' },
  { value: 'baby_shower', label: 'Baby Shower' },
  { value: 'soiree', label: 'Soiree' },
  { value: 'brunch', label: 'Brunch' },
  { value: 'autre', label: 'Autre' },
];

const eventStatuses: { value: EventStatus; label: string }[] = [
  { value: 'upcoming', label: 'À venir' },
  { value: 'ongoing', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' },
];

interface EventFiltersProps {
  filters: EventFiltersType;
  onFiltersChange: (filters: EventFiltersType) => void;
}

export function EventFilters({ filters, onFiltersChange }: EventFiltersProps) {
  const hasFilters = filters.status || filters.type || filters.search;

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as EventStatus),
      page: 1,
    });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : (value as EventType),
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
          placeholder="Rechercher un evenement..."
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {eventTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {eventStatuses.map((status) => (
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

export { eventTypes, eventStatuses };
