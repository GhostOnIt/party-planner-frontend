import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

import api from '@/api/client';
import { useGuests, useCheckInGuest, useUndoCheckIn } from '@/hooks/useGuests';
import { useToast } from '@/hooks/use-toast';
import type { Guest, GuestFilters, RsvpStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { QrScannerDialog } from '@/components/features/guests/QrScannerDialog';

type PublicInvitationResponse = {
  guest: {
    id: number | string;
    name: string;
    rsvp_status: RsvpStatus;
    plus_one?: boolean;
    plus_one_name?: string | null;
    dietary_restrictions?: string | null;
  };
  event: {
    id: number | string;
    title: string;
    type?: string;
    date?: string;
    time?: string;
    location?: string | null;
    theme?: string | null;
    description?: string | null;
  };
  already_responded: boolean;
};

export default function CheckInTabletPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useParams<{ token: string }>();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [scannerOpen, setScannerOpen] = useState(false);

  const getApiErrorMessage = (error: unknown) => {
    if (typeof error !== 'object' || error === null) return 'inconnu';
    const maybe = error as { response?: { data?: { message?: string } } };
    return maybe.response?.data?.message ?? 'inconnu';
  };

  const {
    data: invitation,
    isLoading: invitationLoading,
    error: invitationError,
  } = useQuery({
    queryKey: ['public-invitation', token],
    enabled: !!token,
    queryFn: async (): Promise<PublicInvitationResponse> => {
      const response = await api.get(`/invitations/${token}`);
      return response.data;
    },
  });

  const eventId = invitation?.event?.id;
  const guestId = invitation?.guest?.id;

  // Charger les détails du guest pour connaître `checked_in_at` (nécessite `guests.view`).
  // En cas de 403, on retombe sur une estimation (boutons disponibles mais état possiblement incomplet).
  const {
    data: scannedGuestDetails,
    isLoading: scannedGuestLoading,
  } = useQuery({
    queryKey: ['guest-details', eventId, guestId],
    enabled: !!eventId && !!guestId,
    retry: false,
    queryFn: async (): Promise<Guest | null> => {
      try {
        const response = await api.get(`/events/${eventId}/guests/${guestId}`);
        return response.data as Guest;
      } catch {
        return null;
      }
    },
  });

  const {
    data: guestsData,
    isLoading: guestsLoading,
  } = useGuests(eventId ?? '', {
    search: search.trim() || undefined,
    per_page: 20,
    page,
  } satisfies GuestFilters);

  const { mutate: checkInGuest, isPending: isCheckingIn } = useCheckInGuest(eventId ?? '');
  const { mutate: undoCheckIn, isPending: isUndoing } = useUndoCheckIn(eventId ?? '');

  const canCheckIn = useMemo(() => {
    const date = invitation?.event?.date;
    if (!date) return false;

    // Jour calendrier uniquement (minuit → 23:59:59), cohérent avec le backend.
    const dateOnly = typeof date === 'string' ? (date.includes('T') ? date.slice(0, 10) : date) : String(date);
    const start = new Date(`${dateOnly}T00:00:00`);
    const end = new Date(`${dateOnly}T23:59:59`);
    return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && Date.now() >= start.getTime() && Date.now() <= end.getTime();
  }, [invitation?.event?.date]);

  const eligibleGuests = useMemo(() => {
    const list = guestsData?.data ?? [];
    return list.filter((g) => {
      const rsvpOk = ['pending', 'accepted', 'maybe'].includes(g.rsvp_status);
      const notCheckedIn = !g.checked_in_at;
      return rsvpOk && notCheckedIn;
    });
  }, [guestsData?.data]);

  const lastPage = guestsData?.meta?.last_page;

  const scannedGuest = useMemo(() => {
    if (scannedGuestDetails) return scannedGuestDetails;
    if (!guestId) return null;
    const fromList = (guestsData?.data ?? []).find((g) => String(g.id) === String(guestId));
    return fromList ?? null;
  }, [scannedGuestDetails, guestId, guestsData?.data]);

  const isScannedCheckedIn = !!scannedGuest?.checked_in_at;

  const handleCheckIn = (guest: Guest) => {
    if (!eventId) return;
    checkInGuest(String(guest.id), {
      onSuccess: () => {
        toast({
          title: 'Check-in effectué',
          description: `${guest.name} a été enregistré.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Erreur',
          description: `Erreur lors du check-in: ${getApiErrorMessage(error)}`,
          variant: 'destructive',
        });
      },
    });
  };

  const handleUndoCheckIn = (guest: Guest) => {
    if (!eventId) return;
    undoCheckIn(String(guest.id), {
      onSuccess: () => {
        toast({
          title: 'Check-in annulé',
          description: `Le check-in de ${guest.name} a été annulé.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'Erreur',
          description: `Erreur lors de l'annulation: ${getApiErrorMessage(error)}`,
          variant: 'destructive',
        });
      },
    });
  };

  if (invitationLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-6 w-60" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  if (invitationError || !invitation) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">
              Invitation invalide ou introuvable.
            </p>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const eventDetailPath = `/events/${String(invitation.event.id)}`;

  return (
    <div className="p-3 sm:p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => navigate(eventDetailPath)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l&apos;événement
        </Button>
      </div>

      <details className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
        <summary className="cursor-pointer font-medium text-foreground">
          Comment ça fonctionne ?
        </summary>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>
            Mode portier volontairement sans menu latéral : écran dédié pour aller vite le jour de l&apos;événement.
          </li>
          <li>
            Le lien dans la barre d&apos;adresse (ou le QR) contient le code d&apos;un invité : il sert à charger
            l&apos;événement. La zone « Invité scanné » correspond à cet invité ; vous pouvez valider ou annuler son
            check-in.
          </li>
          <li>
            La recherche filtre la liste des invités éligibles (RSVP accepté / en attente / peut-être, pas encore
            check-in) pour en traiter un autre sans scanner de QR.
          </li>
          <li>
            « Scanner QR » ouvre la caméra : après lecture, la page se met à jour pour l&apos;invité du QR scanné.
          </li>
          <li>Le check-in n&apos;est autorisé que le jour de l&apos;événement (règle serveur).</li>
        </ul>
      </details>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{invitation.event.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Portier - Check-in invités
            </p>
          </div>
          <div className="text-right">
            <p className={`text-xs ${canCheckIn ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              {canCheckIn ? 'Check-in autorisé' : 'Check-in indisponible (jour de l’événement uniquement)'}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Invité scanné
              </p>
              <div className="rounded-lg border p-3">
                <p className="font-medium">{invitation.guest.name}</p>
                <p className="text-xs text-muted-foreground">
                  Statut RSVP: {invitation.guest.rsvp_status}
                </p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {isScannedCheckedIn ? (
                    <Button
                      variant="outline"
                      disabled={isUndoing}
                      onClick={() => handleUndoCheckIn(scannedGuest ?? invitationGuestFallback(invitation))}
                    >
                      {isUndoing ? 'Annulation...' : 'Annuler check-in'}
                    </Button>
                  ) : (
                    <Button
                      disabled={!canCheckIn || isCheckingIn}
                      onClick={() => handleCheckIn(scannedGuest ?? invitationGuestFallback(invitation))}
                    >
                      {isCheckingIn ? 'Check-in...' : 'Check-in'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setScannerOpen(true)}
                  >
                    Scanner QR
                  </Button>
                </div>
                {!scannedGuest && !scannedGuestLoading && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    (Détails check-in chargés à partir de la liste; actualisez après la première action si besoin.)
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Recherche rapide
              </p>
              <div className="flex gap-2">
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Nom, email ou téléphone"
                />
                <Button variant="outline" onClick={() => setSearch('')}>
                  Effacer
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {eligibleGuests.length} invité(s) éligible(s) pour le check-in
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste éligible</CardTitle>
        </CardHeader>
        <CardContent>
          {guestsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : eligibleGuests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun invité éligible pour le moment.
            </p>
          ) : (
            <div className="space-y-2">
              {eligibleGuests.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{guest.name}</p>
                    <p className="text-xs text-muted-foreground">
                      RSVP: {guest.rsvp_status}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleCheckIn(guest)}
                    disabled={!canCheckIn || isCheckingIn}
                  >
                    Check-in
                  </Button>
                </div>
              ))}
            </div>
          )}

          {typeof lastPage === 'number' && lastPage > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Précédent
              </Button>
              <p className="text-sm text-muted-foreground">
                Page {page} / {lastPage}
              </p>
              <Button
                variant="outline"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <QrScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onTokenScanned={(scannedToken) => {
          if (!scannedToken) return;
          navigate(`/check-in/${scannedToken}`);
        }}
      />
    </div>
  );
}

function invitationGuestFallback(invitation: PublicInvitationResponse): Guest {
  // Fallback minimal Guest object. check-in endpoint only needs guest id.
  return {
    id: invitation.guest.id,
    name: invitation.guest.name,
    email: null,
    phone: null,
    checked_in_at: null,
    plus_one: invitation.guest.plus_one ?? false,
    plus_one_name: invitation.guest.plus_one_name ?? null,
    dietary_restrictions: invitation.guest.dietary_restrictions ?? null,
    invitation_sent_at: null,
    invitation_token: '',
    // Extra fields not required for this page
    event_id: invitation.event.id as unknown as Guest['event_id'],
    notes: null,
    table_number: null,
    created_at: '',
  } as unknown as Guest;
}

