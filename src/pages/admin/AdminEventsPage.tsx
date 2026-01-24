import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import {
  Search,
  MoreHorizontal,
  Calendar,
  MapPin,
  Users,
  Trash2,
  Eye,
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
import { useAdminEvents, useDeleteEvent } from '@/hooks/useAdmin';
import type { AdminEvent, AdminEventFilters, EventType, EventStatus } from '@/types';
import { cn } from '@/lib/utils';

const eventTypeLabels: Record<EventType, string> = {
  mariage: 'Mariage',
  anniversaire: 'Anniversaire',
  baby_shower: 'Baby Shower',
  soiree: 'Soiree',
  brunch: 'Brunch',
  autre: 'Autre',
};

const eventTypeColors: Record<EventType, string> = {
  mariage: 'bg-event-mariage',
  anniversaire: 'bg-event-anniversaire',
  baby_shower: 'bg-event-baby-shower',
  soiree: 'bg-event-soiree',
  brunch: 'bg-event-brunch',
  autre: 'bg-event-autre',
};

const eventStatusLabels: Record<EventStatus, string> = {
  upcoming: 'À venir',
  ongoing: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

const eventStatusColors: Record<EventStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-green-100 text-green-800',
  completed: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function AdminEventsPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<AdminEventFilters>({
    page: 1,
    per_page: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [deleteEvent, setDeleteEvent] = useState<AdminEvent | null>(null);

  const { data, isLoading } = useAdminEvents(filters);
  const { mutate: deleteEventMutation, isPending: isDeleting } = useDeleteEvent();

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
      setFilters((prev) => ({ ...prev, type: type as EventType, page: 1 }));
    }
  };

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      setFilters((prev) => {
        const { status: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    } else {
      setFilters((prev) => ({ ...prev, status: status as EventStatus, page: 1 }));
    }
  };

  const handleDelete = () => {
    if (!deleteEvent) return;

    deleteEventMutation(deleteEvent.id, {
      onSuccess: () => {
        toast({
          title: 'Evenement supprime',
          description: `${deleteEvent.title} a ete supprime.`,
        });
        setDeleteEvent(null);
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer l\'evenement.',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evenements"
        description="Gestion des evenements de la plateforme"
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre..."
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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(eventStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>Rechercher</Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des evenements</CardTitle>
          <CardDescription>
            {data?.total || 0} evenement(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="mt-1 h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Aucun evenement trouve</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evenement</TableHead>
                    <TableHead>Organisateur</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Invites</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-lg text-white',
                              eventTypeColors[event.type] || 'bg-primary'
                            )}
                          >
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <Badge variant="secondary" className="mt-1">
                              {eventTypeLabels[event.type] || event.type}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {event.owner ? (
                          <div>
                            <p className="text-sm font-medium">{event.owner.name}</p>
                            <p className="text-xs text-muted-foreground">{event.owner.email}</p>
                          </div>
                        ) : event.user ? (
                          <div>
                            <p className="text-sm font-medium">{event.user.name}</p>
                            <p className="text-xs text-muted-foreground">{event.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Utilisateur #{event.user_id}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">
                            {format(parseISO(event.date), 'dd MMM yyyy', { locale: fr })}
                          </span>
                          {event.time && (
                            <span className="text-xs text-muted-foreground">{event.time}</span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={eventStatusColors[event.status]}>
                          {eventStatusLabels[event.status] || event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {event.guests_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link 
                                to={`/events/${event.id}`}
                                onClick={() => {
                                  // Mémoriser qu'on vient de la section admin
                                  sessionStorage.setItem('fromAdminSection', 'true');
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir les details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteEvent(event)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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
                  Precedent
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteEvent} onOpenChange={(open) => !open && setDeleteEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'evenement ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irreversible. Tous les invites, taches, budget et photos
              de l'evenement "{deleteEvent?.title}" seront egalement supprimes.
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
