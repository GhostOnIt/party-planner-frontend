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
import type { TaskStatus, TaskPriority, TaskFilters as TaskFiltersType } from '@/types';

const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'A faire' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Termine' },
  { value: 'cancelled', label: 'Annule' },
];

const priorities: { value: TaskPriority; label: string }[] = [
  { value: 'high', label: 'Haute' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'low', label: 'Basse' },
];

interface TaskFiltersProps {
  filters: TaskFiltersType;
  onFiltersChange: (filters: TaskFiltersType) => void;
  collaborators?: { id: number; name: string }[];
}

export function TaskFilters({ filters, onFiltersChange, collaborators = [] }: TaskFiltersProps) {
  const hasFilters = filters.status || filters.priority || filters.assigned_to || filters.search;

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as TaskStatus),
    });
  };

  const handlePriorityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      priority: value === 'all' ? undefined : (value as TaskPriority),
    });
  };

  const handleAssigneeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      assigned_to: value === 'all' ? undefined : Number(value),
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <SearchInput
          value={filters.search || ''}
          onChange={handleSearchChange}
          placeholder="Rechercher une tache..."
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      <Select value={filters.priority || 'all'} onValueChange={handlePriorityChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Priorite" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes priorites</SelectItem>
          {priorities.map((priority) => (
            <SelectItem key={priority.value} value={priority.value}>
              {priority.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {collaborators.length > 0 && (
        <Select
          value={filters.assigned_to?.toString() || 'all'}
          onValueChange={handleAssigneeChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Assigne a" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {collaborators.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

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

export { statuses, priorities };
