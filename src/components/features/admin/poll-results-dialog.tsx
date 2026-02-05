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
  const hasVotes = resultsData.totalVotes > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">Résultats du sondage</DialogTitle>
            <DialogDescription className="text-sm">
              {spot?.pollQuestion || 'Question du sondage'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-12 w-24 mx-auto" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Total votes */}
                <div className="text-center mb-8">
                  <div className="text-4xl font-semibold mb-1">
                    {resultsData.totalVotes}
                  </div>
                  <div className="text-sm text-gray-500">
                    vote{resultsData.totalVotes !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Results */}
                {hasVotes ? (
                  <div className="space-y-5">
                    {resultsData.options
                      .sort((a, b) => b.votes - a.votes)
                      .map((option) => (
                        <div key={option.id} className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm font-medium">
                              {option.label}
                            </span>
                            <span className="text-xs text-gray-500 tabular-nums">
                              {option.votes} · {option.percentage}%
                            </span>
                          </div>
                          <Progress 
                            value={option.percentage} 
                            className="h-2"
                          />
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-gray-500">
                    Aucun vote enregistré
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting || !hasVotes}
                className="gap-2 flex-1"
                size="sm"
              >
                <Download className="h-4 w-4" />
                Exporter
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmReset(true)}
                disabled={!hasVotes}
                className="gap-2 flex-1"
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
                Réinitialiser
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmClose(true)}
                className="gap-2 flex-1"
                size="sm"
              >
                <XCircle className="h-4 w-4" />
                Fermer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation */}
      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              Réinitialiser les votes
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Tous les votes seront supprimés et le compteur remis à zéro. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700"
              disabled={isResetting}
            >
              {isResetting ? 'Réinitialisation...' : 'Réinitialiser'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Close Poll Confirmation */}
      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              Fermer le sondage
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Le sondage sera fermé et aucun nouveau vote ne pourra être enregistré. Les résultats actuels seront conservés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClose}
              disabled={isClosing}
            >
              {isClosing ? 'Fermeture...' : 'Fermer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}