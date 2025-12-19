import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SERVER_ERROR_EVENT } from '@/api/client';

export function ServerErrorListener() {
  const { toast } = useToast();
  const lastErrorTime = useRef<number>(0);

  useEffect(() => {
    const handleServerError = (event: CustomEvent<{ message: string }>) => {
      const now = Date.now();
      // Debounce: don't show multiple toasts within 5 seconds
      if (now - lastErrorTime.current < 5000) {
        return;
      }
      lastErrorTime.current = now;

      toast({
        title: 'Erreur de connexion',
        description: event.detail.message,
        variant: 'destructive',
        duration: 10000,
      });
    };

    window.addEventListener(SERVER_ERROR_EVENT, handleServerError as EventListener);

    return () => {
      window.removeEventListener(SERVER_ERROR_EVENT, handleServerError as EventListener);
    };
  }, [toast]);

  return null;
}
