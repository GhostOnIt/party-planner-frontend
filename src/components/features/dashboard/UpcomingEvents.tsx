import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import type { Event } from '@/types';
import { cn } from '@/lib/utils';

const eventTypeColors: Record<string, string> = {
  mariage: 'bg-event-mariage',
  anniversaire: 'bg-event-anniversaire',
  baby_shower: 'bg-event-baby-shower',
  soiree: 'bg-event-soiree',
  brunch: 'bg-event-brunch',
  autre: 'bg-event-autre',
};

const eventTypeLabels: Record<string, string> = {
  mariage: 'Mariage',
  anniversaire: 'Anniversaire',
  baby_shower: 'Baby Shower',
  soiree: 'Soiree',
  brunch: 'Brunch',
  autre: 'Autre',
};

interface UpcomingEventsProps {
  events: Event[];
  isLoading?: boolean;
}

export function UpcomingEvents({ events, isLoading = false }: UpcomingEventsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evenements a venir</CardTitle>
          <CardDescription>Vos prochains evenements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Evenements a venir</CardTitle>
          <CardDescription>Vos prochains evenements</CardDescription>
        </div>
        <Link to="/events">
          <Button variant="ghost" size="sm" className="gap-1">
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Aucun evenement"
            description="Vous n'avez pas d'evenement a venir"
            action={{
              label: 'Creer un evenement',
              onClick: () => {},
            }}
          />
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-lg text-white',
                    eventTypeColors[event.type] || 'bg-primary'
                  )}
                >
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{event.title}</h4>
                    <Badge variant="secondary" className="shrink-0">
                      {eventTypeLabels[event.type] || event.type}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(parseISO(event.date), 'dd MMM yyyy', { locale: fr })}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </span>
                    )}
                    {event.expected_guests && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {event.expected_guests} invites
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
