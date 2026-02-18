import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/api/client';
export default function EventCreatedForYouPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const emailParam = searchParams.get('email');
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) return;
    if (!isAuthenticated) {
      const redirectPath = `/event-created-for-you/${token}`;
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

  // When authenticated, claim the event and redirect
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    let cancelled = false;

    const claim = async () => {
      try {
        const { data } = await api.post<{ event_id: string }>(
          `/event-creation-invitations/${token}/claim`
        );
        if (!cancelled && data.event_id) {
          navigate(`/events/${data.event_id}`, { replace: true });
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const errData = (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data;
        const message = errData?.message ?? "Une erreur est survenue lors de l'accès à l'événement.";
        if (errData?.error === 'wrong_account') {
          setError(
            "Cette invitation a été envoyée à une autre adresse email. Connectez-vous avec l'adresse indiquée dans l'email."
          );
        } else {
          setError(message);
        }
      }
    };

    claim();
    return () => {
      cancelled = true;
    };
  }, [token, isAuthenticated, navigate]);

  const pageWrapper = (content: React.ReactNode) => (
    <div className="min-h-screen bg-muted/50">
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

  if (error) {
    return pageWrapper(
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="max-w-md text-center text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-sm text-primary underline hover:no-underline"
        >
          Se connecter avec une autre adresse
        </button>
      </div>
    );
  }

  // Claiming in progress
  return pageWrapper(
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Accès à votre événement…</p>
    </div>
  );
}
