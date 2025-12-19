import { Skeleton } from '@/components/ui/skeleton';
import { CollaboratorCard } from './CollaboratorCard';
import type { Collaborator } from '@/types';

interface CollaboratorListProps {
  collaborators: Collaborator[];
  isLoading?: boolean;
  currentUserId?: number;
  canManage?: boolean;
  onChangeRole?: (collaborator: Collaborator) => void;
  onRemove?: (collaborator: Collaborator) => void;
  onResendInvitation?: (collaborator: Collaborator) => void;
}

export function CollaboratorList({
  collaborators,
  isLoading = false,
  currentUserId,
  canManage = false,
  onChangeRole,
  onRemove,
  onResendInvitation,
}: CollaboratorListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  // Sort: owner first, then by name
  const sortedCollaborators = [...collaborators].sort((a, b) => {
    if (a.role === 'owner') return -1;
    if (b.role === 'owner') return 1;
    return a.user.name.localeCompare(b.user.name);
  });

  return (
    <div className="space-y-4">
      {sortedCollaborators.map((collaborator) => (
        <CollaboratorCard
          key={collaborator.id}
          collaborator={collaborator}
          isOwner={collaborator.role === 'owner'}
          canManage={canManage && collaborator.user_id !== currentUserId}
          onChangeRole={onChangeRole}
          onRemove={onRemove}
          onResendInvitation={onResendInvitation}
        />
      ))}
    </div>
  );
}
