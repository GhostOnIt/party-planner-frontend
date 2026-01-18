import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  ImageIcon,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EventStatusBadge } from './EventStatusBadge';
import { EventTypeBadge } from './EventTypeBadge';
import { PlanBadge } from './PlanBadge';
import { Badge } from '@/components/ui/badge';
import { UserCheck } from 'lucide-react';
import type { Event, Subscription } from '@/types';
import { resolveUrl } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  subscription?: Subscription | null;
  currentUserId?: number;
  onEdit?: (event: Event) => void;
  onDuplicate?: (event: Event) => void;
  onDelete?: (event: Event) => void;
}
export function EventCard({
  event,
  subscription,
  currentUserId,
  onEdit,
  onDuplicate,
  onDelete,
}: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  const formattedDate = format(parseISO(event.date), 'dd MMMM yyyy', { locale: fr });

  const plan = subscription?.plan_type || subscription?.plan;
  const imageUrl = resolveUrl(event.featured_photo?.thumbnail_url || event.featured_photo?.url);

  return (
    <Link to={`/events/${event.id}`} className="block h-full">
      <Card className="group relative flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md cursor-pointer">
        {/* Image */}
        <div className="relative aspect-[16/9] bg-muted">
          {imageUrl && !imageError ? (
            <img
              src={resolveUrl(imageUrl)}
              alt={event.title}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}

          {/* Badges image */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5">
            <EventTypeBadge type={event.type} />
            <EventStatusBadge status={event.status} />
            {plan && <PlanBadge plan={plan} />}
          </div>

          {currentUserId && event.user_id !== currentUserId && (
            <div className="absolute right-2 top-2">
              <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                <UserCheck className="h-3 w-3" />
                Collaborateur
              </Badge>
            </div>
          )}
        </div>

        {/* Contenu extensible */}
        <CardContent className="flex flex-1 flex-col p-4">
          <h3 className="truncate text-lg font-semibold">{event.title}</h3>

          {event.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formattedDate}
              {event.time && ` à ${event.time}`}
            </span>

            {event.location && (
              <span className="flex items-center gap-1.5 max-w-full overflow-hidden">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{event.location}</span>
              </span>
            )}

            {event.expected_guests && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {event.expected_guests} invités
              </span>
            )}
          </div>
        </CardContent>

        {/* Footer toujours aligné */}
        <CardFooter className="h-12 shrink-0 border-t bg-muted/5 p-0 flex items-center">
          <div className="flex-1 min-w-0 px-4">
            <p className="truncate whitespace-nowrap text-[11px] sm:text-xs text-muted-foreground">
              {event.user ? (
                <>
                  Crée par <span className="font-semibold text-foreground">{event.user.name}</span>
                </>
              ) : (
                'Créé le'
              )}
              <span className="opacity-70">
                {' • '}
                {format(parseISO(event.created_at), 'dd/MM/yyyy', { locale: fr })}
              </span>
            </p>
          </div>

          <div className="flex h-full items-center border-l px-2" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(event)}>
                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(event)}>
                  <Copy className="mr-2 h-4 w-4" /> Dupliquer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(event)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
