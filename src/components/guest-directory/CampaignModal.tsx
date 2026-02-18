import { useState } from 'react';
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
import { useSendCampaign } from '@/hooks/useGlobalGuests';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

interface CampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  selectedIds: string[];
  onSuccess?: () => void;
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
  const { mutate: sendCampaign, isPending } = useSendCampaign();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) return;

    sendCampaign(
      {
        subject,
        message,
        guest_ids: selectedIds,
      },
      {
        onSuccess: (data: any) => {
          toast({
            title: 'Campagne envoyée',
            description: data.message || `Message envoyé à ${selectedCount} invité(s).`,
          });
          onOpenChange(false);
          setSubject('');
          setMessage('');
          onSuccess?.();
        },
        onError: (error: any) => {
          toast({
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
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Rappel important pour notre événement"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Votre message..."
                className="min-h-[150px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Ce message sera envoyé par email. Les variables dynamiques ne sont pas encore supportées.
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
