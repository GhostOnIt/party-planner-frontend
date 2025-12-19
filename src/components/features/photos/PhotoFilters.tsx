import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PhotoFilters as PhotoFiltersType, PhotoType } from '@/types';

interface PhotoFiltersProps {
  filters: PhotoFiltersType;
  onFiltersChange: (filters: PhotoFiltersType) => void;
}

const photoTypes: { value: PhotoType | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous les types' },
  { value: 'event_photo', label: 'Photos evenement' },
  { value: 'moodboard', label: 'Moodboard' },
];

export function PhotoFilters({ filters, onFiltersChange }: PhotoFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
      page: 1, // Reset to first page when searching
    });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : (value as PhotoType),
      page: 1,
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.type || 'all'}
        onValueChange={handleTypeChange}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Type de photo" />
        </SelectTrigger>
        <SelectContent>
          {photoTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
