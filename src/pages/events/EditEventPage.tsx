import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { EventForm } from '@/components/features/events';
import { useEvent, useUpdateEvent } from '@/hooks/useEvents';
import { getApiErrorMessage } from '@/api/client';
import { Calendar } from 'lucide-react';

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading: isLoadingEvent, error: loadError } = useEvent(id);
  const { mutate: updateEvent, isPending: isUpdating, error: updateError } = useUpdateEvent(id!);

  if (isLoadingEvent) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Card className="max-w-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError || !event) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={Calendar}
          title="Evenement introuvable"
          description={loadError ? getApiErrorMessage(loadError) : "Cet evenement n'existe pas ou a ete supprime"}
          action={{
            label: 'Retour aux evenements',
            onClick: () => navigate('/events'),
          }}
        />
      </div>
    );
  }

  const handleSubmit = (data: Parameters<typeof updateEvent>[0]) => {
    updateEvent(data, {
      onSuccess: () => {
        navigate(`/events/${id}`);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modifier l'evenement"
        description={event.title}
        breadcrumbs={[
          { label: 'Evenements', href: '/events' },
          { label: event.title, href: `/events/${id}` },
          { label: 'Modifier' },
        ]}
      />

      <div className="flex items-center gap-4">
        <Link to={`/events/${id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'evenement</CardTitle>
            <CardDescription>Modifiez les informations de votre evenement</CardDescription>
          </CardHeader>
          <CardContent>
            {updateError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{getApiErrorMessage(updateError)}</AlertDescription>
              </Alert>
            )}

            <EventForm
              event={event}
              onSubmit={handleSubmit}
              onCancel={() => navigate(`/events/${id}`)}
              isSubmitting={isUpdating}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
