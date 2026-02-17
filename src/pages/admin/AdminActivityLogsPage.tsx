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
  Globe,
  Monitor,
  MousePointer,
  Shield,
  Users,
  Cpu,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  type ActorType,
  type LogSource,
} from '@/hooks/useAdmin';
import { cn } from '@/lib/utils';

// ─── Labels et constantes ────────────────────────────────

const actionLabels: Record<string, string> = {
  'create': 'Creation',
  'update': 'Modification',
  'delete': 'Suppression',
  'view': 'Consultation',
  'login': 'Connexion',
  'logout': 'Deconnexion',
  'update_role': 'Role modifie',
  'toggle_active': 'Statut modifie',
  'refund': 'Remboursement',
  'extend': 'Prolongation',
  'change_plan': 'Plan modifie',
  'cancel': 'Annulation',
  'duplicate': 'Duplication',
  'update_password': 'Mot de passe modifie',
  'update_avatar': 'Avatar modifie',
  'page_view': 'Page consultee',
  'click': 'Clic',
  'modal_open': 'Ouverture modale',
  'modal_close': 'Fermeture modale',
  'filter_applied': 'Filtre applique',
  'tab_change': 'Changement onglet',
  'api_read': 'Lecture API',
  'api_create': 'Creation API',
  'api_update': 'Modification API',
  'api_delete': 'Suppression API',
  'api_request': 'Requete API',
  'api_call': 'Appel API',
};

const modelTypeLabels: Record<string, string> = {
  'App\\Models\\User': 'Utilisateur',
  'App\\Models\\Event': 'Evenement',
  'App\\Models\\EventTemplate': 'Template',
  'App\\Models\\Subscription': 'Abonnement',
  'App\\Models\\Payment': 'Paiement',
  'App\\Models\\Guest': 'Invite',
  'App\\Models\\Task': 'Tache',
  'App\\Models\\BudgetItem': 'Budget',
  'App\\Models\\Photo': 'Photo',
  'App\\Models\\Collaborator': 'Collaborateur',
};

const actorTypeLabels: Record<string, string> = {
  admin: 'Admin',
  user: 'Utilisateur',
  system: 'Systeme',
  guest: 'Invite',
};

const sourceLabels: Record<string, string> = {
  api: 'API',
  navigation: 'Navigation',
  ui_interaction: 'Interaction UI',
  system: 'Systeme',
};

const actorTypeIcons: Record<string, typeof Shield> = {
  admin: Shield,
  user: Users,
  system: Cpu,
  guest: Globe,
};

const sourceIcons: Record<string, typeof Globe> = {
  api: Globe,
  navigation: Monitor,
  ui_interaction: MousePointer,
  system: Cpu,
};

type TabKey = 'all' | 'admin' | 'user' | 'navigation' | 'ui' | 'system';

interface TabConfig {
  key: TabKey;
  label: string;
  actorType?: ActorType;
  source?: LogSource;
  icon: typeof Activity;
}

const tabs: TabConfig[] = [
  { key: 'all', label: 'Tous', icon: Activity },
  { key: 'admin', label: 'Admin', actorType: 'admin', icon: Shield },
  { key: 'user', label: 'Utilisateurs', actorType: 'user', icon: Users },
  { key: 'navigation', label: 'Navigation', source: 'navigation', icon: Monitor },
  { key: 'ui', label: 'UI', source: 'ui_interaction', icon: MousePointer },
  { key: 'system', label: 'Systeme', source: 'system', icon: Cpu },
];

// ─── Helpers ─────────────────────────────────────────────

function getActionBadgeVariant(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (action.includes('delete') || action === 'cancel') return 'destructive';
  if (action.includes('create') || action === 'login') return 'default';
  if (action.includes('update') || action.includes('change') || action === 'extend') return 'secondary';
  return 'outline';
}

function getActorBadgeVariant(actorType: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (actorType === 'admin') return 'default';
  if (actorType === 'user') return 'secondary';
  if (actorType === 'system') return 'outline';
  return 'outline';
}

// ─── Composant principal ─────────────────────────────────

export function AdminActivityLogsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [filters, setFilters] = useState<ActivityLogFilters>({
    page: 1,
    per_page: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Appliquer les filtres de l'onglet actif
  const currentTab = tabs.find((t) => t.key === activeTab) || tabs[0];
  const effectiveFilters: ActivityLogFilters = {
    ...filters,
    actor_type: currentTab.actorType || filters.actor_type,
    source: currentTab.source || filters.source,
  };

  const { data: logsData, isLoading: isLoadingLogs, refetch } = useAdminActivityLogs(effectiveFilters);
  const { data: stats, isLoading: isLoadingStats } = useAdminActivityStats(
    currentTab.actorType,
    currentTab.source
  );

  const logs = logsData?.data || [];

  // ─── Handlers ────────────────────────────────────────

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabKey);
    setFilters((prev) => ({ ...prev, page: 1, actor_type: undefined, source: undefined }));
    setExpandedRows(new Set());
  };

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

  // ─── Rendu ───────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'activite"
        description="Historique complet des actions - administrateurs, utilisateurs et systeme"
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
            <CardTitle className="text-sm font-medium">Aujourd&apos;hui</CardTitle>
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

      {/* Tabs + Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.key} value={tab.key} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Shared content for all tabs */}
        {tabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="space-y-4">
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

                  {/* Model Type Filter (hidden for navigation/ui tabs) */}
                  {tab.key !== 'navigation' && tab.key !== 'ui' && (
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
                  )}

                  {/* Date From */}
                  <DatePicker
                    value={filters.date_from ? parseISO(filters.date_from) : undefined}
                    onChange={handleDateFromChange}
                    placeholder="Date debut"
                    disableFuture={true}
                  />

                  {/* Date To */}
                  <DatePicker
                    value={filters.date_to ? parseISO(filters.date_to) : undefined}
                    onChange={handleDateToChange}
                    placeholder="Date fin"
                    disableFuture={true}
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
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Source</TableHead>
                          {tab.key !== 'navigation' && tab.key !== 'ui' && (
                            <TableHead>Ressource</TableHead>
                          )}
                          {(tab.key === 'navigation' || tab.key === 'ui') && (
                            <TableHead>Page</TableHead>
                          )}
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => {
                          const ActorIcon = actorTypeIcons[log.actor_type] || UserIcon;
                          const SourceIcon = sourceIcons[log.source] || Globe;
                          return (
                            <Collapsible key={log.id} asChild open={expandedRows.has(log.id)}>
                              <>
                                <TableRow
                                  className="cursor-pointer"
                                  onClick={() => toggleRowExpanded(log.id)}
                                >
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
                                  <TableCell className="whitespace-nowrap text-sm">
                                    {format(parseISO(log.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <ActorIcon className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">
                                        {log.user?.name || log.admin?.name || 'Inconnu'}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={getActorBadgeVariant(log.actor_type)}>
                                      {actorTypeLabels[log.actor_type] || log.actor_type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={getActionBadgeVariant(log.action)}>
                                      {actionLabels[log.action] || log.action}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <SourceIcon className="h-3.5 w-3.5" />
                                      <span>{sourceLabels[log.source] || log.source}</span>
                                    </div>
                                  </TableCell>
                                  {tab.key !== 'navigation' && tab.key !== 'ui' && (
                                    <TableCell>
                                      {log.model_type && (
                                        <div className="flex flex-col gap-1">
                                          {log.resource_name && (
                                            <span
                                              className="text-sm font-medium truncate max-w-[150px]"
                                              title={log.resource_name}
                                            >
                                              {log.resource_name}
                                            </span>
                                          )}
                                          <Badge variant="outline">
                                            {modelTypeLabels[log.model_type] ||
                                              log.model_type.split('\\').pop()}
                                          </Badge>
                                        </div>
                                      )}
                                    </TableCell>
                                  )}
                                  {(tab.key === 'navigation' || tab.key === 'ui') && (
                                    <TableCell>
                                      {log.page_url && (
                                        <span className="text-sm font-mono text-muted-foreground">
                                          {log.page_url}
                                        </span>
                                      )}
                                    </TableCell>
                                  )}
                                  <TableCell className="max-w-[250px] truncate text-sm">
                                    {log.description}
                                  </TableCell>
                                </TableRow>
                                <CollapsibleContent asChild>
                                  <TableRow className="bg-muted/50">
                                    <TableCell colSpan={8}>
                                      <div className="p-4 space-y-4">
                                        {/* Diff ancien / nouveau */}
                                        <div className="grid grid-cols-2 gap-4">
                                          {log.old_values &&
                                            Object.keys(log.old_values).length > 0 && (
                                              <div>
                                                <h4 className="font-medium mb-2 text-sm">
                                                  Anciennes valeurs
                                                </h4>
                                                <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                                                  {JSON.stringify(log.old_values, null, 2)}
                                                </pre>
                                              </div>
                                            )}
                                          {log.new_values &&
                                            Object.keys(log.new_values).length > 0 && (
                                              <div>
                                                <h4 className="font-medium mb-2 text-sm">
                                                  Nouvelles valeurs
                                                </h4>
                                                <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                                                  {JSON.stringify(log.new_values, null, 2)}
                                                </pre>
                                              </div>
                                            )}
                                        </div>
                                        {/* Metadata */}
                                        {log.metadata &&
                                          Object.keys(log.metadata).length > 0 && (
                                            <div>
                                              <h4 className="font-medium mb-2 text-sm">Metadata</h4>
                                              <pre className="text-xs bg-background p-2 rounded overflow-auto max-h-40">
                                                {JSON.stringify(log.metadata, null, 2)}
                                              </pre>
                                            </div>
                                          )}
                                        {/* Details */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                                          <div>
                                            <span className="font-medium">IP :</span> {log.ip_address}
                                          </div>
                                          {log.session_id && (
                                            <div>
                                              <span className="font-medium">Session :</span>{' '}
                                              <span className="font-mono">{log.session_id.slice(0, 12)}...</span>
                                            </div>
                                          )}
                                          {log.page_url && (
                                            <div>
                                              <span className="font-medium">Page :</span> {log.page_url}
                                            </div>
                                          )}
                                          {log.s3_key && (
                                            <div>
                                              <span className="font-medium">S3 :</span>{' '}
                                              <span className="font-mono">{log.s3_key.slice(-20)}</span>
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
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Pagination */}
                {logsData && (logsData.total > 0 || logsData.last_page > 1) && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <PerPageSelector
                      value={filters.per_page || 20}
                      onChange={(value) =>
                        setFilters((prev) => ({ ...prev, per_page: value, page: 1 }))
                      }
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
