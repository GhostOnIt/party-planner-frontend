import { Skeleton } from '@/components/ui/skeleton';
import { InvitationCard } from './InvitationCard';
import type { Invitation } from '@/types';

interface InvitationListProps {
  invitations: Invitation[];
  isLoading?: boolean;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onViewDetails?: (invitation: Invitation) => void;
  acceptingId?: number | null;
  rejectingId?: number | null;
}

export function InvitationList({
  invitations,
  isLoading = false,
  onAccept,
  onReject,
  onViewDetails,
  acceptingId,
  rejectingId,
}: InvitationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <InvitationCard
          key={invitation.id}
          invitation={invitation}
          onAccept={onAccept}
          onReject={onReject}
          onViewDetails={onViewDetails}
          isAccepting={acceptingId === invitation.id}
          isRejecting={rejectingId === invitation.id}
        />
      ))}
    </div>
  );
}
