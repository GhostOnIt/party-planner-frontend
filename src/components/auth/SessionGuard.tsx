import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import api from '@/api/client';
import type { User } from '@/types';
import { Loader2 } from 'lucide-react';

/**
 * Vérifie la session (token) avant d'afficher les routes.
 * Si un token est présent, on appelle GET /user pour valider la session (ou déclencher le refresh).
 * Évite d'afficher le dashboard puis de rediriger vers login.
 */
export function SessionGuard() {
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [status, setStatus] = useState<'pending' | 'done'>('pending');

  useEffect(() => {
    if (!token) {
      setStatus('done');
      return;
    }

    setStatus('pending');
    let cancelled = false;

    const check = async () => {
      try {
        const { data } = await api.get<User>('/user');
        if (!cancelled) {
          setAuth(data, token);
          setStatus('done');
        }
      } catch {
        if (!cancelled) {
          setStatus('done');
        }
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [token, setAuth]);

  if (status === 'pending') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
