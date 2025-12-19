import { Crown, MoreHorizontal, Pencil, Send, Trash2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Collaborator, CollaboratorRole } from '@/types';

interface CollaboratorCardProps {
  collaborator: Collaborator;
  isOwner?: boolean;
  canManage?: boolean;
  onChangeRole?: (collaborator: Collaborator) => void;
  onRemove?: (collaborator: Collaborator) => void;
  onResendInvitation?: (collaborator: Collaborator) => void;
}

const roleConfig: Record<CollaboratorRole, { label: string; color: string; icon: React.ReactNode }> = {
  owner: {
    label: 'Proprietaire',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    icon: <Crown className="h-3 w-3" />,
  },
  editor: {
    label: 'Editeur',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: <Pencil className="h-3 w-3" />,
  },
  viewer: {
    label: 'Lecteur',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    icon: <User className="h-3 w-3" />,
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function CollaboratorCard({
  collaborator,
  isOwner = false,
  canManage = false,
  onChangeRole,
  onRemove,
  onResendInvitation,
}: CollaboratorCardProps) {
  const { user, role, accepted_at } = collaborator;
  const config = roleConfig[role];
  const isPending = !accepted_at;

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{user.name}</p>
            {isPending && (
              <Badge variant="outline" className="text-xs">
                En attente
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge className={cn('gap-1', config.color)}>
          {config.icon}
          {config.label}
        </Badge>

        {canManage && !isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onChangeRole && role !== 'owner' && (
                <DropdownMenuItem onClick={() => onChangeRole(collaborator)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier le role
                </DropdownMenuItem>
              )}
              {isPending && onResendInvitation && (
                <DropdownMenuItem onClick={() => onResendInvitation(collaborator)}>
                  <Send className="mr-2 h-4 w-4" />
                  Renvoyer l'invitation
                </DropdownMenuItem>
              )}
              {onRemove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onRemove(collaborator)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Retirer
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
