import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useSendCampaign } from '@/hooks/useGlobalGuests';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, User, Mail, Phone } from 'lucide-react';

const MESSAGE_VARIABLES = [
  { key: '{nom}', label: 'Nom', icon: User },
  { key: '{numero}', label: 'N° téléphone', icon: Phone },
  { key: '{mail}', label: 'Email', icon: Mail },
] as const;

interface CampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  selectedIds: string[];
  onSuccess?: () => void;
}

function insertAtCursor(
  value: string,
  insert: string,
  selectionStart: number,
  selectionEnd: number
): string {
  return value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
}

export function CampaignModal({
  open,
  onOpenChange,
  selectedCount,
  selectedIds,
  onSuccess,
}: CampaignModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: sendCampaign, isPending } = useSendCampaign();
  const { toast } = useToast();

  const insertVariable = (variable: string) => {
    const msgEl = messageRef.current;
    if (msgEl && document.activeElement === msgEl) {
      const start = msgEl.selectionStart ?? 0;
      const end = msgEl.selectionEnd ?? start;
      setMessage((prev) => insertAtCursor(prev, variable, start, end));
      msgEl.focus();
      return;
    }
    const subjEl = subjectRef.current;
    if (subjEl && document.activeElement === subjEl) {
      const start = subjEl.selectionStart ?? 0;
      const end = subjEl.selectionEnd ?? start;
      setSubject((prev) => insertAtCursor(prev, variable, start, end));
      subjEl.focus();
      return;
    }
    setMessage((prev) => prev + variable);
    messageRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) return;

    const loadingToast = toast({
      title: 'Envoi en cours',
      description: `Envoi du message à ${selectedCount} invité${selectedCount > 1 ? 's' : ''}...`,
    });

    sendCampaign(
      {
        subject,
        message,
        guest_ids: selectedIds,
      },
      {
        onSuccess: (data: any) => {
          loadingToast.update({
            title: 'Campagne envoyée',
            description: data.message || `Message envoyé à ${selectedCount} invité(s).`,
          });
          onOpenChange(false);
          setSubject('');
          setMessage('');
          onSuccess?.();
        },
        onError: (error: any) => {
          loadingToast.update({
            variant: 'destructive',
            title: 'Erreur',
            description: error.response?.data?.message || "Une erreur est survenue lors de l'envoi.",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Envoyer un message groupé</DialogTitle>
            <DialogDescription>
              Vous allez envoyer un email à {selectedCount} invité{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input
                ref={subjectRef}
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Rappel important pour notre événement"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground self-center">Variables :</span>
                {MESSAGE_VARIABLES.map(({ key, icon: Icon }) => (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 text-xs font-mono"
                    onClick={() => insertVariable(key)}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {key}
                  </Badge>
                ))}
              </div>
              <Textarea
                ref={messageRef}
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Bonjour {nom}, nous vous confirmons..."
                className="min-h-[150px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Cliquez sur les variables pour les insérer à la position du curseur. Ex: Bonjour {'{nom}'}, votre email est {'{mail}'}...
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isPending || !subject.trim() || !message.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
