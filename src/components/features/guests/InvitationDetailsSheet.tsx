import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Mail, Phone, Calendar, UserPlus, UtensilsCrossed, FileText } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { RsvpBadge } from './RsvpBadge';
import { useInvitationDetails } from '@/hooks/useGuests';
//import { useToast } from '@/hooks/use-toast';

interface InvitationDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number | string;
  guestId: number | null;
}

export function InvitationDetailsSheet({
  open,
  onOpenChange,
  eventId,
  guestId,
}: InvitationDetailsSheetProps) {
  //const { toast } = useToast();
  //const [copied, setCopied] = useState(false);
  const { data, isLoading, error } = useInvitationDetails(eventId, guestId);

  // const handleCopyLink = () => {
  //   if (data?.invitation_url) {
  //     navigator.clipboard.writeText(data.invitation_url);
  //     //  setCopied(true);
  //     toast({
  //       title: 'Lien copié',
  //       description: "Le lien de l'invitation a été copié dans le presse-papiers.",
  //     });
  //     //  setTimeout(() => setCopied(false), 2000);
  //   }
  // };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Détails de l'invitation</SheetTitle>
            <SheetDescription>
              <div className="space-y-4 mt-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  if (error || !data) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Détails de l'invitation</SheetTitle>
            <SheetDescription>
              <p className="text-destructive mt-4">
                {error
                  ? 'Erreur lors du chargement des détails.'
                  : 'Aucune information disponible.'}
              </p>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  const { guest, invitation, invitation_sent_at } = data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Détails de l'invitation</SheetTitle>
          <SheetDescription>
            Informations complètes de l'invitation pour {guest.name}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-4">
          {/* Section 1: Informations de l'invité */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations de l'invité
            </h3>
            <div className="space-y-2 pl-7">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                <p className="text-base">{guest.name}</p>
              </div>

              {guest.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base">{guest.email}</p>
                  </div>
                </div>
              )}

              {guest.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                    <p className="text-base">{guest.phone}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Statut RSVP</p>
                <RsvpBadge
                  status={guest.rsvp_status as 'pending' | 'accepted' | 'declined' | 'maybe'}
                />
              </div>

              {guest.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-base whitespace-pre-wrap">{guest.notes}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Section 2: Dates */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dates importantes
            </h3>
            <div className="space-y-2 pl-7">
              {invitation_sent_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date d'envoi</p>
                  <p className="text-base">
                    {format(parseISO(invitation_sent_at), 'EEEE d MMMM yyyy à HH:mm', {
                      locale: fr,
                    })}
                  </p>
                </div>
              )}

              {invitation?.responded_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de réponse</p>
                  <p className="text-base">
                    {format(parseISO(invitation.responded_at), 'EEEE d MMMM yyyy à HH:mm', {
                      locale: fr,
                    })}
                  </p>
                </div>
              )}

              {!invitation_sent_at && (
                <p className="text-sm text-muted-foreground italic">
                  Invitation non encore envoyée
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Section 3: Accompagnateur */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Accompagnateur
            </h3>
            <div className="pl-7">
              {guest.plus_one ? (
                <div className="space-y-2">
                  <Badge variant="outline" className="gap-1">
                    <UserPlus className="h-3 w-3" />
                    +1
                  </Badge>
                  {guest.plus_one_name ? (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Nom de l'accompagnateur
                      </p>
                      <p className="text-base">{guest.plus_one_name}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nom de l'accompagnateur non renseigné
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun accompagnateur</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Section 4: Restrictions alimentaires */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5" />
              Restrictions alimentaires
            </h3>
            <div className="pl-7">
              {guest.dietary_restrictions ? (
                <p className="text-base whitespace-pre-wrap">{guest.dietary_restrictions}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune restriction alimentaire renseignée
                </p>
              )}
            </div>
          </div>

          {/* Lien de l'invitation */}
          {/* {data.invitation_url && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Lien de l'invitation</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground flex-1 truncate">
                    {data.invitation_url}
                  </p>
                  <Button variant="outline" size="sm" onClick={handleCopyLink} className="shrink-0">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copié
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copier
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )} */}
        </div>
      </SheetContent>
    </Sheet>
  );
}
