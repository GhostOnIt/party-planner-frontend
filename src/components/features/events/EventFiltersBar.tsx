import { Search } from 'lucide-react';
import { SearchInput } from '@/components/forms/search-input';
import { EventTypeDropdown } from './EventTypeDropdown';
import { EventStatusDropdown } from './EventStatusDropdown';
import type { EventFilters as EventFiltersType, EventType, EventStatus } from '@/types';

interface EventFiltersBarProps {
  filters: EventFiltersType;
  onFiltersChange: (filters: EventFiltersType) => void;
}

export function EventFiltersBar({
  filters,
  onFiltersChange,
}: EventFiltersBarProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined, page: 1 });
  };

  const handleTypeChange = (value: EventType | 'all') => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : (value as EventType),
      page: 1,
    });
  };

  const handleStatusChange = (value: EventStatus | 'all') => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as EventStatus),
      page: 1,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-[#4F46E5]/10 transition-all">
            <Search className="w-4 h-4 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Rechercher un événement..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#9ca3af]"
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Type Filter */}
        <EventTypeDropdown
          value={filters.type || 'all'}
          onChange={handleTypeChange}
        />

        {/* Status Filter */}
        <EventStatusDropdown
          value={filters.status || 'all'}
          onChange={handleStatusChange}
        />
      </div>
    </div>
  );
}

