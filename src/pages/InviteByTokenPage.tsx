import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Mail, Calendar, User, Check, X } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import api from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/layouts/AuthLayout';

interface InvitationByTokenResponse {
  id: number;
  event_id: number;
  event: { id: number; title: string; type?: string };
  inviter: { id: number; name: string };
  roles: string[];
  status: string;
}

export function InviteByTokenPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['invitation-by-token', token],
    queryFn: async (): Promise<InvitationByTokenResponse> => {
      const response = await api.get<InvitationByTokenResponse>(`/invitations/by-token/${token}`);
      return response.data;
    },
    enabled: !!token && isAuthenticated,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      await api.post(`/user/invitations/${invitationId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'collaborations'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Invitation acceptée",
        description: "Vous avez rejoint l'événement en tant que collaborateur.",
      });
      navigate('/events', { replace: true });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'accepter l'invitation.",
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (invitationId: number) => {
      await api.post(`/user/invitations/${invitationId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'invitations'] });
      toast({
        title: "Invitation refusée",
      });
      navigate('/dashboard', { replace: true });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de refuser l'invitation.",
        variant: 'destructive',
      });
    },
  });

  const emailParam = searchParams.get('email');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) return;
    if (!isAuthenticated) {
      const params = new URLSearchParams({ redirect: `/invite/${token}` });
      if (emailParam) params.set('email', emailParam);
      navigate(`/login?${params.toString()}`, { replace: true });
    }
  }, [token, isAuthenticated, navigate, emailParam]);

  // Redirect to login on 403 (wrong account) — must logout first so PublicRoute allows access to /login
  useEffect(() => {
    if (isError && axios.isAxiosError(error) && error.response?.status === 403) {
      logout(); // Disconnect current (wrong) account
      const params = new URLSearchParams({ redirect: `/invite/${token}` });
      const emailToUse = emailParam ?? (error.response?.data as { expected_email?: string })?.expected_email;
      if (emailToUse) params.set('email', emailToUse);
      navigate(`/login?${params.toString()}`, { replace: true });
    }
  }, [isError, error, token, navigate, emailParam, logout]);

  if (!token) {
    return (
      <AuthLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Token manquant.</p>
        </div>
      </AuthLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement de l'invitation…</p>
        </div>
      </AuthLayout>
    );
  }

  if (isError && axios.isAxiosError(error) && error.response?.status === 404) {
    return (
      <AuthLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invitation introuvable</CardTitle>
              <CardDescription>
                Cette invitation est introuvable ou a expiré.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Retour au tableau de bord
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    );
  }

  if (data) {
    const rolesLabel = data.roles?.length
      ? data.roles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')
      : 'Collaborateur';

    return (
      <AuthLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invitation à collaborer
              </CardTitle>
              <CardDescription>
                Vous avez été invité à rejoindre un événement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Événement</p>
                    <p className="text-muted-foreground">{data.event?.title}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Invité par</p>
                    <p className="text-muted-foreground">{data.inviter?.name}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Rôles proposés</p>
                  <p className="text-muted-foreground">{rolesLabel}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => acceptMutation.mutate(data.id)}
                  disabled={acceptMutation.isPending || rejectMutation.isPending}
                >
                  {acceptMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Accepter
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => rejectMutation.mutate(data.id)}
                  disabled={acceptMutation.isPending || rejectMutation.isPending}
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Refuser l'invitation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    );
  }

  return null;
}
