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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bulkAdminId, setBulkAdminId] = useState<string>('none');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

  const requests = useMemo(() => data?.data?.data ?? [], [data]);
  const filteredRequests = useMemo(() => {
    return requests.filter((request: QuoteRequest) => {
      const stageOk = stageFilter === 'all' || request.current_stage_id === stageFilter;
      const statusOk = statusFilter === 'all' || request.status === statusFilter;
      return stageOk && statusOk;
    });
  }, [requests, stageFilter, statusFilter]);

  const selectedIndex = useMemo(
    () => filteredRequests.findIndex((request: QuoteRequest) => request.id === selectedId),
    [filteredRequests, selectedId]
  );
  const selectedRequest = useMemo(
    () => filteredRequests.find((request: QuoteRequest) => request.id === selectedId) ?? null,
    [filteredRequests, selectedId]
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

  const toggleSelection = (requestId: string) => {
    setSelectedIds((prev) =>
      prev.includes(requestId) ? prev.filter((id) => id !== requestId) : [...prev, requestId]
    );
  };

  const applyBulkAssign = () => {
    if (selectedIds.length === 0) {
      toast({ title: 'Sélection vide', description: 'Choisis au moins une demande.' });
      return;
    }

    const assignedAdminId = bulkAdminId === 'none' ? null : bulkAdminId;
    selectedIds.forEach((requestId) => {
      assignQuoteRequest({ quoteRequestId: requestId, assignedAdminId });
    });
    toast({ title: 'Assignation groupée lancée', description: `${selectedIds.length} demande(s) mises à jour.` });
    setSelectedIds([]);
  };

  const getPriority = (request: QuoteRequest): 'haute' | 'moyenne' | 'basse' => {
    const createdAt = request.created_at ? new Date(request.created_at).getTime() : Date.now();
    const ageInDays = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
    if (request.call_scheduled_at) return 'basse';
    if (ageInDays > 7) return 'haute';
    if (ageInDays > 3) return 'moyenne';
    return 'basse';
  };

  const goToAdjacentRequest = (direction: 'prev' | 'next') => {
    if (selectedIndex < 0) return;
    const newIndex = direction === 'next' ? selectedIndex + 1 : selectedIndex - 1;
    const target = filteredRequests[newIndex];
    if (target) {
      setSelectedId(target.id);
      setNote('');
      setOutcomeNote('');
      setCallDateTime('');
    }
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentStageIndex = (request: QuoteRequest) => {
    return stages.findIndex((stage) => stage.id === request.current_stage_id);
  };

  const getProgressInfo = (request: QuoteRequest) => {
    const currentIndex = getCurrentStageIndex(request);
    const total = stages.length > 0 ? stages.length : 1;
    const normalizedIndex = currentIndex < 0 ? 0 : currentIndex;
    const percentage = Math.round(((normalizedIndex + 1) / total) * 100);
    const currentStageName = currentIndex >= 0 ? stages[normalizedIndex]?.name ?? 'N/A' : 'En attente de traitement';
    const nextStageName =
      normalizedIndex < stages.length - 1 ? stages[normalizedIndex + 1]?.name ?? null : null;

    return { currentStageName, nextStageName, percentage };
  };

  const moveToNextStage = (request: QuoteRequest) => {
    const currentIndex = getCurrentStageIndex(request);
    if (currentIndex < 0 || currentIndex >= stages.length - 1) {
      toast({ title: 'Dernière étape atteinte' });
      return;
    }

    const nextStage = stages[currentIndex + 1];
    updateStage(
      { quoteRequestId: request.id, stageId: nextStage.id },
      {
        onSuccess: () =>
          toast({
            title: `Étape mise à jour`,
            description: `Passage vers: ${nextStage.name}`,
          }),
      }
    );
  };

  const renderDetailContent = (request: QuoteRequest) => (
    <div className="space-y-4">
      {(() => {
        const progress = getProgressInfo(request);
        return (
          <div className="rounded-lg border bg-primary/5 p-3">
            <p className="text-sm font-semibold">État actuel: {progress.currentStageName}</p>
            <p className="text-sm text-muted-foreground">
              Prochain état: {progress.nextStageName ?? 'Aucun (demande finalisée)'}
            </p>
            <p className="mt-1 text-sm font-medium">Avancement: {progress.percentage}%</p>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        );
      })()}

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
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <Label>Progression de la demande</Label>
          <Button
            size="sm"
            onClick={() => moveToNextStage(request)}
            disabled={getProgressInfo(request).nextStageName === null}
          >
            Faire avancer
          </Button>
        </div>
        <div className="space-y-2">
          {stages.map((stage, index) => {
            const currentIndex = getCurrentStageIndex(request);
            const isReached = currentIndex >= 0 && index <= currentIndex;
            const isCurrent = stage.id === request.current_stage_id;
            return (
              <div key={stage.id} className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    isCurrent ? 'bg-primary' : isReached ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                  }`}
                />
                <span className={isCurrent ? 'font-semibold text-primary' : 'text-sm text-muted-foreground'}>
                  {stage.name}
                </span>
              </div>
            );
          })}
        </div>
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
        <Label>Timeline de suivi</Label>
        <div className="rounded-lg border p-3">
          {request.activities && request.activities.length > 0 ? (
            <div className="space-y-3">
              {[...request.activities]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 8)
                .map((activity) => (
                  <div key={activity.id} className="flex gap-2">
                    <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{activity.message ?? activity.activity_type}</p>
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
                    outcome: item.value as 'won' | 'lost',
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
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (code, société, email)"
              className="w-[260px]"
            />
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Étape" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les étapes</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="open">Ouvertes</SelectItem>
                <SelectItem value="closed">Clôturées</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bulkAdminId} onValueChange={setBulkAdminId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Assignation groupée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Retirer assignation</SelectItem>
                {adminUsers.map((admin) => (
                  <SelectItem key={admin.id} value={String(admin.id)}>
                    {admin.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={applyBulkAssign}>
              Assigner la sélection ({selectedIds.length})
            </Button>
          </div>
        }
      />

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Aucune demande trouvée.
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request: QuoteRequest) => (
            <Card key={request.id} className="cursor-pointer transition hover:border-primary/40">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-1 items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(request.id)}
                      onChange={() => toggleSelection(request.id)}
                      className="mt-1 h-4 w-4"
                      onClick={(event) => event.stopPropagation()}
                    />
                    <button
                      type="button"
                      onClick={() => openRequest(request.id)}
                      className="text-left"
                    >
                      <p className="font-semibold">{request.company_name}</p>
                      <p className="text-sm text-muted-foreground">{request.contact_name} - {request.contact_email}</p>
                      <p className="mt-2 line-clamp-2 text-sm">{request.business_needs}</p>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex flex-col items-end gap-2 text-right"
                    onClick={() => openRequest(request.id)}
                  >
                    <Badge variant="outline">{request.tracking_code}</Badge>
                    <Badge>{request.current_stage?.name ?? 'Sans étape'}</Badge>
                    <Badge
                      variant={getPriority(request) === 'haute' ? 'destructive' : 'secondary'}
                    >
                      Priorité {getPriority(request)}
                    </Badge>
                  </button>
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
            <div className="mt-2 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToAdjacentRequest('prev')}
                disabled={selectedIndex <= 0}
              >
                Précédente
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToAdjacentRequest('next')}
                disabled={selectedIndex < 0 || selectedIndex >= filteredRequests.length - 1}
              >
                Suivante
              </Button>
            </div>
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
              Astuce: utilise “Précédente/Suivante” dans le panneau droit pour traiter rapidement les demandes.
            </CardTitle>
          </CardHeader>
          <CardContent />
        </Card>
      )}
    </div>
  );
}

