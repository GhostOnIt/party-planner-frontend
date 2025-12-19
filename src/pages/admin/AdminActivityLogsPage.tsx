import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Search,
  Activity,
  Calendar,
  User as UserIcon,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { PerPageSelector } from '@/components/ui/per-page-selector';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { PageHeader } from '@/components/layout/page-header';
import { DatePicker } from '@/components/forms/date-picker';
import {
  useAdminActivityLogs,
  useAdminActivityStats,
  type ActivityLogFilters,
} from '@/hooks/useAdmin';
import { cn } from '@/lib/utils';

const actionLabels: Record<string, string> = {
  'user.created': 'Utilisateur cree',
  'user.updated': 'Utilisateur modifie',
  'user.deleted': 'Utilisateur supprime',
  'user.role_changed': 'Role modifie',
  'user.toggled_active': 'Statut modifie',
  'event.created': 'Evenement cree',
  'event.updated': 'Evenement modifie',
  'event.deleted': 'Evenement supprime',
  'template.created': 'Template cree',
  'template.updated': 'Template modifie',
  'template.deleted': 'Template supprime',
  'template.toggled_active': 'Template active/desactive',
  'subscription.extended': 'Abonnement prolonge',
  'subscription.plan_changed': 'Plan modifie',
  'login': 'Connexion admin',
};

const modelTypeLabels: Record<string, string> = {
  'App\\Models\\User': 'Utilisateur',
  'App\\Models\\Event': 'Evenement',
  'App\\Models\\EventTemplate': 'Template',
  'App\\Models\\Subscription': 'Abonnement',
  'App\\Models\\Payment': 'Paiement',
};

function getActionBadgeVariant(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (action.includes('deleted')) return 'destructive';
  if (action.includes('created')) return 'default';
  if (action.includes('updated') || action.includes('changed')) return 'secondary';
  return 'outline';
}

export function AdminActivityLogsPage() {
  const [filters, setFilters] = useState<ActivityLogFilters>({
    page: 1,
    per_page: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const { data: logsData, isLoading: isLoadingLogs, refetch } = useAdminActivityLogs(filters);
  const { data: stats, isLoading: isLoadingStats } = useAdminActivityStats();

  const logs = logsData?.data || [];

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleActionFilter = (action: string) => {
    if (action === 'all') {
      setFilters((prev) => {
        const { action: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    } else {
      setFilters((prev) => ({ ...prev, action, page: 1 }));
    }
  };

  const handleModelTypeFilter = (modelType: string) => {
    if (modelType === 'all') {
      setFilters((prev) => {
        const { model_type: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    } else {
      setFilters((prev) => ({ ...prev, model_type: modelType, page: 1 }));
    }
  };

  const handleDateFromChange = (date: Date | undefined) => {
    if (date) {
      setFilters((prev) => ({ ...prev, date_from: format(date, 'yyyy-MM-dd'), page: 1 }));
    } else {
      setFilters((prev) => {
        const { date_from: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    }
  };

  const handleDateToChange = (date: Date | undefined) => {
    if (date) {
      setFilters((prev) => ({ ...prev, date_to: format(date, 'yyyy-MM-dd'), page: 1 }));
    } else {
      setFilters((prev) => {
        const { date_to: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const toggleRowExpanded = (id: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setFilters({ page: 1, per_page: 20 });
    setSearchInput('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'activite"
        description="Historique des actions administrateur"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.today || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.this_week || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.this_month || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="flex gap-2">
              <Input
                placeholder="Rechercher..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Action Filter */}
            <Select value={filters.action || 'all'} onValueChange={handleActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                {Object.entries(actionLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Model Type Filter */}
            <Select value={filters.model_type || 'all'} onValueChange={handleModelTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type de ressource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les ressources</SelectItem>
                {Object.entries(modelTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date From */}
            <DatePicker
              value={filters.date_from ? parseISO(filters.date_from) : undefined}
              onChange={handleDateFromChange}
              placeholder="Date debut"
            />

            {/* Date To */}
            <DatePicker
              value={filters.date_to ? parseISO(filters.date_to) : undefined}
              onChange={handleDateToChange}
              placeholder="Date fin"
            />
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Reinitialiser les filtres
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
          <CardDescription>
            {logsData?.total || 0} action(s) trouvee(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune activite trouvee
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Ressource</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <Collapsible key={log.id} asChild open={expandedRows.has(log.id)}>
                      <>
                        <TableRow className="cursor-pointer" onClick={() => toggleRowExpanded(log.id)}>
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm">
                                {expandedRows.has(log.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {format(parseISO(log.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4 text-muted-foreground" />
                              <span>{log.admin?.name || 'Inconnu'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(log.action)}>
                              {actionLabels[log.action] || log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {log.model_type && (
                              <div className="flex flex-col gap-1">
                                {log.resource_name && (
                                  <span className="text-sm font-medium truncate max-w-[150px]" title={log.resource_name}>
                                    {log.resource_name}
                                  </span>
                                )}
                                <Badge variant="outline">
                                  {modelTypeLabels[log.model_type] || log.model_type.split('\\').pop()}
                                </Badge> 
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {log.description}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {log.ip_address}
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/50">
                            <TableCell colSpan={7}>
                              <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  {log.old_values && Object.keys(log.old_values).length > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-2 text-sm">Anciennes valeurs</h4>
                                      <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                                        {JSON.stringify(log.old_values, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {log.new_values && Object.keys(log.new_values).length > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-2 text-sm">Nouvelles valeurs</h4>
                                      <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                                        {JSON.stringify(log.new_values, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  User Agent: {log.user_agent}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {logsData && (logsData.total > 0 || logsData.last_page > 1) && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <PerPageSelector
                value={filters.per_page || 20}
                onChange={(value) => setFilters((prev) => ({ ...prev, per_page: value, page: 1 }))}
              />
              {logsData.last_page > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(logsData?.current_page - 1)}
                        className={cn(
                          logsData?.current_page === 1 && 'pointer-events-none opacity-50'
                        )}
                      />
                    </PaginationItem>

                    {Array.from({ length: logsData?.last_page }, (_, i) => i + 1)
                      .filter((page) => {
                        const current = logsData?.current_page;
                        return (
                          page === 1 ||
                          page === logsData?.last_page ||
                          (page >= current - 1 && page <= current + 1)
                        );
                      })
                      .map((page, index, array) => (
                        <PaginationItem key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2">...</span>
                          )}
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={page === logsData?.current_page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(logsData?.current_page + 1)}
                        className={cn(
                          logsData?.current_page === logsData?.last_page &&
                            'pointer-events-none opacity-50'
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
