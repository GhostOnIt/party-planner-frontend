import { Download, RefreshCw, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  usePollResults,
  useResetPollVotes,
  useClosePoll,
  useExportPollResults,
} from '@/hooks/useCommunication';
import type { CommunicationSpot } from '@/types/communication';
import { useState } from 'react';

interface PollResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spot: CommunicationSpot | null;
}

export function PollResultsDialog({
  open,
  onOpenChange,
  spot,
}: PollResultsDialogProps) {
  const { toast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const { data: results, isLoading } = usePollResults(spot?.id || null);
  const { mutate: resetVotes, isPending: isResetting } = useResetPollVotes();
  const { mutate: closePoll, isPending: isClosing } = useClosePoll();
  const { mutate: exportResults, isPending: isExporting } = useExportPollResults();

  const handleExport = () => {
    if (!spot) return;
    
    exportResults(spot.id, {
      onSuccess: () => {
        toast({
          title: 'Export réussi',
          description: 'Les résultats ont été exportés en CSV.',
        });
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: "Impossible d'exporter les résultats.",
          variant: 'destructive',
        });
      },
    });
  };

  const handleReset = () => {
    if (!spot) return;
    
    resetVotes(spot.id, {
      onSuccess: () => {
        toast({
          title: 'Votes réinitialisés',
          description: 'Tous les votes ont été supprimés.',
        });
        setConfirmReset(false);
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Impossible de réinitialiser les votes.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleClose = () => {
    if (!spot) return;
    
    closePoll(spot.id, {
      onSuccess: () => {
        toast({
          title: 'Sondage fermé',
          description: 'Le sondage est maintenant fermé aux votes.',
        });
        setConfirmClose(false);
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Impossible de fermer le sondage.',
          variant: 'destructive',
        });
      },
    });
  };

  // Calculate results from spot stats or API results
  const getResultsData = () => {
    if (results) {
      return {
        totalVotes: results.totalVotes,
        options: results.options,
      };
    }

    if (spot?.pollOptions && spot?.stats?.votes) {
      const totalVotes = Object.values(spot.stats.votes).reduce((a, b) => a + b, 0);
      return {
        totalVotes,
        options: spot.pollOptions.map((opt) => ({
          id: opt.id,
          label: opt.label,
          votes: spot.stats.votes?.[opt.id] || 0,
          percentage: totalVotes > 0
            ? Math.round(((spot.stats.votes?.[opt.id] || 0) / totalVotes) * 100)
            : 0,
        })),
      };
    }

    return { totalVotes: 0, options: [] };
  };

  const resultsData = getResultsData();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Résultats du sondage</DialogTitle>
            <DialogDescription>
              {spot?.pollQuestion || 'Question du sondage'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Total votes */}
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary">
                    {resultsData.totalVotes}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    vote{resultsData.totalVotes !== 1 ? 's' : ''} au total
                  </span>
                </div>

                {/* Results bars */}
                <div className="space-y-4">
                  {resultsData.options.map((option) => (
                    <div key={option.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-muted-foreground">
                          {option.votes} ({option.percentage}%)
                        </span>
                      </div>
                      <Progress value={option.percentage} className="h-3" />
                    </div>
                  ))}
                </div>

                {resultsData.totalVotes === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun vote pour le moment
                  </p>
                )}
              </>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting || resultsData.totalVotes === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Export...' : 'Exporter CSV'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmReset(true)}
              disabled={resultsData.totalVotes === 0}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Réinitialiser
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmClose(true)}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Fermer le sondage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation */}
      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser les votes ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les votes seront supprimés et le compteur sera remis à zéro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isResetting}
            >
              {isResetting ? 'Réinitialisation...' : 'Réinitialiser'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Poll Confirmation */}
      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fermer le sondage ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le sondage sera fermé et aucun nouveau vote ne pourra être enregistré. Les résultats actuels seront conservés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClose}
              disabled={isClosing}
            >
              {isClosing ? 'Fermeture...' : 'Fermer le sondage'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
