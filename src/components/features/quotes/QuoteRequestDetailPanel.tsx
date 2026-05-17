import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { QuoteRequestTimeline } from './QuoteRequestTimeline';
import { CustomOfferCard } from './CustomOfferCard';
import { CustomOfferForm } from './CustomOfferForm';
import {
  useAddQuoteNote,
  useAssignQuoteRequest,
  useCreateCustomOffer,
  useDeleteCustomOffer,
  useQuoteRequestOffers,
  useScheduleQuoteCall,
  useSendCustomOffer,
  useUpdateQuoteOutcome,
  useUpdateQuoteStage,
  type CustomOffer,
  type QuoteRequest,
  type QuoteRequestStage,
} from '@/hooks/useQuoteRequests';
import { Plus } from 'lucide-react';

interface AdminUser {
  id: string | number;
  name: string;
}

interface QuoteRequestDetailPanelProps {
  request: QuoteRequest;
  stages: QuoteRequestStage[];
  adminUsers: AdminUser[];
}

export function QuoteRequestDetailPanel({
  request,
  stages,
  adminUsers,
}: QuoteRequestDetailPanelProps) {
  const { toast } = useToast();
  const [note, setNote] = useState('');
  const [callDateTime, setCallDateTime] = useState('');
  const [outcomeNote, setOutcomeNote] = useState('');
  const [offerFormOpen, setOfferFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<CustomOffer | null>(null);

  const { mutate: updateStage } = useUpdateQuoteStage();
  const { mutate: assignQuoteRequest } = useAssignQuoteRequest();
  const { mutate: addNote, isPending: isAddingNote } = useAddQuoteNote();
  const { mutate: scheduleCall, isPending: isSchedulingCall } = useScheduleQuoteCall();
  const { mutate: setOutcome, isPending: isSettingOutcome } = useUpdateQuoteOutcome();
  const { data: offers = [] } = useQuoteRequestOffers(request.id);
  const { mutate: createOffer, isPending: isCreatingOffer } = useCreateCustomOffer();
  const { mutate: sendOffer, isPending: isSendingOffer } = useSendCustomOffer();
  const { mutate: deleteOffer } = useDeleteCustomOffer();

  const currentIndex = stages.findIndex((s) => s.id === request.current_stage_id);
  const total = stages.length || 1;
  const percentage = Math.round(((Math.max(currentIndex, 0) + 1) / total) * 100);
  const currentStageName = currentIndex >= 0 ? stages[currentIndex]?.name ?? 'N/A' : 'En attente';
  const nextStageName = currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1]?.name : null;

  const moveToNextStage = () => {
    if (currentIndex < 0 || currentIndex >= stages.length - 1) return;
    const nextStage = stages[currentIndex + 1];
    updateStage(
      { quoteRequestId: request.id, stageId: nextStage.id },
      { onSuccess: () => toast({ title: `Passage vers: ${nextStage.name}` }) }
    );
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return '\u2014';
    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="rounded-lg border bg-primary/5 p-3">
        <p className="text-sm font-semibold">État actuel: {currentStageName}</p>
        <p className="text-sm text-muted-foreground">
          Prochain état: {nextStageName ?? 'Aucun (demande finalisée)'}
        </p>
        <p className="mt-1 text-sm font-medium">Avancement: {percentage}%</p>
        <div className="mt-2 h-2 w-full rounded-full bg-muted">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {/* Contact card */}
      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{request.company_name}</p>
            <p className="text-sm text-muted-foreground">{request.contact_name}</p>
            <p className="text-sm text-muted-foreground">{request.contact_email}</p>
            <p className="text-sm text-muted-foreground">{request.contact_phone}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline">{request.tracking_code}</Badge>
            <Badge>{request.current_stage?.name ?? 'Sans étape'}</Badge>
            <Badge variant={request.status === 'closed' ? 'secondary' : 'default'}>
              {request.status === 'closed' ? 'Clôturée' : 'Ouverte'}
            </Badge>
          </div>
        </div>
        <p className="mt-3 text-sm">{request.business_needs}</p>
        {request.budget_estimate && (
          <p className="mt-1 text-xs text-muted-foreground">
            Budget estimé: {new Intl.NumberFormat('fr-FR').format(request.budget_estimate)} | Équipe: {request.team_size ?? 'N/A'}
          </p>
        )}
        {request.outcome_note && (
          <div className="mt-2 rounded border p-2 text-xs">
            <p className="font-medium">Note de clôture ({request.outcome === 'won' ? 'Gagnée' : 'Perdue'}):</p>
            <p className="text-muted-foreground">{request.outcome_note}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-2 rounded-lg border p-3">
        <Label>Progression de la demande</Label>
        <QuoteRequestTimeline
          stages={stages}
          currentStageId={request.current_stage_id}
          activities={request.activities}
          onAdvance={moveToNextStage}
          canAdvance={nextStageName !== null}
        />
      </div>

      {/* Activity timeline (all) */}
      <div className="space-y-2">
        <Label>Historique complet</Label>
        <div className="rounded-lg border p-3 max-h-[200px] overflow-y-auto">
          {request.activities && request.activities.length > 0 ? (
            <div className="space-y-3">
              {[...request.activities]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((activity) => (
                  <div key={activity.id} className="flex gap-2">
                    <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{activity.message ?? activity.activity_type}</p>
                      {activity.user && (
                        <p className="text-xs text-muted-foreground">par {activity.user.name}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{formatDateTime(activity.created_at)}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun historique pour le moment.</p>
          )}
        </div>
      </div>

      {/* Admin assignment */}
      <div className="space-y-2">
        <Label>Assigner un administrateur</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={request.assigned_admin_id === null ? 'default' : 'outline'}
            onClick={() =>
              assignQuoteRequest(
                { quoteRequestId: request.id, assignedAdminId: null },
                { onSuccess: () => toast({ title: 'Assignation retirée' }) }
              )
            }
          >
            Non assignée
          </Button>
          {adminUsers.map((admin) => (
            <Button
              key={admin.id}
              size="sm"
              variant={request.assigned_admin_id === String(admin.id) ? 'default' : 'outline'}
              onClick={() =>
                assignQuoteRequest(
                  { quoteRequestId: request.id, assignedAdminId: String(admin.id) },
                  { onSuccess: () => toast({ title: `Assignée à ${admin.name}` }) }
                )
              }
            >
              {admin.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Offers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Offres personnalisées ({offers.length})</Label>
          <Button size="sm" variant="outline" onClick={() => { setEditingOffer(null); setOfferFormOpen(true); }}>
            <Plus className="mr-1 h-3 w-3" /> Nouvelle offre
          </Button>
        </div>
        {offers.length > 0 ? (
          <div className="space-y-2">
            {offers.map((offer) => (
              <CustomOfferCard
                key={offer.id}
                offer={offer}
                onEdit={(o) => { setEditingOffer(o); setOfferFormOpen(true); }}
                onSend={(id) =>
                  sendOffer(id, {
                    onSuccess: () => toast({ title: 'Offre envoyée au client' }),
                    onError: () => toast({ title: 'Erreur', variant: 'destructive' }),
                  })
                }
                onDelete={(id) =>
                  deleteOffer(id, {
                    onSuccess: () => toast({ title: 'Offre supprimée' }),
                  })
                }
                isSending={isSendingOffer}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune offre créée pour cette demande.</p>
        )}

        <CustomOfferForm
          open={offerFormOpen}
          onOpenChange={setOfferFormOpen}
          initialData={editingOffer}
          isSubmitting={isCreatingOffer}
          onSubmit={(payload) => {
            createOffer(
              { ...payload, quoteRequestId: request.id },
              {
                onSuccess: () => {
                  setOfferFormOpen(false);
                  toast({ title: 'Offre enregistrée' });
                },
              }
            );
          }}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="note">Ajouter une note</Label>
        <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
        <Button
          size="sm"
          disabled={isAddingNote || note.trim().length < 3}
          onClick={() =>
            addNote(
              { quoteRequestId: request.id, note },
              {
                onSuccess: () => {
                  setNote('');
                  toast({ title: 'Note ajoutée' });
                },
              }
            )
          }
        >
          {isAddingNote ? 'Ajout...' : 'Enregistrer la note'}
        </Button>
      </div>

      {/* Call scheduling */}
      <div className="space-y-2">
        <Label htmlFor="callAt">Planifier un call</Label>
        {request.call_scheduled_at && (
          <p className="text-xs text-muted-foreground">
            Call planifié: {formatDateTime(request.call_scheduled_at)}
          </p>
        )}
        <Input
          id="callAt"
          type="datetime-local"
          value={callDateTime}
          onChange={(e) => setCallDateTime(e.target.value)}
        />
        <Button
          size="sm"
          disabled={isSchedulingCall || callDateTime.length === 0}
          onClick={() =>
            scheduleCall(
              { quoteRequestId: request.id, callScheduledAt: new Date(callDateTime).toISOString() },
              {
                onSuccess: () => {
                  setCallDateTime('');
                  toast({ title: 'Call planifié' });
                },
              }
            )
          }
        >
          {isSchedulingCall ? 'Planification...' : 'Confirmer le call'}
        </Button>
      </div>

      {/* Outcome */}
      {request.status !== 'closed' && (
        <div className="space-y-2">
          <Label htmlFor="outcomeNote">Issue commerciale</Label>
          <Textarea
            id="outcomeNote"
            rows={2}
            value={outcomeNote}
            onChange={(e) => setOutcomeNote(e.target.value)}
            placeholder="Commentaire optionnel"
          />
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'won' as const, label: 'Gagnée' },
              { value: 'lost' as const, label: 'Perdue' },
            ].map((item) => (
              <Button
                key={item.value}
                size="sm"
                variant="outline"
                disabled={isSettingOutcome}
                onClick={() =>
                  setOutcome(
                    {
                      quoteRequestId: request.id,
                      outcome: item.value,
                      outcomeNote: outcomeNote || undefined,
                    },
                    {
                      onSuccess: () => toast({ title: `Issue: ${item.label}` }),
                    }
                  )
                }
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
