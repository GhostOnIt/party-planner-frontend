import { useGuests } from '@/hooks/useGuests';
import { analyzeDietaryRestrictions, getRestrictionBadgeColor, type DietaryRestriction } from '@/utils/dietaryRestrictions';
import { Skeleton } from '@/components/ui/skeleton';

interface DietaryRestrictionsCardProps {
  eventId: string | number;
  totalGuests: number;
}

export function DietaryRestrictionsCard({ eventId, totalGuests }: DietaryRestrictionsCardProps) {
  const { data: guestsData, isLoading } = useGuests(eventId, { per_page: 1000 });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f3f4f6] bg-[#f9fafb]">
          <h3 className="font-semibold text-[#1a1a2e]">Restrictions alimentaires</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const guests = guestsData?.data || [];
  const restrictions = analyzeDietaryRestrictions(guests);

  // Si aucune restriction, afficher un message
  if (restrictions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f3f4f6] bg-[#f9fafb]">
          <h3 className="font-semibold text-[#1a1a2e]">Restrictions alimentaires</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-[#6b7280] text-center py-4">
            Aucune restriction alimentaire enregistrée
          </p>
        </div>
      </div>
    );
  }

  // Calculer le maximum pour les couleurs
  const maxCount = Math.max(...restrictions.map(r => r.count));

  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#f3f4f6] bg-[#f9fafb]">
        <h3 className="font-semibold text-[#1a1a2e]">Restrictions alimentaires</h3>
        <p className="text-xs text-[#6b7280] mt-1">
          {restrictions.reduce((sum, r) => sum + r.count, 0)} restriction{restrictions.reduce((sum, r) => sum + r.count, 0) > 1 ? 's' : ''} sur {totalGuests} invité{totalGuests > 1 ? 's' : ''}
        </p>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap gap-2">
          {restrictions.map((restriction) => (
            <DietaryRestrictionBadge 
              key={restriction.id} 
              restriction={restriction} 
              maxCount={maxCount}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface DietaryRestrictionBadgeProps {
  restriction: DietaryRestriction;
  maxCount: number;
}

function DietaryRestrictionBadge({ restriction, maxCount }: DietaryRestrictionBadgeProps) {
  const colorClass = getRestrictionBadgeColor(restriction.count, maxCount);

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border
        font-medium text-sm transition-all hover:shadow-sm
        ${colorClass}
      `}
    >
      <span>{restriction.name}</span>
      <span className="bg-white/50 px-1.5 py-0.5 rounded-full text-xs font-bold">
        {restriction.count}
      </span>
    </div>
  );
}

