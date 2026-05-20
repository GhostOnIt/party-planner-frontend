import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePublicOffer, useRespondToOffer } from '@/hooks/useQuoteRequests';
import { Check, X, Clock, FileText } from 'lucide-react';

export function PublicOfferPage() {
  const { clientToken } = useParams<{ clientToken: string }>();
  const { data: offer, isLoading, isError } = usePublicOffer(clientToken ?? '');
  const { mutate: respond, isPending: isResponding } = useRespondToOffer();

  const [responseNote, setResponseNote] = useState('');
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Helmet>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <p className="text-muted-foreground">Chargement de l'offre...</p>
      </div>
    );
  }

  if (isError || !offer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Helmet>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <Card className="w-full max-w-md">
          <CardContent className="py-10 text-center">
            <X className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h2 className="text-lg font-semibold">Offre introuvable</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Ce lien est invalide ou l'offre n'est plus disponible.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('fr-FR').format(offer.price_amount) + ' ' + offer.price_currency;
  const isExpired = offer.status === 'expired';
  const hasResponded = offer.status === 'accepted' || offer.status === 'rejected';
  const canRespond = offer.status === 'sent';

  const handleConfirm = () => {
    if (!confirmAction || !clientToken) return;
    respond(
      { clientToken, action: confirmAction, responseNote: responseNote || undefined },
      { onSuccess: () => setConfirmAction(null) }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{offer.title}</CardTitle>
          {offer.tracking_code && (
            <p className="text-sm text-muted-foreground">
              Demande {offer.tracking_code} — {offer.company_name}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Price */}
          <div className="rounded-lg bg-primary/5 p-4 text-center">
            <p className="text-3xl font-bold text-primary">{formattedPrice}</p>
            <p className="text-sm text-muted-foreground">Validité: {offer.validity_days} jours</p>
            {offer.expires_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Expire le {new Date(offer.expires_at).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>

          {/* Description */}
          {offer.description && (
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <p className="text-sm mt-1">{offer.description}</p>
            </div>
          )}

          {/* Features */}
          {offer.features && offer.features.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Fonctionnalités incluses</Label>
              <ul className="mt-1 space-y-1">
                {offer.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Terms */}
          {offer.terms && (
            <div>
              <Label className="text-xs text-muted-foreground">Conditions</Label>
              <p className="text-xs mt-1 text-muted-foreground">{offer.terms}</p>
            </div>
          )}

          {/* Status badges */}
          {isExpired && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <Clock className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">Cette offre a expiré</p>
            </div>
          )}

          {hasResponded && (
            <div className={`flex items-center gap-2 rounded-lg border p-3 ${
              offer.status === 'accepted'
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950'
                : 'border-destructive/20 bg-destructive/5'
            }`}>
              {offer.status === 'accepted' ? (
                <Check className="h-5 w-5 text-emerald-600" />
              ) : (
                <X className="h-5 w-5 text-destructive" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {offer.status === 'accepted' ? 'Offre acceptée' : 'Offre refusée'}
                </p>
                {offer.client_response_note && (
                  <p className="text-xs text-muted-foreground">{offer.client_response_note}</p>
                )}
                {offer.client_responded_at && (
                  <p className="text-xs text-muted-foreground">
                    le {new Date(offer.client_responded_at).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Response form */}
          {canRespond && (
            <div className="space-y-3 border-t pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="response-note">Note (optionnel)</Label>
                <Textarea
                  id="response-note"
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  rows={2}
                  placeholder="Commentaire ou question..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => setConfirmAction('accept')}
                  disabled={isResponding}
                >
                  <Check className="mr-2 h-4 w-4" /> Accepter l'offre
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmAction('reject')}
                  disabled={isResponding}
                >
                  <X className="mr-2 h-4 w-4" /> Refuser
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'accept' ? 'Accepter cette offre ?' : 'Refuser cette offre ?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'accept'
                ? 'En acceptant, vous confirmez votre intérêt pour cette offre. Notre équipe vous contactera pour finaliser.'
                : 'En refusant, vous indiquez que cette offre ne vous convient pas. Vous pourrez toujours discuter d\'une nouvelle offre.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResponding}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isResponding}>
              {isResponding ? 'Envoi...' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
