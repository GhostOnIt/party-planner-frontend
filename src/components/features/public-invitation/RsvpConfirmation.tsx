import { CheckCircle2, XCircle, HelpCircle, Calendar, MapPin } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RsvpStatus } from '@/types';

interface RsvpConfirmationProps {
  status: RsvpStatus;
  guestName: string;
  eventDate: string;
  eventLocation: string | null;
  plusOneName: string | null;
}

const statusConfig = {
  accepted: {
    icon: CheckCircle2,
    title: 'Participation confirmee !',
    message: 'Merci ! Votre presence a bien ete enregistree.',
    className: 'border-green-200 bg-green-50',
    iconClass: 'text-green-600',
  },
  declined: {
    icon: XCircle,
    title: 'Absence enregistree',
    message: 'Nous sommes desoles que vous ne puissiez pas venir.',
    className: 'border-red-200 bg-red-50',
    iconClass: 'text-red-600',
  },
  maybe: {
    icon: HelpCircle,
    title: 'Reponse enregistree',
    message: 'Nous esperons vous voir ! N\'hesitez pas a confirmer des que possible.',
    className: 'border-yellow-200 bg-yellow-50',
    iconClass: 'text-yellow-600',
  },
  pending: {
    icon: HelpCircle,
    title: 'En attente',
    message: 'Votre reponse est en attente.',
    className: 'border-gray-200 bg-gray-50',
    iconClass: 'text-gray-600',
  },
};

export function RsvpConfirmation({
  status,
  guestName,
  eventDate,
  eventLocation,
  plusOneName,
}: RsvpConfirmationProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const formattedDate = format(parseISO(eventDate), 'EEEE dd MMMM yyyy', { locale: fr });

  return (
    <Card className={cn('border-2', config.className)}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className={cn('rounded-full p-3', config.className)}>
            <Icon className={cn('h-12 w-12', config.iconClass)} />
          </div>

          <h2 className="mt-4 text-2xl font-bold">{config.title}</h2>
          <p className="mt-2 text-muted-foreground">{config.message}</p>

          {status === 'accepted' && (
            <div className="mt-6 w-full space-y-3 rounded-lg bg-white p-4 text-left">
              <h3 className="font-semibold">Recapitulatif</h3>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Invite :</span>{' '}
                  <span className="font-medium">{guestName}</span>
                </p>

                {plusOneName && (
                  <p>
                    <span className="text-muted-foreground">Accompagnateur :</span>{' '}
                    <span className="font-medium">{plusOneName}</span>
                  </p>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{formattedDate}</span>
                </div>

                {eventLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{eventLocation}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="mt-6 text-sm text-muted-foreground">
            Vous pouvez modifier votre reponse en revenant sur cette page.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
