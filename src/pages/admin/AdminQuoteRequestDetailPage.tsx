import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAdminUsers } from '@/hooks/useAdmin';
import { useAdminQuoteRequest, useAdminQuoteStages } from '@/hooks/useQuoteRequests';
import { QuoteRequestDetailPanel } from '@/components/features/quotes/QuoteRequestDetailPanel';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function AdminQuoteRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const { data: stages = [] } = useAdminQuoteStages();
  const { data: request, isLoading, isError } = useAdminQuoteRequest(requestId);
  const { data: adminUsersData } = useAdminUsers({ per_page: 100, role: 'admin' });
  const adminUsers = adminUsersData?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/quote-requests')}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement de la demande…
        </div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="space-y-4 p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/quote-requests')}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
        <p className="text-sm text-muted-foreground">Demande introuvable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/quote-requests')}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour aux demandes
      </Button>

      <h1 className="text-xl font-bold">{request.company_name}</h1>

      <QuoteRequestDetailPanel
        request={request}
        stages={stages}
        adminUsers={adminUsers}
      />
    </div>
  );
}
