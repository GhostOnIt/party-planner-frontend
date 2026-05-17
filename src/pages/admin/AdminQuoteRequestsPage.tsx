import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  useAssignQuoteRequest,
  useAdminQuoteRequests,
  useAdminQuoteStages,
  useExportQuoteRequests,
  type QuoteRequest,
  type AdminQuoteRequestsParams,
} from '@/hooks/useQuoteRequests';
import { QuoteRequestDetailPanel } from '@/components/features/quotes/QuoteRequestDetailPanel';
import { Download } from 'lucide-react';

export function AdminQuoteRequestsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(globalThis.innerWidth < 1024);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [adminFilter, setAdminFilter] = useState<string>('all');
  const [bulkAdminId, setBulkAdminId] = useState<string>('none');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data: stages = [] } = useAdminQuoteStages();

  const params = useMemo((): AdminQuoteRequestsParams => {
    const p: AdminQuoteRequestsParams = { per_page: perPage, page };
    if (search) p.search = search;
    if (stageFilter !== 'all') p.stage_id = stageFilter;
    if (statusFilter !== 'all') p.status = statusFilter;
    if (outcomeFilter !== 'all') p.outcome = outcomeFilter;
    if (adminFilter !== 'all') p.assigned_admin_id = adminFilter;
    return p;
  }, [search, stageFilter, statusFilter, outcomeFilter, adminFilter, page]);

  const { data } = useAdminQuoteRequests(params);
  const { mutate: assignQuoteRequest } = useAssignQuoteRequest();
  const { mutate: exportRequests, isPending: isExporting } = useExportQuoteRequests();
  const { data: adminUsersData } = useAdminUsers({ per_page: 100, role: 'admin' });
  const adminUsers = adminUsersData?.data ?? [];

  const paginatedData = data?.data;
  const requests: QuoteRequest[] = paginatedData?.data ?? [];
  const totalPages = paginatedData?.last_page ?? 1;

  const selectedIndex = useMemo(
    () => requests.findIndex((r) => r.id === selectedId),
    [requests, selectedId]
  );
  const selectedRequest = useMemo(
    () => requests.find((r) => r.id === selectedId) ?? null,
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
    const target = requests[newIndex];
    if (target) setSelectedId(target.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes Business"
        description="Liste des demandes et traitement rapide"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher (code, société, email)"
              className="w-[260px]"
            />
            <Select value={stageFilter} onValueChange={(v) => { setStageFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Étape" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les étapes</SelectItem>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="open">Ouvertes</SelectItem>
                <SelectItem value="closed">Clôturées</SelectItem>
              </SelectContent>
            </Select>
            <Select value={outcomeFilter} onValueChange={(v) => { setOutcomeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Issue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="won">Gagnées</SelectItem>
                <SelectItem value="lost">Perdues</SelectItem>
              </SelectContent>
            </Select>
            <Select value={adminFilter} onValueChange={(v) => { setAdminFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Admin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les admins</SelectItem>
                {adminUsers.map((admin) => (
                  <SelectItem key={admin.id} value={String(admin.id)}>{admin.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={() => exportRequests(params)}
            >
              <Download className="mr-1 h-4 w-4" />
              {isExporting ? 'Export...' : 'Exporter'}
            </Button>
          </div>
        }
      />

      {/* Bulk assign */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2">
          <span className="text-sm">{selectedIds.length} sélectionnée(s)</span>
          <Select value={bulkAdminId} onValueChange={setBulkAdminId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Assigner à..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Retirer assignation</SelectItem>
              {adminUsers.map((admin) => (
                <SelectItem key={admin.id} value={String(admin.id)}>{admin.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={applyBulkAssign}>
            Appliquer
          </Button>
        </div>
      )}

      {/* Request cards */}
      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Aucune demande trouvée.
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
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
                    <button type="button" onClick={() => openRequest(request.id)} className="text-left">
                      <p className="font-semibold">{request.company_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.contact_name} - {request.contact_email}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm">{request.business_needs}</p>
                      {request.outcome_note && (
                        <p className="mt-1 text-xs italic text-muted-foreground line-clamp-1">
                          Issue: {request.outcome_note}
                        </p>
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex flex-col items-end gap-2 text-right"
                    onClick={() => openRequest(request.id)}
                  >
                    <Badge variant="outline">{request.tracking_code}</Badge>
                    <Badge>{request.current_stage?.name ?? 'Sans étape'}</Badge>
                    <Badge variant={getPriority(request) === 'haute' ? 'destructive' : 'secondary'}>
                      Priorité {getPriority(request)}
                    </Badge>
                    {request.offers_count != null && request.offers_count > 0 && (
                      <Badge variant="outline">{request.offers_count} offre(s)</Badge>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Suivant
          </Button>
        </div>
      )}

      {/* Detail Sheet (desktop) */}
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
                disabled={selectedIndex < 0 || selectedIndex >= requests.length - 1}
              >
                Suivante
              </Button>
            </div>
          </SheetHeader>
          <div className="mt-4">
            {selectedRequest ? (
              <QuoteRequestDetailPanel
                request={selectedRequest}
                stages={stages}
                adminUsers={adminUsers}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Aucune demande sélectionnée.</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
