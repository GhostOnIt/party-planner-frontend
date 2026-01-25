import { Link } from 'react-router-dom';
import { MapPin, Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventImage } from './EventImage';
import { ProgressBar } from './ProgressBar';
import { formatBudget } from '@/utils/eventUtils';
import type { DisplayEvent } from '@/utils/eventUtils';

const typeLabels: Record<string, string> = {
  mariage: 'Mariage',
  anniversaire: 'Anniversaire',
  baby_shower: 'Baby Shower',
  soiree: 'Soiree',
  brunch: 'Brunch',
  autre: 'Autre',
};

const typeColors: Record<string, string> = {
  mariage: '#E91E8C',
  anniversaire: '#4F46E5',
  baby_shower: '#F59E0B',
  soiree: '#10B981',
  brunch: '#8B5CF6',
  autre: '#6b7280',
};

const statusLabels: Record<string, string> = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const statusColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  upcoming: {
    bg: 'bg-[#4F46E5]/10',
    text: 'text-[#4F46E5]',
    border: 'border-[#4F46E5]/20',
  },
  ongoing: {
    bg: 'bg-[#F59E0B]/10',
    text: 'text-[#F59E0B]',
    border: 'border-[#F59E0B]/20',
  },
  completed: {
    bg: 'bg-[#10B981]/10',
    text: 'text-[#10B981]',
    border: 'border-[#10B981]/20',
  },
  cancelled: {
    bg: 'bg-[#EF4444]/10',
    text: 'text-[#EF4444]',
    border: 'border-[#EF4444]/20',
  },
};

interface EventListItemProps {
  event: DisplayEvent;
  onView?: (event: DisplayEvent) => void;
  onEdit?: (event: DisplayEvent) => void;
  onDelete?: (event: DisplayEvent) => void;
}

export function EventListItem({
  event,
  onView,
  onEdit,
  onDelete,
}: EventListItemProps) {
  return (
    <tr className="hover:bg-[#f9fafb] transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#f3f4f6] overflow-hidden flex-shrink-0">
            {event.image ? (
              <img
                src={event.image}
                alt={event.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <EventImage
                src={undefined}
                alt={event.name}
                className="w-full h-full"
                fallbackClassName="w-full h-full"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={`/events/${event.id}`}
                className="font-medium text-[#1a1a2e] hover:text-[#4F46E5] transition-colors"
              >
                {event.name}
              </Link>
            </div>
            <p className="text-xs text-[#6b7280] flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.location}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: typeColors[event.type] || '#6b7280' }}
        >
          {typeLabels[event.type] || event.type}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm text-[#1a1a2e]">{event.date}</p>
        {event.time && <p className="text-xs text-[#6b7280]">{event.time}</p>}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-24">
            <ProgressBar
              current={event.guests.confirmed}
              total={event.guests.total}
              showLabel={false}
              color="green"
            />
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-[#6b7280]">
                {event.guests.confirmed}/{event.guests.total}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium',
            statusColors[event.status]?.bg || 'bg-[#6b7280]/10',
            statusColors[event.status]?.text || 'text-[#6b7280]'
          )}
        >
          {statusLabels[event.status] || event.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-[#1a1a2e]">
          {formatBudget(event.budget.spent)}
        </p>
        <p className="text-xs text-[#6b7280]">
          sur {formatBudget(event.budget.total)}
        </p>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {onView && (
            <button
              onClick={() => onView(event)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#4F46E5] transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(event)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#4F46E5] transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(event)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#EF4444] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

