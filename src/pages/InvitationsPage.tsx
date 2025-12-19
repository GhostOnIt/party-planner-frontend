import { useState } from 'react';
import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InvitationList } from '@/components/features/invitations';
import { useToast } from '@/hooks/use-toast';
import {
  useInvitations,
  useAcceptInvitation,
  useRejectInvitation,
} from '@/hooks/useInvitations';

export function InvitationsPage() {
  const { toast } = useToast();
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const { data: invitations = [], isLoading } = useInvitations();
  const { mutate: acceptInvitation } = useAcceptInvitation();
  const { mutate: rejectInvitation } = useRejectInvitation();

  // Filter only pending invitations
  const pendingInvitations = invitations.filter((inv) => inv.status === 'pending');

  const handleAccept = (invitationId: number) => {
    setAcceptingId(invitationId);
    acceptInvitation(invitationId, {
      onSuccess: () => {
        toast({
          title: 'Invitation acceptee',
          description: 'Vous avez rejoint l\'evenement en tant que collaborateur.',
        });
        setAcceptingId(null);
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Impossible d\'accepter l\'invitation.',
          variant: 'destructive',
        });
        setAcceptingId(null);
      },
    });
  };

  const handleReject = (invitationId: number) => {
    setRejectingId(invitationId);
    rejectInvitation(invitationId, {
      onSuccess: () => {
        toast({
          title: 'Invitation refusee',
        });
        setRejectingId(null);
      },
      onError: () => {
        toast({
          title: 'Erreur',
          description: 'Impossible de refuser l\'invitation.',
          variant: 'destructive',
        });
        setRejectingId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invitations"
        description="Invitations a collaborer recues"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Invitations en attente
          </CardTitle>
          <CardDescription>
            {pendingInvitations.length > 0
              ? `${pendingInvitations.length} invitation${pendingInvitations.length > 1 ? 's' : ''} en attente`
              : 'Aucune invitation en attente'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isLoading && pendingInvitations.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="Aucune invitation"
              description="Vous n'avez aucune invitation a collaborer en attente."
            />
          ) : (
            <InvitationList
              invitations={pendingInvitations}
              isLoading={isLoading}
              onAccept={handleAccept}
              onReject={handleReject}
              acceptingId={acceptingId}
              rejectingId={rejectingId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
