import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Send, Trash2 } from 'lucide-react';
import type { CustomOffer } from '@/hooks/useQuoteRequests';

interface CustomOfferCardProps {
  offer: CustomOffer;
  onEdit?: (offer: CustomOffer) => void;
  onSend?: (offerId: string) => void;
  onDelete?: (offerId: string) => void;
  isSending?: boolean;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Brouillon', variant: 'outline' },
  sent: { label: 'Envoyée', variant: 'default' },
  accepted: { label: 'Acceptée', variant: 'default' },
  rejected: { label: 'Refusée', variant: 'destructive' },
  expired: { label: 'Expirée', variant: 'secondary' },
};

export function CustomOfferCard({ offer, onEdit, onSend, onDelete, isSending }: CustomOfferCardProps) {
  const config = statusConfig[offer.status] ?? { label: offer.status, variant: 'outline' as const };
  const formattedPrice = new Intl.NumberFormat('fr-FR').format(offer.price_amount) + ' ' + offer.price_currency;

  return (
    <Card>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{offer.title}</p>
            <p className="text-sm font-semibold text-primary">{formattedPrice}</p>
          </div>
          <Badge variant={config.variant}>{config.label}</Badge>
        </div>

        {offer.features && offer.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {offer.features.map((feature, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        )}

        {offer.terms && (
          <p className="text-xs text-muted-foreground line-clamp-2">{offer.terms}</p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Validité: {offer.validity_days} jours</span>
          {offer.expires_at && (
            <span>Expire: {new Date(offer.expires_at).toLocaleDateString('fr-FR')}</span>
          )}
        </div>

        {offer.client_responded_at && (
          <div className="rounded border p-2 text-xs">
            <p className="font-medium">
              Réponse du client ({new Date(offer.client_responded_at).toLocaleDateString('fr-FR')})
            </p>
            {offer.client_response_note && (
              <p className="text-muted-foreground mt-1">{offer.client_response_note}</p>
            )}
          </div>
        )}

        {offer.status === 'draft' && (
          <div className="flex gap-2">
            {onEdit && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onEdit(offer)}>
                <Pencil className="mr-1 h-3 w-3" /> Modifier
              </Button>
            )}
            {onSend && (
              <Button size="sm" className="h-7 text-xs" disabled={isSending} onClick={() => onSend(offer.id)}>
                <Send className="mr-1 h-3 w-3" /> {isSending ? 'Envoi...' : 'Envoyer'}
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => onDelete(offer.id)}>
                <Trash2 className="mr-1 h-3 w-3" /> Supprimer
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
