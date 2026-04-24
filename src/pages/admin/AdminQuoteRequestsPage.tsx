import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminUsers } from '@/hooks/useAdmin';
import {
  useAddQuoteNote,
  useAssignQuoteRequest,
  useAdminQuoteRequests,
  useAdminQuoteStages,
  useScheduleQuoteCall,
  useCreateQuoteStage,
  useReorderQuoteStages,
  useUpdateQuoteOutcome,
  useUpdateQuoteStage,
  type QuoteRequest,
} from '@/hooks/useQuoteRequests';

export function AdminQuoteRequestsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [callDateTime, setCallDateTime] = useState('');
  const [outcomeNote, setOutcomeNote] = useState('');
  const [newStageName, setNewStageName] = useState('');

  const { data: stages = [] } = useAdminQuoteStages();
  const { data } = useAdminQuoteRequests({ search: search || undefined });
  const { mutate: updateStage } = useUpdateQuoteStage();
  const { mutate: addNote, isPending: isAddingNote } = useAddQuoteNote();
  const { mutate: scheduleCall, isPending: isSchedulingCall } = useScheduleQuoteCall();
  const { mutate: setOutcome, isPending: isSettingOutcome } = useUpdateQuoteOutcome();
  const { mutate: assignQuoteRequest } = useAssignQuoteRequest();
  const { mutate: createStage } = useCreateQuoteStage();
  const { mutate: reorderStages } = useReorderQuoteStages();
  const { data: adminUsersData } = useAdminUsers({ per_page: 100, role: 'admin' });
  const adminUsers = adminUsersData?.data ?? [];

  const requests = data?.data?.data ?? [];
  const selectedRequest = useMemo(
    () => requests.find((request: QuoteRequest) => request.id === selectedId) ?? null,
    [requests, selectedId]
  );

  const groupedByStage = useMemo(() => {
    const map = new Map<string, QuoteRequest[]>();
    stages.forEach((stage) => map.set(stage.id, []));
    requests.forEach((request: QuoteRequest) => {
      const stageId = request.current_stage_id;
      if (stageId && map.has(stageId)) {
        map.get(stageId)?.push(request);
      }
    });
    return map;
  }, [stages, requests]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes Business"
        description="Pipeline sur devis, modération et planification des calls"
        actions={
          <div className="flex items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (code, société, email)"
              className="w-[320px]"
            />
            <Input
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="Nouvelle colonne"
              className="w-[200px]"
            />
            <Button
              variant="outline"
              onClick={() =>
                createStage(
                  {
                    name: newStageName,
                    slug: newStageName.toLowerCase().trim().split(/\s+/).join('_'),
                    sort_order: stages.length,
                  },
                  {
                    onSuccess: () => {
                      setNewStageName('');
                      toast({ title: 'Colonne ajoutée' });
                    },
                  }
                )
              }
              disabled={newStageName.trim().length < 2}
            >
              Ajouter colonne
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                reorderStages(
                  stages.map((stage, index) => ({ id: stage.id, sort_order: index })),
                  { onSuccess: () => toast({ title: 'Ordre synchronisé' }) }
                )
              }
            >
              Sauver ordre
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-4">
            {stages.map((stage) => (
              <Card key={stage.id} className="w-[320px] shrink-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {stage.name} ({groupedByStage.get(stage.id)?.length ?? 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(groupedByStage.get(stage.id) ?? []).map((request) => (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => setSelectedId(request.id)}
                      className="w-full rounded-lg border p-3 text-left transition hover:border-primary"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{request.company_name}</p>
                        <Badge variant="outline">{request.tracking_code}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{request.contact_name}</p>
                      <p className="mt-2 line-clamp-2 text-sm">{request.business_needs}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Détail demande</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRequest ? (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">{selectedRequest.company_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.contact_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.contact_email}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.contact_phone}</p>
                </div>

                <div className="space-y-2">
                  <Label>Assigner un administrateur</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={selectedRequest.assigned_admin_id === null ? 'default' : 'outline'}
                      onClick={() =>
                        assignQuoteRequest(
                          { quoteRequestId: selectedRequest.id, assignedAdminId: null },
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
                        variant={selectedRequest.assigned_admin_id === String(admin.id) ? 'default' : 'outline'}
                        onClick={() =>
                          assignQuoteRequest(
                            { quoteRequestId: selectedRequest.id, assignedAdminId: String(admin.id) },
                            { onSuccess: () => toast({ title: `Assignée à ${admin.name}` }) }
                          )
                        }
                      >
                        {admin.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Changer d’étape</Label>
                  <div className="flex flex-wrap gap-2">
                    {stages.map((stage) => (
                      <Button
                        key={stage.id}
                        size="sm"
                        variant={selectedRequest.current_stage_id === stage.id ? 'default' : 'outline'}
                        onClick={() =>
                          updateStage(
                            { quoteRequestId: selectedRequest.id, stageId: stage.id },
                            {
                              onSuccess: () => toast({ title: 'Étape mise à jour' }),
                              onError: () =>
                                toast({
                                  title: 'Erreur',
                                  description: 'Impossible de changer l’étape.',
                                  variant: 'destructive',
                                }),
                            }
                          )
                        }
                      >
                        {stage.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Ajouter une note</Label>
                  <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
                  <Button
                    size="sm"
                    disabled={isAddingNote || note.trim().length < 3}
                    onClick={() =>
                      addNote(
                        { quoteRequestId: selectedRequest.id, note },
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

                <div className="space-y-2">
                  <Label htmlFor="callAt">Planifier un call</Label>
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
                        { quoteRequestId: selectedRequest.id, callScheduledAt: new Date(callDateTime).toISOString() },
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
                      { value: 'offer_sent', label: 'Offre envoyée' },
                      { value: 'won', label: 'Gagnée' },
                      { value: 'lost', label: 'Perdue' },
                    ].map((item) => (
                      <Button
                        key={item.value}
                        size="sm"
                        variant="outline"
                        disabled={isSettingOutcome}
                        onClick={() =>
                          setOutcome(
                            {
                              quoteRequestId: selectedRequest.id,
                              outcome: item.value as 'offer_sent' | 'won' | 'lost',
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
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sélectionne une carte pour modérer la demande.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

