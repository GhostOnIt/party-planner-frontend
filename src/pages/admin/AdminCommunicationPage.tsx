import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Search,
  MoreHorizontal,
  Plus,
  BarChart3,
  Megaphone,
  HelpCircle,
  Trash2,
  Pencil,
  Copy,
  Eye,
  EyeOff,
  Monitor,
  LogIn,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PerPageSelector } from '@/components/ui/per-page-selector';
import { PageHeader } from '@/components/layout/page-header';
import { useToast } from '@/hooks/use-toast';
import { useSpots, useDeleteSpot, useToggleSpotStatus, useCreateSpot, useUpdateSpot } from '@/hooks/useCommunication';
import { SpotFormDialog } from '@/components/features/admin/spot-form-dialog';
import { PollResultsDialog } from '@/components/features/admin/poll-results-dialog';
import type { CommunicationSpot, SpotFilters, SpotType, SpotStatus, DisplayLocation, CreateSpotFormData } from '@/types/communication';

// Helper to get spot status
function getSpotStatus(spot: CommunicationSpot): SpotStatus {
  if (!spot.isActive) return 'inactive';
  
  const now = new Date();
  if (spot.startDate && new Date(spot.startDate) > now) return 'scheduled';
  if (spot.endDate && new Date(spot.endDate) < now) return 'expired';
  
  return 'active';
}

// Status badge component
function StatusBadge({ status }: { status: SpotStatus }) {
  const styles: Record<SpotStatus, string> = {
    active: 'border-green-200 bg-green-50 text-green-700',
    inactive: 'border-gray-200 bg-gray-50 text-gray-700',
    scheduled: 'border-blue-200 bg-blue-50 text-blue-700',
    expired: 'border-orange-200 bg-orange-50 text-orange-700',
  };

  const labels: Record<SpotStatus, string> = {
    active: 'Actif',
    inactive: 'Inactif',
    scheduled: 'Programmé',
    expired: 'Expiré',
  };

  return (
    <Badge variant="outline" className={styles[status]}>
      {labels[status]}
    </Badge>
  );
}

// Type badge component
function TypeBadge({ type }: { type: SpotType }) {
  if (type === 'banner') {
    return (
      <Badge variant="secondary" className="gap-1">
        <Megaphone className="h-3 w-3" />
        Bannière
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 bg-purple-100 text-purple-700">
      <HelpCircle className="h-3 w-3" />
      Sondage
    </Badge>
  );
}

export function AdminCommunicationPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<SpotFilters>({
    page: 1,
    per_page: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [deleteSpot, setDeleteSpot] = useState<CommunicationSpot | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editSpot, setEditSpot] = useState<CommunicationSpot | null>(null);
  const [resultsSpot, setResultsSpot] = useState<CommunicationSpot | null>(null);

  const { data, isLoading } = useSpots(filters);
  const { mutate: deleteSpotMutation, isPending: isDeleting } = useDeleteSpot();
  const { mutate: toggleStatus } = useToggleSpotStatus();
  const { mutate: createSpot, isPending: isCreating } = useCreateSpot();
  const { mutate: updateSpot, isPending: isUpdating } = useUpdateSpot();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleTypeFilter = (type: string) => {
    if (type === 'all') {
      setFilters((prev) => {
        const { type: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    } else {
      setFilters((prev) => ({ ...prev, type: type as SpotType, page: 1 }));
    }
  };

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters((prev) => {
        const { status: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    } else {
      setFilters((prev) => ({ ...prev, status: status as SpotStatus, page: 1 }));
    }
  };

  const handleLocationFilter = (location: string) => {
    if (location === 'all') {
      setFilters((prev) => {
        const { location: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    } else {
      setFilters((prev) => ({ ...prev, location: location as DisplayLocation, page: 1 }));
    }
  };

  const handleDelete = () => {
    if (!deleteSpot) return;

    deleteSpotMutation(deleteSpot.id, {
      onSuccess: () => {
        toast({
          title: 'Spot supprimé',
          description: 'Le spot a été supprimé avec succès.',
        });
        setDeleteSpot(null);
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer le spot.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleToggleStatus = (spot: CommunicationSpot) => {
    const newStatus = !spot.isActive;
    toggleStatus(
      { id: spot.id, isActive: newStatus },
      {
        onSuccess: () => {
          toast({
            title: newStatus ? 'Spot activé' : 'Spot désactivé',
            description: `Le spot a été ${newStatus ? 'activé' : 'désactivé'}.`,
          });
        },
        onError: () => {
          toast({
            title: 'Erreur',
            description: 'Impossible de modifier le statut.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleDuplicate = (spot: CommunicationSpot) => {
    const duplicateData: CreateSpotFormData = {
      type: spot.type,
      title: spot.title ? `${spot.title} (copie)` : undefined,
      description: spot.description,
      badge: spot.badge,
      badgeType: spot.badgeType,
      primaryButton: spot.primaryButton,
      secondaryButton: spot.secondaryButton,
      pollQuestion: spot.pollQuestion ? `${spot.pollQuestion} (copie)` : undefined,
      pollOptions: spot.pollOptions?.map((opt) => ({ label: opt.label })),
      isActive: false,
      displayLocations: spot.displayLocations,
      priority: spot.priority,
      targetRoles: spot.targetRoles,
      targetLanguages: spot.targetLanguages,
    };

    createSpot(duplicateData, {
      onSuccess: () => {
        toast({
          title: 'Spot dupliqué',
          description: 'Le spot a été dupliqué avec succès.',
        });
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Impossible de dupliquer le spot.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleFormSubmit = (data: CreateSpotFormData) => {
    if (editSpot) {
      updateSpot(
        { id: editSpot.id, data },
        {
          onSuccess: () => {
            toast({
              title: 'Spot modifié',
              description: 'Le spot a été modifié avec succès.',
            });
            setFormOpen(false);
            setEditSpot(null);
          },
          onError: () => {
            toast({
              title: 'Erreur',
              description: 'Impossible de modifier le spot.',
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      createSpot(data, {
        onSuccess: () => {
          toast({
            title: 'Spot créé',
            description: 'Le spot a été créé avec succès.',
          });
          setFormOpen(false);
        },
        onError: () => {
          toast({
            title: 'Erreur',
            description: 'Impossible de créer le spot.',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const openEditForm = (spot: CommunicationSpot) => {
    setEditSpot(spot);
    setFormOpen(true);
  };

  const openCreateForm = () => {
    setEditSpot(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Communication"
          description="Gérez les bannières et sondages de la plateforme"
        />
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau spot
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou question..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select
              value={filters.type || 'all'}
              onValueChange={handleTypeFilter}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="banner">Bannière</SelectItem>
                <SelectItem value="poll">Sondage</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="scheduled">Programmé</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.location || 'all'}
              onValueChange={handleLocationFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Emplacement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="login">Login</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>Rechercher</Button>
          </div>
        </CardContent>
      </Card>

      {/* Spots Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des spots</CardTitle>
          <CardDescription>
            {data?.total || 0} spot(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-16 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="mt-1 h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Aucun spot trouvé</p>
              <Button onClick={openCreateForm} variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Créer un spot
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Aperçu</TableHead>
                    <TableHead>Titre / Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Emplacements</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((spot) => {
                    const status = getSpotStatus(spot);
                    const title = spot.type === 'poll' ? spot.pollQuestion : spot.title;
                    const totalVotes = spot.stats.votes 
                      ? Object.values(spot.stats.votes).reduce((a, b) => a + b, 0)
                      : 0;

                    return (
                      <TableRow key={spot.id}>
                        <TableCell>
                          {/* Mini preview of the spot */}
                          <div className="h-12 w-20 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] p-1.5 flex flex-col justify-center overflow-hidden">
                            {spot.badge && (
                              <span className="text-[6px] text-white/80 bg-white/20 rounded-full px-1 py-0.5 self-start truncate max-w-full">
                                {spot.badge}
                              </span>
                            )}
                            <span className="text-[7px] font-semibold text-white truncate leading-tight mt-0.5">
                              {spot.type === 'poll' ? spot.pollQuestion : spot.title || 'Sans titre'}
                            </span>
                            {spot.description && (
                              <span className="text-[5px] text-white/70 truncate leading-tight">
                                {spot.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium line-clamp-1 max-w-xs">
                            {title || 'Sans titre'}
                          </p>
                          {spot.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                              {spot.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <TypeBadge type={spot.type} />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {spot.displayLocations.includes('dashboard') && (
                              <Badge variant="outline" className="gap-1">
                                <Monitor className="h-3 w-3" />
                              </Badge>
                            )}
                            {spot.displayLocations.includes('login') && (
                              <Badge variant="outline" className="gap-1">
                                <LogIn className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-muted-foreground">{spot.stats.views} vues</span>
                            {spot.type === 'banner' && (
                              <span className="block text-muted-foreground">
                                {spot.stats.clicks} clics
                              </span>
                            )}
                            {spot.type === 'poll' && (
                              <span className="block text-muted-foreground">
                                {totalVotes} votes
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(parseISO(spot.createdAt), 'dd MMM yyyy', { locale: fr })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {spot.type === 'poll' && (
                                <DropdownMenuItem onClick={() => setResultsSpot(spot)}>
                                  <BarChart3 className="mr-2 h-4 w-4" />
                                  Voir les résultats
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => openEditForm(spot)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(spot)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Dupliquer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(spot)}>
                                {spot.isActive ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Activer
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteSpot(spot)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data && (data.total > 0 || (data.last_page ?? 0) > 1) && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <PerPageSelector
                value={filters.per_page || 20}
                onChange={(value) => setFilters((prev) => ({ ...prev, per_page: value, page: 1 }))}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data?.current_page === 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                >
                  Précédent
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {data?.current_page} sur {data?.last_page || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data?.current_page === data?.last_page || data?.last_page === 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spot Form Dialog */}
      <SpotFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditSpot(null);
        }}
        spot={editSpot}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Poll Results Dialog */}
      <PollResultsDialog
        open={!!resultsSpot}
        onOpenChange={(open) => !open && setResultsSpot(null)}
        spot={resultsSpot}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSpot} onOpenChange={(open) => !open && setDeleteSpot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce spot ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le spot et toutes ses statistiques seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
