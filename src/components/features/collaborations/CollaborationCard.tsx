import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, Users, Shield, LogOut, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Collaboration, CollaboratorRole, EventStatus } from '@/types';

interface CollaborationCardProps {
  collaboration: Collaboration;
  onLeave: (eventId: number) => void;
  isLeaving?: boolean;
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

const statusLabels: Record<EventStatus, string> = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const statusColors: Record<EventStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-green-100 text-green-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function CollaborationCard({
  collaboration,
  onLeave,
  isLeaving = false,
}: CollaborationCardProps) {
  const navigate = useNavigate();
  const { event, role } = collaboration;

  const eventDate = event?.date
    ? format(parseISO(event.date), 'dd MMMM yyyy', { locale: fr })
    : null;

  const joinedAgo = formatDistanceToNow(parseISO(collaboration.accepted_at), {
    addSuffix: true,
    locale: fr,
  });

  const handleViewEvent = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <h3 className="font-semibold text-lg truncate">{event?.title || 'Evenement'}</h3>
              <Badge variant="secondary" className={roleColors[role]}>
                <Shield className="mr-1 h-3 w-3" />
                {roleLabels[role]}
              </Badge>
              {event?.status && (
                <Badge variant="outline" className={statusColors[event.status]}>
                  {statusLabels[event.status]}
                </Badge>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {eventDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {eventDate}
                </span>
              )}
              {event?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
              )}
              {event?.expected_guests && (
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {event.expected_guests} invites prevus
                </span>
              )}
            </div>

            {event?.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            )}

            <p className="mt-2 text-xs text-muted-foreground">
              Collaborateur depuis {joinedAgo}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={handleViewEvent}>
              <ExternalLink className="mr-1 h-4 w-4" />
              Voir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLeave(event.id)}
              disabled={isLeaving}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="mr-1 h-4 w-4" />
              {isLeaving ? 'Sortie...' : 'Quitter'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
