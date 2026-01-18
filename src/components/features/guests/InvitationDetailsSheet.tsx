import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Mail,
  Phone,
  UserPlus,
  UtensilsCrossed,
  Users,
  Check,
  Copy,
  Send,
  Pencil,
  Trash2,
  MessageSquare,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { RsvpBadge } from './RsvpBadge';
import { useInvitationDetails } from '@/hooks/useGuests';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const { data, isLoading, error } = useInvitationDetails(eventId, guestId);

  const handleCopyLink = () => {
    if (data?.invitation_url) {
      navigator.clipboard.writeText(data.invitation_url);
      setCopied(true);
      toast({
        title: 'Lien copié',
        description: "Le lien de l'invitation a été copié dans le presse-papiers.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!open) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:w-lg sm:max-w-lg overflow-y-auto transition-none data-[state=open]:duration-150 data-[state=closed]:duration-150 data-[state=open]:animate-none data-[state=closed]:animate-none"
        />
      </Sheet>
    );
  }

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:w-lg sm:max-w-lg overflow-y-auto transition-none data-[state=open]:duration-150 data-[state=closed]:duration-150 data-[state=open]:animate-none data-[state=closed]:animate-none"
        >
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
        <SheetContent
          side="right"
          className="w-full sm:w-lg sm:max-w-lg overflow-y-auto transition-none data-[state=open]:duration-150 data-[state=closed]:duration-150 data-[state=open]:animate-none data-[state=closed]:animate-none"
        >
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
      <SheetContent
        side="right"
        className="w-full sm:w-lg sm:max-w-lg overflow-y-auto transition-none data-[state=open]:duration-150 data-[state=closed]:duration-150 data-[state=open]:animate-none data-[state=closed]:animate-none"
      >
        <SheetHeader className="space-y-1 pb-6">
          <SheetTitle className="text-xl">Détails de l'invitation</SheetTitle>
          <SheetDescription>
            Informations complètes pour {guest.name}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-[#4F46E5]" />
              </div>
              Informations de contact
            </h4>
            <div className="bg-[#f9fafb] rounded-xl p-4 space-y-3 border border-[#e5e7eb]">
              {guest.email && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#e5e7eb]">
                    <Mail className="h-4 w-4 text-[#6b7280]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#6b7280] mb-0.5">Email</p>
                    <p className="text-sm font-medium text-[#1a1a2e] truncate">{guest.email}</p>
                  </div>
                </div>
              )}
              {guest.phone && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#e5e7eb]">
                    <Phone className="h-4 w-4 text-[#6b7280]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#6b7280] mb-0.5">Téléphone</p>
                    <p className="text-sm font-medium text-[#1a1a2e]">{guest.phone}</p>
                  </div>
                </div>
              )}
              {guest.rsvp_status && (
                <div className="flex items-center gap-3 pt-2 border-t border-[#e5e7eb]">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#e5e7eb]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#6b7280] mb-1">Statut RSVP</p>
                    <RsvpBadge
                      status={guest.rsvp_status as 'pending' | 'accepted' | 'declined' | 'maybe'}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Important Dates */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                <Clock className="h-3.5 w-3.5 text-[#10B981]" />
              </div>
              Dates importantes
            </h4>
            <div className="bg-[#f9fafb] rounded-xl p-4 space-y-3 border border-[#e5e7eb]">
              {invitation_sent_at ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#e5e7eb]">
                    <Send className="h-4 w-4 text-[#4F46E5]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#6b7280] mb-0.5">Invitation envoyée</p>
                    <p className="text-sm font-medium text-[#1a1a2e]">
                      {format(parseISO(invitation_sent_at), 'EEEE d MMMM yyyy à HH:mm', {
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#e5e7eb]">
                    <Send className="h-4 w-4 text-[#9ca3af]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#9ca3af] italic">
                      Invitation non encore envoyée
                    </p>
                  </div>
                </div>
              )}

              {invitation?.responded_at && (
                <div className="flex items-start gap-3 pt-2 border-t border-[#e5e7eb]">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-[#e5e7eb]">
                    <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-[#6b7280] mb-0.5">Réponse reçue</p>
                    <p className="text-sm font-medium text-[#1a1a2e]">
                      {format(parseISO(invitation.responded_at), 'EEEE d MMMM yyyy à HH:mm', {
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Companion */}
          {guest.plus_one && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#E91E8C]/10 flex items-center justify-center">
                  <UserPlus className="h-3.5 w-3.5 text-[#E91E8C]" />
                </div>
                Accompagnateur
              </h4>
              <div className="bg-linear-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-pink-200">
                    <span className="text-sm font-semibold text-[#E91E8C]">+1</span>
                  </div>
                  <div className="flex-1">
                    {guest.plus_one_name ? (
                      <>
                        <p className="text-xs text-[#6b7280] mb-0.5">Nom de l'accompagnateur</p>
                        <p className="text-sm font-medium text-[#1a1a2e]">{guest.plus_one_name}</p>
                      </>
                    ) : (
                      <p className="text-sm text-[#6b7280] italic">
                        Nom de l'accompagnateur non renseigné
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dietary Restrictions */}
          {guest.dietary_restrictions && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-[#F59E0B]" />
                </div>
                Restrictions alimentaires
              </h4>
              <div className="flex flex-wrap gap-2">
                {guest.dietary_restrictions
                  .split(',')
                  .map((restriction: string) => restriction.trim())
                  .filter((restriction: string) => restriction.length > 0)
                  .map((restriction: string, index: number) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B] hover:bg-[#F59E0B]/20"
                    >
                      {restriction}
                    </Badge>
                  ))}
              </div>
            </div>
          )}


          {/* Notes */}
          {guest.notes && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5 text-[#3B82F6]" />
                </div>
                Notes
              </h4>
              <div className="bg-white rounded-xl p-4 border border-[#e5e7eb]">
                <p className="text-sm text-[#1a1a2e] leading-relaxed whitespace-pre-wrap">
                  {guest.notes}
                </p>
              </div>
            </div>
          )}

          {/* Invitation Link */}
          {data.invitation_url && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#1a1a2e] flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#6366F1]/10 flex items-center justify-center">
                  <Copy className="h-3.5 w-3.5 text-[#6366F1]" />
                </div>
                Lien de l'invitation
              </h4>
              <div className="bg-[#f9fafb] rounded-xl p-4 border border-[#e5e7eb]">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-[#6b7280] flex-1 truncate font-mono bg-white px-3 py-2 rounded-lg border border-[#e5e7eb]">
                    {data.invitation_url}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="shrink-0 border-[#e5e7eb] hover:bg-[#f3f4f6]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-[#10B981]" />
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
            </div>
          )}

          <Separator className="my-6" />

          {/* Actions */}
          <div className="space-y-3 pb-4">
            <Button
              className="w-full bg-linear-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white gap-2 shadow-md shadow-[#4F46E5]/25 transition-all"
            >
              <Send className="h-4 w-4" />
              Renvoyer l'invitation
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2 border-[#e5e7eb] hover:bg-[#f3f4f6]"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 text-[#EF4444] hover:text-[#DC2626] hover:bg-red-50 border-[#e5e7eb] hover:border-red-200"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
