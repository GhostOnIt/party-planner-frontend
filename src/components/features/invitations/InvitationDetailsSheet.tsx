import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Shield, Check, X, User, Mail, MapPin } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ROLE_LABELS } from '@/utils/constants';
import type { Invitation } from '@/types';
import { resolveUrl } from '@/lib/utils';

interface InvitationDetailsSheetProps {
  invitation: Invitation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

export function InvitationDetailsSheet({
  invitation,
  open,
  onOpenChange,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}: InvitationDetailsSheetProps) {
  const timeAgo = invitation.created_at
    ? formatDistanceToNow(parseISO(invitation.created_at), {
        addSuffix: true,
        locale: fr,
      })
    : 'Date inconnue';

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Détails de l'invitation</SheetTitle>
          <SheetDescription>
            Invitation reçue {timeAgo}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Inviter */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={resolveUrl(invitation.inviter?.avatar_url)} />
              <AvatarFallback>{inviterInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{invitation.inviter?.name || 'Utilisateur inconnu'}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {invitation.inviter?.email || 'Email non disponible'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Event Details */}
          {invitation.event && (
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Événement
              </h3>
              <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                <div>
                  <h4 className="font-medium text-lg">{invitation.event.title}</h4>
                  <p className="text-sm text-muted-foreground">{invitation.event.type}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {eventDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {eventDate}
                    </span>
                  )}
                  {invitation.event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {invitation.event.location}
                    </span>
                  )}
                </div>

                {invitation.event.description && (
                  <p className="text-sm">{invitation.event.description}</p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Roles */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Rôles proposés
            </h3>
            <div className="flex flex-wrap gap-2">
              {(invitation.roles || [invitation.role]).filter(Boolean).map((role, index) => (
                <Badge key={index} variant="secondary">
                  {role ? (ROLE_LABELS[role] || role) : 'Rôle inconnu'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Message */}
          {invitation.message && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-medium">Message personnalisé</h3>
                <p className="text-sm bg-muted/50 p-3 rounded-lg italic">
                  "{invitation.message}"
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onReject(invitation.id)}
              disabled={isRejecting || isAccepting}
              className="flex-1"
            >
              {isRejecting ? <X className="mr-2 h-4 w-4" /> : null}
              {isRejecting ? 'Refus...' : 'Refuser'}
            </Button>
            <Button
              onClick={() => onAccept(invitation.id)}
              disabled={isAccepting || isRejecting}
              className="flex-1"
            >
              {isAccepting ? <Check className="mr-2 h-4 w-4" /> : null}
              {isAccepting ? 'Acceptation...' : 'Accepter'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
