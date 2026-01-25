import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EventStatus } from '@/types';

const statusLabels: Record<EventStatus | 'all', string> = {
  all: 'Tous les statuts',
  upcoming: 'À venir',
  ongoing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

interface EventStatusDropdownProps {
  value: EventStatus | 'all' | undefined;
  onChange: (value: EventStatus | 'all') => void;
  className?: string;
}

export function EventStatusDropdown({
  value = 'all',
  onChange,
  className,
}: EventStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedValue = value || 'all';

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-[#f9fafb] transition-colors min-w-[160px]"
      >
        <span className="text-sm text-[#1a1a2e]">
          {statusLabels[selectedValue]}
        </span>
        <ChevronDown className="w-4 h-4 text-[#9ca3af] ml-auto" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl border border-[#e5e7eb] shadow-lg z-20 py-2">
          {Object.entries(statusLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                onChange(key as EventStatus | 'all');
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-[#f3f4f6] transition-colors',
                selectedValue === key && 'bg-[#4F46E5]/5 text-[#4F46E5]'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

