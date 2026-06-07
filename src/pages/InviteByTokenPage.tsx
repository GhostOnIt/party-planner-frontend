import { useEffect, type ReactNode } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CalendarDays, Loader2, LogOut, MapPin, UserPlus } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '@/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

interface TokenInvitation {
  id: string;
  event_id: string;
  event?: {
    id: string;
    title: string;
    type?: string;
    date?: string;
    location?: string | null;
  };
  inviter?: {
    name?: string;
    email?: string;
  };
  roles?: string[];
  status: 'pending';
}

export function InviteByTokenPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const emailParam = searchParams.get('email');

  // Redirect to login if not authenticated and keep the exact token URL for after login.
  useEffect(() => {
    if (!token) return;
    if (!isAuthenticated) {
      const redirectPath = `/invite/${token}`;
      try {
        sessionStorage.setItem('redirect_after_login', redirectPath);
        if (emailParam) {
          sessionStorage.setItem('redirect_email', emailParam);
        }
      } catch {
        // ignore
      }
      const params = new URLSearchParams({ redirect: redirectPath });
      if (emailParam) params.set('email', emailParam);
      navigate(`/login?${params.toString()}`, { replace: true });
    }
  }, [token, isAuthenticated, navigate, emailParam]);

  const invitationQuery = useQuery({
    queryKey: ['collaboration-invitation-token', token],
    queryFn: async () => {
      const response = await api.get<TokenInvitation>(`/invitations/by-token/${token}`);
      return response.data;
    },
    enabled: Boolean(token && isAuthenticated),
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/invitations/by-token/${token}/accept`);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Invitation acceptée',
        description: data?.message ?? "Vous avez rejoint l'événement.",
      });
      const eventId = data?.collaborator?.event_id ?? invitationQuery.data?.event_id;
      navigate(eventId ? `/events/${eventId}` : '/invitations', { replace: true });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message ?? "Impossible d'accepter l'invitation.",
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/invitations/by-token/${token}/reject`);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Invitation refusée',
        description: data?.message ?? "L'invitation a été refusée.",
      });
      navigate('/invitations', { replace: true });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error?.response?.data?.message ?? "Impossible de refuser l'invitation.",
        variant: 'destructive',
      });
    },
  });

  const pageWrapper = (content: ReactNode) => (
    <div className="min-h-screen bg-muted/50">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      {content}
    </div>
  );

  if (!token) {
    return pageWrapper(
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Token manquant.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return pageWrapper(
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (invitationQuery.isLoading) {
    return pageWrapper(
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Chargement de l'invitation…</p>
      </div>
    );
  }

  if (invitationQuery.error) {
    const error = invitationQuery.error as any;
    const status = error?.response?.status;
    const expectedEmail = error?.response?.data?.expected_email;
    const message =
      error?.response?.data?.message ??
      (status === 404 ? 'Invitation introuvable ou expirée.' : "Impossible de charger l'invitation.");

    return pageWrapper(
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>{status === 403 ? 'Mauvais compte connecté' : 'Invitation indisponible'}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          {expectedEmail && (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cette invitation est destinée à <span className="font-medium text-foreground">{expectedEmail}</span>.
              </p>
            </CardContent>
          )}
          <CardFooter className="flex gap-2">
            {status === 403 && (
              <Button
                type="button"
                onClick={() => {
                  logout();
                  navigate(`/login?redirect=${encodeURIComponent(`/invite/${token}`)}`, { replace: true });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Changer de compte
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/invitations">Voir mes invitations</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const invitation = invitationQuery.data;
  const event = invitation?.event;

  return pageWrapper(
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="h-6 w-6" />
          </div>
          <CardTitle>Invitation à collaborer</CardTitle>
          <CardDescription>
            {invitation?.inviter?.name || 'Un organisateur'} vous invite à collaborer sur cet événement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">{event?.title || 'Événement'}</h2>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              {event?.date && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {event.date}
                </div>
              )}
              {event?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              )}
            </div>
          </div>
          {(invitation?.roles || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {invitation?.roles?.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={acceptMutation.isPending || rejectMutation.isPending}
            onClick={() => rejectMutation.mutate()}
          >
            Refuser
          </Button>
          <Button
            type="button"
            disabled={acceptMutation.isPending || rejectMutation.isPending}
            onClick={() => acceptMutation.mutate()}
          >
            {acceptMutation.isPending ? 'Acceptation...' : 'Accepter'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
