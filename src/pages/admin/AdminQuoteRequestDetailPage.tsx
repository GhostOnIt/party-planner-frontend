import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export function AdminQuoteRequestDetailPage() {
  const navigate = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();
  const { toast } = useToast();
  const [note, setNote] = useState('');
  const [callDateTime, setCallDateTime] = useState('');
  const [outcomeNote, setOutcomeNote] = useState('');

  const { data: stages = [] } = useAdminQuoteStages();
  const { data } = useAdminQuoteRequests();
  const { mutate: updateStage } = useUpdateQuoteStage();
  const { mutate: addNote, isPending: isAddingNote } = useAddQuoteNote();
  const { mutate: scheduleCall, isPending: isSchedulingCall } = useScheduleQuoteCall();
  const { mutate: setOutcome, isPending: isSettingOutcome } = useUpdateQuoteOutcome();
  const { mutate: assignQuoteRequest } = useAssignQuoteRequest();
  const { data: adminUsersData } = useAdminUsers({ per_page: 100, role: 'admin' });
  const adminUsers = adminUsersData?.data ?? [];

  const requests = data?.data?.data ?? [];
  const selectedRequest = useMemo(
    () => requests.find((request: QuoteRequest) => request.id === requestId) ?? null,
    [requests, requestId]
  );

  if (!selectedRequest) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Détail demande"
          description="Demande introuvable"
          actions={
            <Button variant="outline" onClick={() => navigate('/admin/quote-requests')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Demande ${selectedRequest.tracking_code}`}
        description="Traitement mobile de la demande Business"
        actions={
          <Button variant="outline" onClick={() => navigate('/admin/quote-requests')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{selectedRequest.company_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{selectedRequest.contact_name}</p>
          <p className="text-sm text-muted-foreground">{selectedRequest.contact_email}</p>
          <p className="text-sm text-muted-foreground">{selectedRequest.contact_phone}</p>
          <p className="text-sm">{selectedRequest.business_needs}</p>

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
                        outcome: item.value as 'won' | 'lost',
                        outcomeNote: outcomeNote || undefined,
                      },
                      { onSuccess: () => toast({ title: `Issue: ${item.label}` }) }
                    )
                  }
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

