import { useState } from 'react';
import { Users } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { CollaborationList } from '@/components/features/collaborations';
import { useToast } from '@/hooks/use-toast';
import { useCollaborations, useLeaveCollaboration } from '@/hooks/useCollaborations';

export function CollaborationsPage() {
  const { toast } = useToast();
  const [leavingEventId, setLeavingEventId] = useState<number | null>(null);
  const [eventToLeave, setEventToLeave] = useState<number | null>(null);

  const { data: collaborations = [], isLoading } = useCollaborations();
  const { mutate: leaveCollaboration, isPending: isLeaving } = useLeaveCollaboration();

  const handleLeaveRequest = (eventId: number) => {
    setEventToLeave(eventId);
  };

  const handleConfirmLeave = () => {
    if (eventToLeave) {
      setLeavingEventId(eventToLeave);
      leaveCollaboration(eventToLeave, {
        onSuccess: () => {
          toast({
            title: 'Collaboration terminee',
            description: 'Vous avez quitte cet evenement.',
          });
          setEventToLeave(null);
          setLeavingEventId(null);
        },
        onError: () => {
          toast({
            title: 'Erreur',
            description: 'Impossible de quitter cet evenement.',
            variant: 'destructive',
          });
          setLeavingEventId(null);
        },
      });
    }
  };

  const collaborationToLeave = collaborations.find((c) => c.event_id === eventToLeave);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collaborations"
        description="Evenements auxquels vous collaborez"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mes collaborations
          </CardTitle>
          <CardDescription>
            {collaborations.length > 0
              ? `${collaborations.length} evenement${collaborations.length > 1 ? 's' : ''}`
              : 'Aucune collaboration active'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isLoading && collaborations.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucune collaboration"
              description="Vous ne collaborez sur aucun evenement pour le moment. Acceptez une invitation pour commencer a collaborer."
            />
          ) : (
            <CollaborationList
              collaborations={collaborations}
              isLoading={isLoading}
              onLeave={handleLeaveRequest}
              leavingEventId={leavingEventId}
            />
          )}
        </CardContent>
      </Card>

      {/* Leave Confirmation Dialog */}
      <AlertDialog open={!!eventToLeave} onOpenChange={() => setEventToLeave(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter la collaboration</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir quitter l'evenement "{collaborationToLeave?.event?.title}" ?
              Vous n'aurez plus acces a cet evenement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLeave}
              disabled={isLeaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLeaving ? 'Sortie en cours...' : 'Quitter'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
