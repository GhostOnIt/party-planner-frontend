import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EventType } from '@/types';

const typeLabels: Record<EventType | 'all', string> = {
  all: 'Tous les types',
  mariage: 'Mariage',
  anniversaire: 'Anniversaire',
  baby_shower: 'Baby Shower',
  soiree: 'Soiree',
  brunch: 'Brunch',
  autre: 'Autre',
};

const typeColors: Record<EventType | 'all', string> = {
  all: '#6b7280',
  mariage: '#E91E8C',
  anniversaire: '#4F46E5',
  baby_shower: '#F59E0B',
  soiree: '#10B981',
  brunch: '#8B5CF6',
  autre: '#6b7280',
};

interface EventTypeDropdownProps {
  value: EventType | 'all' | undefined;
  onChange: (value: EventType | 'all') => void;
  className?: string;
}

export function EventTypeDropdown({
  value = 'all',
  onChange,
  className,
}: EventTypeDropdownProps) {
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
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: typeColors[selectedValue] }}
        />
        <span className="text-sm text-[#1a1a2e]">
          {typeLabels[selectedValue]}
        </span>
        <ChevronDown className="w-4 h-4 text-[#9ca3af] ml-auto" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl border border-[#e5e7eb] shadow-lg z-20 py-2 max-h-64 overflow-y-auto">
          {Object.entries(typeLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                onChange(key as EventType | 'all');
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-[#f3f4f6] transition-colors',
                selectedValue === key && 'bg-[#4F46E5]/5 text-[#4F46E5]'
              )}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: typeColors[key as EventType | 'all'] }}
              />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

