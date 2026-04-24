import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAdminUsers } from '@/hooks/useAdmin';
import {
  useAddQuoteNote,
  useAssignQuoteRequest,
  useAdminQuoteRequests,
  useAdminQuoteStages,
  useScheduleQuoteCall,
  useUpdateQuoteOutcome,
  useUpdateQuoteStage,
  type QuoteRequest,
} from '@/hooks/useQuoteRequests';

export function AdminQuoteRequestsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(globalThis.innerWidth < 1024);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [note, setNote] = useState('');
  const [callDateTime, setCallDateTime] = useState('');
  const [outcomeNote, setOutcomeNote] = useState('');

  const { data: stages = [] } = useAdminQuoteStages();
  const { data } = useAdminQuoteRequests({ search: search || undefined });
  const { mutate: updateStage } = useUpdateQuoteStage();
  const { mutate: addNote, isPending: isAddingNote } = useAddQuoteNote();
  const { mutate: scheduleCall, isPending: isSchedulingCall } = useScheduleQuoteCall();
  const { mutate: setOutcome, isPending: isSettingOutcome } = useUpdateQuoteOutcome();
  const { mutate: assignQuoteRequest } = useAssignQuoteRequest();
  const { data: adminUsersData } = useAdminUsers({ per_page: 100, role: 'admin' });
  const adminUsers = adminUsersData?.data ?? [];

  const requests = data?.data?.data ?? [];
  const selectedRequest = useMemo(
    () => requests.find((request: QuoteRequest) => request.id === selectedId) ?? null,
    [requests, selectedId]
  );

  useEffect(() => {
    const onResize = () => setIsMobile(globalThis.innerWidth < 1024);
    globalThis.addEventListener('resize', onResize);
    return () => globalThis.removeEventListener('resize', onResize);
  }, []);

  const openRequest = (requestId: string) => {
    if (isMobile) {
      navigate(`/admin/quote-requests/${requestId}`);
      return;
    }
    setSelectedId(requestId);
    setIsDetailOpen(true);
  };

  const renderDetailContent = (request: QuoteRequest) => (
    <div className="space-y-4">
      <div>
        <p className="font-semibold">{request.company_name}</p>
        <p className="text-sm text-muted-foreground">{request.contact_name}</p>
        <p className="text-sm text-muted-foreground">{request.contact_email}</p>
        <p className="text-sm text-muted-foreground">{request.contact_phone}</p>
      </div>

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

      <div className="space-y-2">
        <Label>Changer d’étape</Label>
        <div className="flex flex-wrap gap-2">
          {stages.map((stage) => (
            <Button
              key={stage.id}
              size="sm"
              variant={request.current_stage_id === stage.id ? 'default' : 'outline'}
              onClick={() =>
                updateStage(
                  { quoteRequestId: request.id, stageId: stage.id },
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
                    quoteRequestId: request.id,
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
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes Business"
        description="Liste des demandes et traitement rapide"
        actions={
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (code, société, email)"
            className="w-[320px]"
          />
        }
      />

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Aucune demande trouvée.
            </CardContent>
          </Card>
        ) : (
          requests.map((request: QuoteRequest) => (
            <Card key={request.id} className="cursor-pointer transition hover:border-primary/40" onClick={() => openRequest(request.id)}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{request.company_name}</p>
                    <p className="text-sm text-muted-foreground">{request.contact_name} - {request.contact_email}</p>
                    <p className="mt-2 line-clamp-2 text-sm">{request.business_needs}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">{request.tracking_code}</Badge>
                    <Badge>{request.current_stage?.name ?? 'Sans étape'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Sheet open={isDetailOpen && !isMobile} onOpenChange={setIsDetailOpen}>
        <SheetContent side="right" className="w-[560px] overflow-y-auto sm:max-w-none">
          <SheetHeader>
            <SheetTitle>Détail demande</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {selectedRequest ? renderDetailContent(selectedRequest) : <p className="text-sm text-muted-foreground">Aucune demande sélectionnée.</p>}
          </div>
        </SheetContent>
      </Sheet>

      {!isMobile && selectedRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Astuce: clique une ligne pour ouvrir le panneau de détail à droite.
            </CardTitle>
          </CardHeader>
          <CardContent />
        </Card>
      )}
    </div>
  );
}

