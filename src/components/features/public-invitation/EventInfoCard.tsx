import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EventInfoCardProps {
  event: {
    title: string;
    type?: string;
    date: string;
    time?: string | null;
    location?: string | null;
    description?: string | null;
    theme?: string | null;
  };
}

const eventTypeLabels: Record<string, string> = {
  mariage: 'Mariage',
  anniversaire: 'Anniversaire',
  baby_shower: 'Baby Shower',
  soiree: 'Soiree',
  brunch: 'Brunch',
  autre: 'Evenement',
};

const eventTypeIcons: Record<string, string> = {
  mariage: '💒',
  anniversaire: '🎂',
  baby_shower: '👶',
  soiree: '🎉',
  brunch: '🥐',
  autre: '✨',
};

export function EventInfoCard({ event }: EventInfoCardProps) {
  const formattedDate = format(parseISO(event.date), 'EEEE dd MMMM yyyy', { locale: fr });
  const eventType = event.type || 'autre';
  const typeLabel = eventTypeLabels[eventType] || 'Evenement';
  const typeIcon = eventTypeIcons[eventType] || '✨';

  return (
    <Card className="overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
            {typeIcon}
          </div>
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">
              {typeLabel}
            </Badge>
            <h1 className="text-2xl font-bold">{event.title}</h1>
          </div>
        </div>
      </div>

      <CardContent className="space-y-4 p-6">
        {/* Date & Time */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium capitalize">{formattedDate}</p>
            {event.time && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {event.time}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Lieu</p>
              <p className="text-sm text-muted-foreground">{event.location}</p>
            </div>
          </div>
        )}

        {/* Theme */}
        {event.theme && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">{event.theme}</p>
            </div>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
