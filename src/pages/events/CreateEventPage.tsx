import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { EventForm } from '@/components/features/events';
import { useCreateEvent } from '@/hooks/useEvents';
import { getApiErrorMessage } from '@/api/client';

export function CreateEventPage() {
  const { mutate: createEvent, isPending, error } = useCreateEvent();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nouvel événement"
        description="Remplissez les informations ci-dessous pour créer votre événement"
        breadcrumbs={[{ label: 'Événements', href: '/events' }, { label: 'Nouveau' }]}
      />

      <div className="flex items-center gap-4">
        <Link to="/events">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'événement</CardTitle>
            <CardDescription>
              Remplissez les informations ci-dessous pour créer votre événement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
              </Alert>
            ) : null}

            <EventForm onSubmit={createEvent} isSubmitting={isPending} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
