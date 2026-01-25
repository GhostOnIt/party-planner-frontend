import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewToggle({
  viewMode,
  onViewModeChange,
  className,
}: ViewToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center border border-[#e5e7eb] rounded-xl overflow-hidden',
        className
      )}
    >
      <button
        onClick={() => onViewModeChange('grid')}
        className={cn(
          'p-2.5 transition-colors',
          viewMode === 'grid'
            ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white'
            : 'bg-white text-[#6b7280] hover:bg-[#f3f4f6]'
        )}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={cn(
          'p-2.5 transition-colors',
          viewMode === 'list'
            ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white'
            : 'bg-white text-[#6b7280] hover:bg-[#f3f4f6]'
        )}
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}

