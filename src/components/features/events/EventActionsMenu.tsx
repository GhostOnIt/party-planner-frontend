import { useRef, useEffect } from 'react';
import { Eye, Edit, Copy, Trash2 } from 'lucide-react';
import type { DisplayEvent } from '@/utils/eventUtils';

interface EventActionsMenuProps {
  event: DisplayEvent;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onView?: (event: DisplayEvent) => void;
  onEdit?: (event: DisplayEvent) => void;
  onDuplicate?: (event: DisplayEvent) => void;
  onDelete?: (event: DisplayEvent) => void;
}

export function EventActionsMenu({
  event,
  isOpen,
  onOpenChange,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: EventActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 bottom-full mb-2 w-44 bg-white rounded-xl border border-[#e5e7eb] shadow-xl z-30 py-1"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {onView && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onView(event);
            onOpenChange(false);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1a1a2e]"
        >
          <Eye className="w-4 h-4" />
          Voir détails
        </button>
      )}
      {onEdit && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(event);
            onOpenChange(false);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1a1a2e]"
        >
          <Edit className="w-4 h-4" />
          Modifier
        </button>
      )}
      {onDuplicate && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDuplicate(event);
            onOpenChange(false);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#1a1a2e]"
        >
          <Copy className="w-4 h-4" />
          Dupliquer
        </button>
      )}
      <div className="border-t border-[#f3f4f6] my-1" />
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(event);
            onOpenChange(false);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#EF4444] hover:bg-[#FEF2F2]"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      )}
    </div>
  );
}

