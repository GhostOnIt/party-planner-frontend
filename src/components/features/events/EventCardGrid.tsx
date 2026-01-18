import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventImage } from './EventImage';
import { EventMetadata } from './EventMetadata';
import { ProgressBar } from './ProgressBar';
import { EventActionsMenu } from './EventActionsMenu';
import { PlanBadge } from './PlanBadge';
import type { DisplayEvent } from '@/utils/eventUtils';
import type { Subscription } from '@/types';

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
    bg: 'bg-[#4F46E5]',
    text: 'text-white',
    border: 'border-[#4F46E5]',
  },
  ongoing: {
    bg: 'bg-[#F59E0B]',
    text: 'text-white',
    border: 'border-[#F59E0B]',
  },
  completed: {
    bg: 'bg-[#10B981]',
    text: 'text-white',
    border: 'border-[#10B981]',
  },
  cancelled: {
    bg: 'bg-[#EF4444]',
    text: 'text-white',
    border: 'border-[#EF4444]',
  },
};

interface EventCardGridProps {
  event: DisplayEvent;
  subscription?: Subscription | null;
  currentUserId?: number;
  onView?: (event: DisplayEvent) => void;
  onEdit?: (event: DisplayEvent) => void;
  onDuplicate?: (event: DisplayEvent) => void;
  onDelete?: (event: DisplayEvent) => void;
}

export function EventCardGrid({
  event,
  subscription,
  currentUserId,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: EventCardGridProps) {
  const [activeMenu, setActiveMenu] = useState(false);
  const plan = subscription?.plan_type || subscription?.plan;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Link
      to={`/events/${event.id}`}
      className="block bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden hover:shadow-xl hover:shadow-[#4F46E5]/5 transition-all duration-300 group cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb]">
        <div className="relative w-full h-full">
          {event.image ? (
            <img
              src={event.image}
              alt={event.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
            />
          )}
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {event.isCollaborator && (
              <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-[#1a1a2e] flex items-center gap-1">
                <UserPlus className="w-3 h-3" />
                Collaborateur
              </span>
            )}
            {plan && (
              <PlanBadge plan={plan} className="bg-white/90 backdrop-blur-sm" />
            )}
          </div>
        </div>

        {/* Bottom badges */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: typeColors[event.type] || '#6b7280' }}
          >
            {typeLabels[event.type] || event.type}
          </span>
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium border',
              statusColors[event.status]?.bg || 'bg-[#6b7280]/10',
              statusColors[event.status]?.text || 'text-[#6b7280]',
              statusColors[event.status]?.border || 'border-[#6b7280]/20'
            )}
          >
            {statusLabels[event.status] || event.status}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-semibold text-[#1a1a2e] text-lg mb-2 truncate group-hover:text-[#4F46E5] transition-colors">
          {event.name}
        </h3>

        <EventMetadata
          date={event.date}
          time={event.time}
          location={event.location}
          className="mb-4"
        />

        {/* Progress indicators */}
        <div className="space-y-3 mb-4">
          <ProgressBar
            current={event.guests.confirmed}
            total={event.guests.total}
            label="Invités confirmés"
            color="green"
          />
          <ProgressBar
            current={event.tasks.completed}
            total={event.tasks.total}
            label="Tâches complétées"
            color="purple"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#f3f4f6]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-[10px] font-medium text-white">
              {getInitials(event.creator.name)}
            </div>
            <span className="text-xs text-[#6b7280]">
              <span className="font-medium text-[#1a1a2e]">
                {event.creator.name}
              </span>
              {' • '}
              {event.createdAt}
            </span>
          </div>
          <div 
            className="relative z-40" 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveMenu(!activeMenu);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#f3f4f6] transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <EventActionsMenu
              event={event}
              isOpen={activeMenu}
              onOpenChange={setActiveMenu}
              onView={onView}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

