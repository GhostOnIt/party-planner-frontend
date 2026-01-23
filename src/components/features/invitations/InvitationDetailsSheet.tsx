import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Shield, Check, X, Mail, MapPin, Users, Clock, MessageSquare } from 'lucide-react';
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
      <SheetContent
        side="right"
        className="w-full sm:w-lg sm:max-w-lg overflow-y-auto transition-none data-[state=open]:duration-150 data-[state=closed]:duration-150 data-[state=open]:animate-none data-[state=closed]:animate-none"
      >
        <SheetHeader className="space-y-1 pb-6">
          <SheetTitle className="text-xl">Détails de l'invitation</SheetTitle>
          <SheetDescription>
            Invitation reçue {timeAgo}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Inviter */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-[#4F46E5]" />
              </div>
              Invité par
            </h4>
            <div className="bg-[#f9fafb] rounded-xl p-4 space-y-3 border border-[#e5e7eb]">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarImage src={resolveUrl(invitation.inviter?.avatar_url)} />
                  <AvatarFallback className="bg-[#4F46E5]/10 text-[#4F46E5] font-semibold">
                    {inviterInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a2e]">
                    {invitation.inviter?.name || 'Utilisateur inconnu'}
                  </p>
                  {invitation.inviter?.email && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#e5e7eb]">
                        <Mail className="h-3.5 w-3.5 text-[#6b7280]" />
                      </div>
                      <p className="text-xs text-[#6b7280] truncate">
                        {invitation.inviter.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Event Details */}
          {invitation.event && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-[#10B981]" />
                </div>
                Événement
              </h4>
              <div className="bg-[#f9fafb] rounded-xl p-4 space-y-3 border border-[#e5e7eb]">
                <div>
                  <h4 className="text-sm font-semibold text-[#1a1a2e] mb-1">
                    {invitation.event.title}
                  </h4>
                  {invitation.event.type && (
                    <p className="text-xs text-[#6b7280]">{invitation.event.type}</p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-[#e5e7eb]">
                  {eventDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#e5e7eb]">
                        <Calendar className="h-4 w-4 text-[#6b7280]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#6b7280] mb-0.5">Date de l'événement</p>
                        <p className="text-sm font-medium text-[#1a1a2e]">{eventDate}</p>
                      </div>
                    </div>
                  )}
                  {invitation.event.location && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#e5e7eb]">
                        <MapPin className="h-4 w-4 text-[#6b7280]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#6b7280] mb-0.5">Lieu</p>
                        <p className="text-sm font-medium text-[#1a1a2e]">
                          {invitation.event.location}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {invitation.event.description && (
                  <div className="pt-2 border-t border-[#e5e7eb]">
                    <p className="text-xs text-[#6b7280] mb-1">Description</p>
                    <p className="text-sm text-[#1a1a2e] leading-relaxed">
                      {invitation.event.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Roles */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                <Shield className="h-3.5 w-3.5 text-[#6366F1]" />
              </div>
              Rôles proposés
            </h4>
            <div className="flex flex-wrap gap-2">
              {(invitation.roles || [invitation.role]).filter(Boolean).map((role, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-[#6366F1]/10 border-[#6366F1]/30 text-[#6366F1] hover:bg-[#6366F1]/20"
                >
                  {role ? (ROLE_LABELS[role] || role) : 'Rôle inconnu'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Message */}
          {invitation.message && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5 text-[#3B82F6]" />
                </div>
                Message personnalisé
              </h4>
              <div className="bg-white rounded-xl p-4 border border-[#e5e7eb]">
                <p className="text-sm text-[#1a1a2e] leading-relaxed whitespace-pre-wrap italic">
                  "{invitation.message}"
                </p>
              </div>
            </div>
          )}

          {/* Date de réception */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-[#10B981]" />
              </div>
              Date de réception
            </h4>
            <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#e5e7eb]">
                  <Clock className="h-4 w-4 text-[#10B981]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#6b7280] mb-0.5">Reçue</p>
                  {invitation.created_at && (
                    <p className="text-sm font-medium text-[#1a1a2e]">
                      {format(parseISO(invitation.created_at), 'EEEE d MMMM yyyy à HH:mm', {
                        locale: fr,
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Actions */}
          <div className="space-y-3 pb-4">
            <Button
              onClick={() => onAccept(invitation.id)}
              disabled={isAccepting || isRejecting}
              className="w-full bg-linear-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white gap-2 shadow-md shadow-[#4F46E5]/25 transition-all"
            >
              {isAccepting ? (
                <>
                  <Check className="h-4 w-4" />
                  Acceptation...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Accepter l'invitation
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onReject(invitation.id)}
              disabled={isRejecting || isAccepting}
              className="w-full gap-2 text-[#EF4444] hover:text-[#DC2626] hover:bg-red-50 border-[#e5e7eb] hover:border-red-200"
            >
              {isRejecting ? (
                <>
                  <X className="h-4 w-4" />
                  Refus...
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Refuser l'invitation
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
