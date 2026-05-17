import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminQuoteRequests, type QuoteRequest } from '@/hooks/useQuoteRequests';
import { BriefcaseBusiness, ArrowRight } from 'lucide-react';

export function QuoteRequestsWidget() {
  const { data } = useAdminQuoteRequests({ per_page: 100, status: 'open' });
  const requests: QuoteRequest[] = data?.data?.data ?? [];

  const stats = useMemo(() => {
    const total = requests.length;
    const unassigned = requests.filter((r) => !r.assigned_admin_id).length;
    const urgent = requests.filter((r) => {
      const age = (Date.now() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return age > 3 && !r.call_scheduled_at;
    }).length;
    return { total, unassigned, urgent };
  }, [requests]);

  const recentRequests = requests.slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <BriefcaseBusiness className="h-4 w-4" />
          Demandes Business
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/quote-requests">
            Voir tout <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Ouvertes</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-2xl font-bold">{stats.unassigned}</p>
            <p className="text-xs text-muted-foreground">Non assignées</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <p className="text-2xl font-bold text-destructive">{stats.urgent}</p>
            <p className="text-xs text-muted-foreground">Urgentes</p>
          </div>
        </div>

        {recentRequests.length > 0 && (
          <div className="space-y-2">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                to={`/admin/quote-requests`}
                className="flex items-center justify-between rounded-lg border p-2 text-sm transition hover:bg-muted/50"
              >
                <div className="truncate">
                  <p className="font-medium truncate">{request.company_name}</p>
                  <p className="text-xs text-muted-foreground">{request.tracking_code}</p>
                </div>
                <Badge variant="outline" className="shrink-0 ml-2">
                  {request.current_stage?.name ?? 'N/A'}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {requests.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-2">
            Aucune demande ouverte.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
