import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function InviteByTokenPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const emailParam = searchParams.get('email');

  // When already authenticated, redirect to /invitations (list page)
  useEffect(() => {
    if (token && isAuthenticated) {
      navigate('/invitations', { replace: true });
    }
  }, [token, isAuthenticated, navigate]);

  // Redirect to login if not authenticated — keep redirect so after login we go to /invitations
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

  // Authenticated: redirect to /invitations (handled by useEffect above) — show loader while redirecting
  return pageWrapper(
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Redirection vers vos invitations…</p>
    </div>
  );
}
