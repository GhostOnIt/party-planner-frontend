import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PartyPopper, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RsvpForm,
  EventInfoCard,
  RsvpConfirmation,
} from '@/components/features/public-invitation';
import {
  useInvitationDetails,
  useSubmitRsvp,
} from '@/hooks/usePublicInvitation';
import { getApiErrorMessage } from '@/api/client';
import type { RsvpResponseFormData, RsvpStatus } from '@/types';

export function InvitationResponsePage() {
  const { token } = useParams<{ token: string }>();
  const [submittedStatus, setSubmittedStatus] = useState<RsvpStatus | null>(null);
  const [submittedPlusOneName, setSubmittedPlusOneName] = useState<string | null>(null);

  const {
    data: invitation,
    isLoading,
    error,
    refetch,
  } = useInvitationDetails(token || '');

  const { mutate: submitRsvp, isPending: isSubmitting } = useSubmitRsvp(token || '');

  const handleSubmit = (data: RsvpResponseFormData) => {
    submitRsvp(data, {
      onSuccess: (response) => {
        setSubmittedStatus(response.guest.rsvp_status);
        setSubmittedPlusOneName(response.guest.plus_one_name);
        // Refetch to update the local data
        refetch();
      },
      onError: (error) => {
        console.error('RSVP submission error:', error);
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Error state - Invalid or expired token
  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <h1 className="mt-4 text-2xl font-bold">Invitation introuvable</h1>
              <p className="mt-2 text-muted-foreground">
                Ce lien d'invitation est invalide ou a expire.
                Veuillez contacter l'organisateur de l'evenement.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                {getApiErrorMessage(error)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if can respond (default to true if not specified)
  const canRespond = invitation.can_respond !== false;

  // Cannot respond state
  if (!canRespond) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="space-y-6">
            <EventInfoCard event={invitation.event} />

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="rounded-full bg-amber-100 p-4">
                  <AlertTriangle className="h-12 w-12 text-amber-600" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-amber-800">
                  Reponse non disponible
                </h2>
                <p className="mt-2 text-amber-700">
                  Il n'est plus possible de repondre a cette invitation.
                  Veuillez contacter l'organisateur pour plus d'informations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show confirmation if just submitted
  if (submittedStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-center gap-3">
              <PartyPopper className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Invitation</h1>
            </div>

            <RsvpConfirmation
              status={submittedStatus}
              guestName={invitation.guest.name}
              eventDate={invitation.event.date}
              eventLocation={invitation.event.location ?? null}
              plusOneName={submittedPlusOneName}
            />

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setSubmittedStatus(null)}
              >
                Modifier ma reponse
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form view
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center gap-3">
            <PartyPopper className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Invitation</h1>
          </div>

          {/* Event Info */}
          <EventInfoCard event={invitation.event} />

          {/* Already responded notice */}
          {(invitation.has_responded || invitation.already_responded) && invitation.guest.rsvp_status !== 'pending' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <p className="text-sm text-blue-800">
                  Vous avez deja repondu a cette invitation. Vous pouvez modifier votre reponse ci-dessous.
                </p>
              </CardContent>
            </Card>
          )}

          {/* RSVP Form */}
          <RsvpForm
            guestName={invitation.guest.name}
            currentStatus={invitation.guest.rsvp_status}
            hasPlusOne={invitation.guest.plus_one ?? false}
            currentPlusOneName={invitation.guest.plus_one_name ?? null}
            currentDietaryRestrictions={invitation.guest.dietary_restrictions ?? null}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Propulse par Party Planner</p>
          </div>
        </div>
      </div>
    </div>
  );
}
