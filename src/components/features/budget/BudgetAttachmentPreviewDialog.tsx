import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { getBudgetAttachmentSignedUrl } from '@/hooks/useBudget';
import type { BudgetPaymentAttachment } from '@/types';

interface BudgetAttachmentPreviewDialogProps {
  open: boolean;
  eventId: string;
  itemId: string | null;
  paymentId: string | null;
  attachment: BudgetPaymentAttachment | null;
  onOpenChange: (open: boolean) => void;
}

export function BudgetAttachmentPreviewDialog({
  open,
  eventId,
  itemId,
  paymentId,
  attachment,
  onOpenChange,
}: BudgetAttachmentPreviewDialogProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUrl() {
      if (!open || !itemId || !paymentId || !attachment) return;

      setIsLoading(true);
      setUrl(null);

      try {
        const signedUrl = await getBudgetAttachmentSignedUrl(eventId, itemId, paymentId, attachment.id);
        if (!cancelled) setUrl(signedUrl);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadUrl();

    return () => {
      cancelled = true;
    };
  }, [attachment, eventId, itemId, open, paymentId]);

  const isPdf = attachment?.mime_type === 'application/pdf';
  const isImage = attachment?.mime_type.startsWith('image/');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{attachment?.original_name ?? 'Justificatif'}</DialogTitle>
          <DialogDescription>
            {attachment ? `${Math.round(attachment.size / 1024)} Ko` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[420px] overflow-hidden rounded-md border bg-muted/20">
          {isLoading && <Skeleton className="h-[420px] w-full" />}

          {!isLoading && url && isImage && (
            <img src={url} alt={attachment?.original_name ?? 'Justificatif'} className="max-h-[70vh] w-full object-contain" />
          )}

          {!isLoading && url && isPdf && (
            <iframe title={attachment?.original_name ?? 'PDF'} src={url} className="h-[70vh] w-full" />
          )}

          {!isLoading && url && !isImage && !isPdf && (
            <div className="flex h-[420px] items-center justify-center">
              <Button asChild>
                <a href={url} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ouvrir le fichier
                </a>
              </Button>
            </div>
          )}
        </div>

        {url && (
          <div className="flex justify-end">
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ouvrir dans un onglet
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
