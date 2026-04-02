import { useEffect, useRef, useState } from 'react';
import { BrowserCodeReader, BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function normalizeTokenSegment(segment: string): string {
  const t = segment.trim().replace(/\u200B/g, '');
  if (!t) return t;
  try {
    return t.includes('%') ? decodeURIComponent(t) : t;
  } catch {
    return t;
  }
}

function extractTokenFromQrText(rawText: string): string | null {
  const text = rawText.trim().replace(/\u200B/g, '');
  if (!text) return null;

  // Si c'est une URL, on essaye d'extraire `token` depuis le dernier segment.
  try {
    const url = new URL(text);
    const tokenFromQuery = url.searchParams.get('token');
    if (tokenFromQuery) return normalizeTokenSegment(tokenFromQuery);

    const segments = url.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    return last ? normalizeTokenSegment(last) : null;
  } catch {
    // Pas une URL: on tente une extraction naïve.
  }

  // Cas type `...?token=XYZ`
  const tokenMatch = /[?&]token=([^&]+)/.exec(text);
  if (tokenMatch?.[1]) return normalizeTokenSegment(decodeURIComponent(tokenMatch[1]));

  // Fallback: dernier morceau séparé par / ? #
  const parts = text.split(/[/?#]/).filter(Boolean);
  const last = parts[parts.length - 1];
  return last ? normalizeTokenSegment(last) : null;
}

export function QrScannerDialog({
  open,
  onOpenChange,
  onTokenScanned,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onTokenScanned: (token: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const hasScannedRef = useRef(false);

  /** Évite de relancer l’effet à chaque rendu parent (handler inline) ; sinon le scan est coupé en boucle. */
  const onTokenScannedRef = useRef(onTokenScanned);
  const onOpenChangeRef = useRef(onOpenChange);
  onTokenScannedRef.current = onTokenScanned;
  onOpenChangeRef.current = onOpenChange;

  const [error, setError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');

  useEffect(() => {
    if (!open) return;

    setError(null);
    setManualToken('');
    hasScannedRef.current = false;

    let cancelled = false;

    /** Le Dialog Radix monte le `<video>` après le premier paint : ref souvent null au premier tick. */
    const waitForVideoElement = async (): Promise<HTMLVideoElement | null> => {
      for (let i = 0; i < 40; i++) {
        if (cancelled) return null;
        if (videoRef.current) return videoRef.current;
        await new Promise((r) => setTimeout(r, 50));
      }
      return videoRef.current;
    };

    const run = async () => {
      const video = await waitForVideoElement();
      if (cancelled) return;
      if (!video) {
        setError(
          'Impossible d’afficher la vidéo. Fermez puis rouvrez la fenêtre, ou utilisez le champ token ci-dessous.',
        );
        return;
      }

      try {
        readerRef.current = new BrowserQRCodeReader();

        const onDecode = (
          result: { getText?: () => string } | undefined,
          _decodeError: unknown,
          scanControls: IScannerControls,
        ) => {
          if (cancelled) return;
          if (hasScannedRef.current) return;
          const text =
            result && typeof result.getText === 'function'
              ? result.getText()
              : '';
          if (!text) return;

          const token = extractTokenFromQrText(text);
          if (!token) {
            setError('QR détecté mais token introuvable.');
            return;
          }

          hasScannedRef.current = true;
          try {
            scanControls.stop?.();
          } catch {
            // ignore
          }
          try {
            controlsRef.current?.stop?.();
          } catch {
            // ignore
          }

          onTokenScannedRef.current(token);
          onOpenChangeRef.current(false);
        };

        let controls: IScannerControls;

        // PC : pas de caméra « environment » → préférer un deviceId explicite ou une contrainte large.
        const devices = await BrowserCodeReader.listVideoInputDevices();
        if (cancelled) return;

        if (devices.length > 0) {
          controls = await readerRef.current.decodeFromVideoDevice(
            devices[0].deviceId,
            video,
            onDecode,
          );
        } else {
          controls = await readerRef.current.decodeFromConstraints({ video: true }, video, onDecode);
        }

        controlsRef.current = controls;
      } catch (e) {
        const detail = e instanceof Error ? e.message : String(e);
        const secure =
          typeof globalThis !== 'undefined' && globalThis.isSecureContext
            ? ''
            : ' Utilisez HTTPS ou localhost (getUserMedia requis).';
        setError(`Caméra inaccessible : ${detail}.${secure} Vérifiez aussi les permissions du navigateur.`);
      }
    };

    void run();

    return () => {
      cancelled = true;
      try {
        controlsRef.current?.stop?.();
      } catch {
        // ignore
      }
      controlsRef.current = null;
      readerRef.current = null;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scanner un QR</DialogTitle>
          <DialogDescription>Positionnez le QR dans le cadre. L’app ouvrira automatiquement la page check-in.</DialogDescription>
        </DialogHeader>

        <div className="relative mt-2 rounded-lg overflow-hidden border bg-black">
          <video
            ref={videoRef}
            className="w-full h-[320px] object-cover"
            playsInline
            muted
            autoPlay
          />
          <div className="absolute inset-0 pointer-events-none ring-2 ring-emerald-500/70" />
        </div>

        {error && <p className="text-sm text-destructive mt-2">{error}</p>}

        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            Optionnel: si la caméra ne fonctionne pas, colle le token ici.
          </p>
          <div className="flex gap-2">
            <Input
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="token"
            />
            <Button
              type="button"
              onClick={() => {
                const token = manualToken.trim();
                if (!token) return;
                onTokenScanned(token);
                onOpenChange(false);
              }}
            >
              Ouvrir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

