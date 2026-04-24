import { useState, type FormEvent } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateQuoteRequest } from '@/hooks/useQuoteRequests';

type Props = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId?: string;
}>;

export function BusinessQuoteRequestDialog({ open, onOpenChange, planId }: Props) {
  const { toast } = useToast();
  const { mutateAsync: createQuoteRequest, isPending } = useCreateQuoteRequest();
  const [formState, setFormState] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    company_name: '',
    business_needs: '',
    budget_estimate: '',
    team_size: '',
    timeline: '',
    event_types: '',
  });
  const [lastTrackingCode, setLastTrackingCode] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await createQuoteRequest({
        plan_id: planId,
        contact_name: formState.contact_name,
        contact_email: formState.contact_email,
        contact_phone: formState.contact_phone,
        company_name: formState.company_name,
        business_needs: formState.business_needs,
        budget_estimate: formState.budget_estimate ? Number(formState.budget_estimate) : undefined,
        team_size: formState.team_size ? Number(formState.team_size) : undefined,
        timeline: formState.timeline || undefined,
        event_types: formState.event_types
          ? formState.event_types.split(',').map((item) => item.trim()).filter(Boolean)
          : undefined,
      });

      const trackingCode = response.data.tracking_code;
      setLastTrackingCode(trackingCode);

      toast({
        title: 'Demande envoyée',
        description: `Votre demande a bien été enregistrée (code: ${trackingCode}).`,
      });

      setFormState({
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        company_name: '',
        business_needs: '',
        budget_estimate: '',
        team_size: '',
        timeline: '',
        event_types: '',
      });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Impossible de soumettre votre demande pour le moment.';
      toast({
        title: 'Erreur',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const trackingUrl = lastTrackingCode
    ? `${globalThis.location.origin}/subscriptions?tab=business-requests`
    : '';
  const qrUrl = trackingUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(trackingUrl)}`
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Demande de devis Business</DialogTitle>
          <DialogDescription>
            Décris vos besoins et notre équipe vous contactera pour une offre sur mesure.
          </DialogDescription>
        </DialogHeader>

        {lastTrackingCode ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-900">Demande enregistrée: {lastTrackingCode}</p>
            <p className="mt-1 text-sm text-emerald-700">
              Suivez son évolution depuis l’onglet <strong>Demandes Business</strong> dans Abonnements.
            </p>
            {qrUrl && (
              <img src={qrUrl} alt="QR de suivi de la demande" className="mt-3 h-[140px] w-[140px] rounded border" />
            )}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Nom complet</Label>
              <Input
                id="contact_name"
                value={formState.contact_name}
                onChange={(e) => setFormState((s) => ({ ...s, contact_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email professionnel</Label>
              <Input
                id="contact_email"
                type="email"
                value={formState.contact_email}
                onChange={(e) => setFormState((s) => ({ ...s, contact_email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Téléphone</Label>
              <Input
                id="contact_phone"
                value={formState.contact_phone}
                onChange={(e) => setFormState((s) => ({ ...s, contact_phone: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name">Entreprise</Label>
              <Input
                id="company_name"
                value={formState.company_name}
                onChange={(e) => setFormState((s) => ({ ...s, company_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_estimate">Budget estimé (FCFA)</Label>
              <Input
                id="budget_estimate"
                type="number"
                min={0}
                value={formState.budget_estimate}
                onChange={(e) => setFormState((s) => ({ ...s, budget_estimate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team_size">Taille équipe</Label>
              <Input
                id="team_size"
                type="number"
                min={1}
                value={formState.team_size}
                onChange={(e) => setFormState((s) => ({ ...s, team_size: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline visée</Label>
            <Input
              id="timeline"
              placeholder="Ex: Lancement dans 2 mois"
              value={formState.timeline}
              onChange={(e) => setFormState((s) => ({ ...s, timeline: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_types">Type(s) d’événements</Label>
            <Input
              id="event_types"
              placeholder="Mariage, Corporate, Conférence (séparés par des virgules)"
              value={formState.event_types}
              onChange={(e) => setFormState((s) => ({ ...s, event_types: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_needs">Besoin détaillé</Label>
            <Textarea
              id="business_needs"
              rows={5}
              minLength={20}
              maxLength={3000}
              value={formState.business_needs}
              onChange={(e) => setFormState((s) => ({ ...s, business_needs: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

