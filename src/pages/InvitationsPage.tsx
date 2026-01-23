import { useState } from 'react';
import { Mail, HelpCircle } from 'lucide-react';
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
import { InvitationList, InvitationDetailsSheet } from '@/components/features/invitations';
import { useToast } from '@/hooks/use-toast';
import { useInvitations, useAcceptInvitation, useRejectInvitation } from '@/hooks/useInvitations';
import type { Invitation } from '@/types';

type ConfirmationAction = 'accept' | 'reject' | null;

export function InvitationsPage() {
  const { toast } = useToast();
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    action: ConfirmationAction;
    invitation: Invitation | null;
  }>({
    isOpen: false,
    action: null,
    invitation: null,
  });

  const { data: invitations = [], isLoading } = useInvitations();
  const { mutate: acceptInvitation } = useAcceptInvitation();
  const { mutate: rejectInvitation } = useRejectInvitation();

  // Filter only pending invitations and sort by date (most recent first)
  const pendingInvitations = invitations
    .filter((inv) => inv.status === 'pending')
    .sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA; // Most recent first
    });

  const handleAccept = (invitationId: number) => {
    const invitation = pendingInvitations.find((inv) => inv.id === invitationId);
    if (invitation) {
      setConfirmationDialog({
        isOpen: true,
        action: 'accept',
        invitation,
      });
    }
  };

  const handleReject = (invitationId: number) => {
    const invitation = pendingInvitations.find((inv) => inv.id === invitationId);
    if (invitation) {
      setConfirmationDialog({
        isOpen: true,
        action: 'reject',
        invitation,
      });
    }
  };

  const handleConfirmAction = () => {
    if (!confirmationDialog.invitation || !confirmationDialog.action) return;

    const invitationId = confirmationDialog.invitation.id;
    const action = confirmationDialog.action;

    // Fermer le dialogue
    setConfirmationDialog({ isOpen: false, action: null, invitation: null });

    if (action === 'accept') {
      setAcceptingId(invitationId);
      acceptInvitation(invitationId, {
        onSuccess: () => {
          toast({
            title: 'Invitation acceptee',
            description: "Vous avez rejoint l'evenement en tant que collaborateur.",
          });
          setAcceptingId(null);
        },
        onError: () => {
          toast({
            title: 'Erreur',
            description: "Impossible d'accepter l'invitation.",
            variant: 'destructive',
          });
          setAcceptingId(null);
        },
      });
    } else if (action === 'reject') {
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
            description: "Impossible de refuser l'invitation.",
            variant: 'destructive',
          });
          setRejectingId(null);
        },
      });
    }
  };

  const handleViewDetails = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
  };

  const handleAcceptFromDetails = (invitationId: number) => {
    handleAccept(invitationId);
    setSelectedInvitation(null); // Fermer le dialogue de détails
  };

  const handleRejectFromDetails = (invitationId: number) => {
    handleReject(invitationId);
    setSelectedInvitation(null); // Fermer le dialogue de détails
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Invitations" description="Invitations a collaborer recues" />

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
              onViewDetails={handleViewDetails}
              acceptingId={acceptingId}
              rejectingId={rejectingId}
            />
          )}
        </CardContent>
      </Card>

      {/* Invitation Details Sheet */}
      {selectedInvitation && (
        <InvitationDetailsSheet
          invitation={selectedInvitation}
          open={!!selectedInvitation}
          onOpenChange={(open) => {
            if (!open) setSelectedInvitation(null);
          }}
          onAccept={handleAcceptFromDetails}
          onReject={handleRejectFromDetails}
          isAccepting={acceptingId === selectedInvitation.id}
          isRejecting={rejectingId === selectedInvitation.id}
        />
      )}

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmationDialog.isOpen}
        onOpenChange={(open) => {
          if (!open) setConfirmationDialog({ isOpen: false, action: null, invitation: null });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#4F46E5]" />
              {confirmationDialog.action === 'accept'
                ? "Accepter l'invitation"
                : "Refuser l'invitation"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {confirmationDialog.action === 'accept'
                    ? 'Êtes-vous sûr de vouloir accepter cette invitation ?'
                    : 'Êtes-vous sûr de vouloir refuser cette invitation ? Cette action est irréversible.'}
                </p>

                {confirmationDialog.invitation && (
                  <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                    <div className="font-medium">
                      Événement : {confirmationDialog.invitation.event?.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Invité par : {confirmationDialog.invitation.inviter?.name}
                    </div>
                    <div className="text-sm">
                      Rôles :{' '}
                      {confirmationDialog.invitation.roles?.join(', ') ||
                        confirmationDialog.invitation.role ||
                        'Non spécifié'}
                    </div>
                  </div>
                )}

                <p className="text-sm font-medium">
                  {confirmationDialog.action === 'accept'
                    ? "En acceptant, vous rejoindrez l'équipe de cet événement."
                    : "En refusant, vous ne recevrez plus d'invitations pour cet événement."}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                confirmationDialog.action === 'reject'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : ''
              }
            >
              {confirmationDialog.action === 'accept' ? 'Accepter' : 'Refuser'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
