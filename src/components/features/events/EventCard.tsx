import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, MoreHorizontal, Pencil, Copy, Trash2, ImageIcon } from 'lucide-react';
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
import { getStorageUrl } from '@/api/client';
import type { Event, Subscription } from '@/types';

interface EventCardProps {
  event: Event;
  subscription?: Subscription | null;
  onEdit?: (event: Event) => void;
  onDuplicate?: (event: Event) => void;
  onDelete?: (event: Event) => void;
}

export function EventCard({ event, subscription, onEdit, onDuplicate, onDelete }: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  const formattedDate = format(parseISO(event.date), 'dd MMMM yyyy', { locale: fr });

  // Get plan from subscription
  const plan = subscription?.plan_type || subscription?.plan;

  const imageUrl = event.featured_photo
    ? getStorageUrl(event.featured_photo.thumbnail_url || event.featured_photo.url)
    : null;

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <Link to={`/events/${event.id}`} className="block">
        {/* Image de couverture */}
        <div className="relative aspect-[16/9] bg-muted">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
          {/* Badges superposés sur l'image */}
          <div className="absolute bottom-2 left-2 flex flex-wrap items-center gap-1.5">
            <EventTypeBadge type={event.type} />
            <EventStatusBadge status={event.status} />
            {plan && <PlanBadge plan={plan} />}
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg truncate">{event.title}</h3>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formattedDate}
              {event.time && ` a ${event.time}`}
            </span>
            {event.location && (
              <span className="flex items-center gap-1.5 max-w-full overflow-hidden">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </span>
            )}
            {event.expected_guests && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {event.expected_guests} invites
              </span>
            )}
          </div>
        </CardContent>
      </Link>

      <CardFooter className="border-t px-6 py-3 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Cree le {format(parseISO(event.created_at), 'dd/MM/yyyy', { locale: fr })}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(event)}>
              <Pencil className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(event)}>
              <Copy className="mr-2 h-4 w-4" />
              Dupliquer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(event)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
