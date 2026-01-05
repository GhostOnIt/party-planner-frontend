import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Shield, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Invitation, CollaboratorRole } from '@/types';
import { resolveUrl } from '@/lib/utils';

interface InvitationCardProps {
  invitation: Invitation;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

const roleLabels: Record<CollaboratorRole, string> = {
  owner: 'Proprietaire',
  editor: 'Editeur',
  viewer: 'Lecteur',
};

const roleColors: Record<CollaboratorRole, string> = {
  owner: 'bg-purple-100 text-purple-800',
  editor: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-800',
};

export function InvitationCard({
  invitation,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}: InvitationCardProps) {
  const timeAgo = formatDistanceToNow(parseISO(invitation.created_at), {
    addSuffix: true,
    locale: fr,
  });

  const eventDate = invitation.event?.date
    ? format(parseISO(invitation.event.date), 'dd MMMM yyyy', { locale: fr })
    : null;

  const inviterInitials =
    invitation.inviter?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={resolveUrl(invitation.inviter?.avatar_url)} />
            <AvatarFallback>{inviterInitials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{invitation.inviter?.name || 'Utilisateur inconnu'}</p>
                <p className="text-sm text-muted-foreground">
                  vous invite a collaborer sur un evenement
                </p>
              </div>
              <Badge variant="secondary" className={roleColors[invitation.role]}>
                <Shield className="mr-1 h-3 w-3" />
                {roleLabels[invitation.role]}
              </Badge>
            </div>

            {invitation.event && (
              <div className="mt-3 rounded-lg bg-muted/50 p-3">
                <h4 className="font-medium">{invitation.event.title}</h4>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  {eventDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {eventDate}
                    </span>
                  )}
                  {invitation.event.location && <span>{invitation.event.location}</span>}
                </div>
              </div>
            )}

            {invitation.message && (
              <p className="mt-2 text-sm text-muted-foreground italic">"{invitation.message}"</p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(invitation.id)}
                  disabled={isRejecting || isAccepting}
                >
                  <X className="mr-1 h-4 w-4" />
                  {isRejecting ? 'Refus...' : 'Refuser'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAccept(invitation.id)}
                  disabled={isAccepting || isRejecting}
                >
                  <Check className="mr-1 h-4 w-4" />
                  {isAccepting ? 'Acceptation...' : 'Accepter'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
