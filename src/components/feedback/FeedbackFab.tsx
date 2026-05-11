import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import api from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MAX_LEN = 5000;

export function FeedbackFab() {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await api.post<{ message?: string }>('/feedback', { message: text });
      return res.data;
    },
    onSuccess: (data) => {
      toast({
        title: data?.message ?? 'Message envoyé',
      });
      setMessage('');
      setOpen(false);
    },
    onError: (err: unknown) => {
      const ax = err as { response?: { status?: number; data?: { message?: string } } };
      const status = ax.response?.status;
      const msg =
        ax.response?.data?.message ??
        (status === 403
          ? 'Le feedback pilote est réservé aux comptes utilisateur.'
          : 'Impossible d\'envoyer le message.');
      toast({
        title: 'Erreur',
        description: msg,
        variant: 'destructive',
      });
    },
  });

  if (!user || user.role === 'admin') {
    return null;
  }

  const submit = () => {
    const trimmed = message.trim();
    if (!trimmed) {
      toast({
        title: 'Message vide',
        description: 'Écrivez votre retour avant d\'envoyer.',
        variant: 'destructive',
      });
      return;
    }
    if (trimmed.length > MAX_LEN) {
      toast({
        title: 'Message trop long',
        description: `Maximum ${MAX_LEN} caractères.`,
        variant: 'destructive',
      });
      return;
    }
    mutation.mutate(trimmed);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Envoyer un feedback"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full',
          'bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
          'lg:bottom-8 lg:right-8'
        )}
      >
        <MessageCircle className="h-7 w-7" aria-hidden />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feedback phase pilote</DialogTitle>
            <DialogDescription>
              Partagez vos remarques ou suggestions. Elles sont envoyées à l&apos;équipe par e-mail.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="pilot-feedback-message">Votre message</Label>
            <Textarea
              id="pilot-feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrivez ici…"
              rows={6}
              maxLength={MAX_LEN}
              disabled={mutation.isPending}
              className="min-h-[140px] resize-y"
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/{MAX_LEN}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
              Annuler
            </Button>
            <Button type="button" onClick={submit} disabled={mutation.isPending}>
              {mutation.isPending ? 'Envoi…' : 'Envoyer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
