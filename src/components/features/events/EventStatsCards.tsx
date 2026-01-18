import { Calendar, Clock, Users } from 'lucide-react';
import { calculateEventStats } from '@/utils/eventUtils';
import type { Event } from '@/types';

interface EventStatsCardsProps {
  events: Event[];
}

export function EventStatsCards({ events }: EventStatsCardsProps) {
  const stats = calculateEventStats(events);

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white rounded-xl p-4 border border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#4F46E5]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1a1a2e]">{stats.total}</p>
            <p className="text-sm text-[#6b7280]">Total événements</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#10B981]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1a1a2e]">
              {stats.upcoming}
            </p>
            <p className="text-sm text-[#6b7280]">À venir</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1a1a2e]">
              {stats.totalGuests}
            </p>
            <p className="text-sm text-[#6b7280]">Total invités</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 border border-[#e5e7eb]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E91E8C]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#E91E8C]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1a1a2e]">{stats.ongoing}</p>
            <p className="text-sm text-[#6b7280]">En cours</p>
          </div>
        </div>
      </div>
    </div>
  );
}

