import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { EventForm } from '@/components/features/events';
import { useEvent, useDuplicateEvent } from '@/hooks/useEvents';
import { getApiErrorMessage } from '@/api/client';

export function DuplicateEventPage() {
  const { id } = useParams<{ id: string }>();
  const { data: sourceEvent, isLoading, error } = useEvent(id);
  const { mutate: duplicateEvent, isPending, error: duplicateError } = useDuplicateEvent();

  if (isLoading || !id) {
    return (
      <div className="space-y-8">
        <PageHeader title="Dupliquer l'événement" description="Chargement…" />
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Chargement de l'événement…
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !sourceEvent) {
    return (
      <div className="space-y-8">
        <PageHeader title="Dupliquer l'événement" description="Événement introuvable" />
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive">
            <AlertDescription>
              {error ? getApiErrorMessage(error) : "Cet événement n'existe pas ou vous n'avez pas accès."}
            </AlertDescription>
          </Alert>
          <Button variant="outline" asChild className="mt-4">
            <Link to="/events">Retour aux événements</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formEvent = {
    ...sourceEvent,
    date: '',
    time: '',
  };

  const handleDuplicateSubmit = (
    data: Parameters<Parameters<typeof EventForm>[0]['onSubmit']>[0],
    duplicateOptions?: Parameters<Parameters<typeof EventForm>[0]['onSubmit']>[1]
  ) => {
    duplicateEvent({
      sourceEventId: id!,
      title: data.title,
      type: data.type,
      date: data.date || undefined,
      time: data.time || undefined,
      location: data.location,
      description: data.description,
      theme: data.theme,
      expected_guests_count: sourceEvent.expected_guests ?? undefined,
      include_guests: duplicateOptions?.includeGuests ?? false,
      include_tasks: duplicateOptions?.includeTasks ?? true,
      include_budget: duplicateOptions?.includeBudget ?? true,
      include_collaborators: duplicateOptions?.includeCollaborators ?? false,
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dupliquer l'événement"
        description="Réutilisez les informations de l'événement ci-dessous. Donnez un nouveau titre, puis choisissez ce que vous souhaitez copier."
        breadcrumbs={[
          { label: 'Événements', href: '/events' },
          { label: sourceEvent.title, href: `/events/${id}` },
          { label: 'Dupliquer' },
        ]}
      />

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link to={`/events/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'événement</CardTitle>
            <CardDescription>
              Duplication de : {sourceEvent.title}. Modifiez le titre et les champs si besoin, puis choisissez les éléments à copier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {duplicateError ? (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{getApiErrorMessage(duplicateError)}</AlertDescription>
              </Alert>
            ) : null}

            <EventForm
              event={formEvent}
              duplicateMode
              initialTitleOverride=""
              sourceGuestsCount={sourceEvent.guests_count ?? 0}
              sourceTasksCount={sourceEvent.tasks_count ?? 0}
              sourceBudgetCount={sourceEvent.budget_items_count ?? 0}
              sourceCollaboratorsCount={sourceEvent.collaborators_count ?? 0}
              onSubmit={handleDuplicateSubmit}
              isSubmitting={isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
