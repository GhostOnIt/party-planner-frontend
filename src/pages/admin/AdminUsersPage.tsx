import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Search,
  MoreHorizontal,
  Shield,
  User as UserIcon,
  Key,
  UserCog,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
import { useAdminUsers, useUpdateUser, useToggleUserActive, useSendPasswordReset } from '@/hooks/useAdmin';
import type { AdminUser, AdminUserFilters, UserRole } from '@/types';

export function AdminUsersPage() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<AdminUserFilters>({
    page: 1,
    per_page: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);

  const { data, isLoading } = useAdminUsers(filters);
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: toggleActive } = useToggleUserActive();
  const { mutate: sendPasswordReset, isPending: isSendingReset } = useSendPasswordReset();

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleRoleFilter = (role: string) => {
    if (role === 'all') {
      setFilters((prev) => {
        const { role: _, ...rest } = prev;
        return { ...rest, page: 1 };
      });
    } else {
      setFilters((prev) => ({ ...prev, role: role as UserRole, page: 1 }));
    }
  };

  const handleUpdateRole = () => {
    if (!editUser) return;

    updateUser(
      { userId: editUser.id, data: { role: editRole } },
      {
        onSuccess: () => {
          toast({
            title: 'Role mis a jour',
            description: `Le role de ${editUser.name} a ete modifie.`,
          });
          setEditUser(null);
        },
        onError: () => {
          toast({
            title: 'Erreur',
            description: 'Impossible de modifier le role.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleSendPasswordReset = (user: AdminUser) => {
    setResetPasswordUser(user);
  };

  const confirmSendPasswordReset = () => {
    if (!resetPasswordUser) return;

    sendPasswordReset(resetPasswordUser.id, {
      onSuccess: () => {
        setResetPasswordUser(null);
      },
    });
  };

  const handleToggleActive = (user: AdminUser) => {
    const newStatus = !user.is_active;
    toggleActive(
      { userId: user.id, isActive: newStatus },
      {
        onSuccess: () => {
          toast({
            title: newStatus ? 'Compte active' : 'Compte desactive',
            description: `Le compte de ${user.name} a ete ${newStatus ? 'active' : 'desactive'}.`,
          });
        },
        onError: () => {
          toast({
            title: 'Erreur',
            description: 'Impossible de modifier le statut du compte.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description="Gestion des utilisateurs de la plateforme"
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select
              value={filters.role || 'all'}
              onValueChange={handleRoleFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Utilisateur</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>Rechercher</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {data?.total || 0} utilisateur(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1 h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <UserIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">Aucun utilisateur trouve</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Evenements</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? (
                            <Shield className="mr-1 h-3 w-3" />
                          ) : (
                            <UserIcon className="mr-1 h-3 w-3" />
                          )}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{user.events_count || 0}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(parseISO(user.created_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.is_active !== false ? (
                          <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                            Inactif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditUser(user);
                                setEditRole(user.role);
                              }}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Modifier le role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                              {user.is_active !== false ? (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Desactiver
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleSendPasswordReset(user)}
                              disabled={isSendingReset}
                            >
                              <Key className="mr-2 h-4 w-4" />
                              {isSendingReset ? 'Envoi...' : 'Réinitialiser le mot de passe'}
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

      {/* Edit Role Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le role</DialogTitle>
            <DialogDescription>
              Modifier le role de {editUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateRole} disabled={isUpdating}>
              {isUpdating ? 'Modification...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Confirmation */}
      <AlertDialog open={!!resetPasswordUser} onOpenChange={(open) => !open && setResetPasswordUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Envoyer un lien de réinitialisation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Un email contenant un lien de réinitialisation de mot de passe sera envoyé à{' '}
              <strong>{resetPasswordUser?.email}</strong>. L'utilisateur pourra alors définir un nouveau mot de passe en cliquant sur le lien reçu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSendPasswordReset}
              disabled={isSendingReset}
            >
              {isSendingReset ? 'Envoi...' : 'Envoyer le lien'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
