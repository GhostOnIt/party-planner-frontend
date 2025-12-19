import { Skeleton } from '@/components/ui/skeleton';
import { CollaborationCard } from './CollaborationCard';
import type { Collaboration } from '@/types';

interface CollaborationListProps {
  collaborations: Collaboration[];
  isLoading?: boolean;
  onLeave: (eventId: number) => void;
  leavingEventId?: number | null;
}

export function CollaborationList({
  collaborations,
  isLoading = false,
  onLeave,
  leavingEventId,
}: CollaborationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {collaborations.map((collaboration) => (
        <CollaborationCard
          key={collaboration.id}
          collaboration={collaboration}
          onLeave={onLeave}
          isLeaving={leavingEventId === collaboration.event_id}
        />
      ))}
    </div>
  );
}
