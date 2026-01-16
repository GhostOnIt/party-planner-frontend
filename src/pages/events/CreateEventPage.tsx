import { PageHeader } from '@/components/layout/page-header';
import { EventForm } from '@/components/features/events';
import { useCreateEvent } from '@/hooks/useEvents';

export function CreateEventPage() {
  const { mutate: createEvent, isPending } = useCreateEvent();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Nouvel événement"
        description="Remplissez les informations ci-dessous pour créer votre événement"
        breadcrumbs={[{ label: 'Événements', href: '/events' }, { label: 'Nouveau' }]}
      />

      <div className="mx-auto max-w-3xl space-y-6">
        <EventForm onSubmit={createEvent} isSubmitting={isPending} />
      </div>
    </div>
  );
}
