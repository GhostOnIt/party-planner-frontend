import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';

export function EventCreatedGuide({ onGuests, onDismiss, canAddGuests }: {
  onGuests: () => void;
  onDismiss: () => void;
  canAddGuests: boolean;
}) {
  const guide = useRef<HTMLElement>(null);
  useEffect(() => {
    guide.current?.scrollIntoView?.({ block: 'start' });
  }, []);

  return (
    <section ref={guide} aria-label="Premiers pas après la création" role="status" className="m-4 scroll-mt-20 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 space-y-3">
      <h2 className="font-semibold text-lg">Étape 3 sur 3 — Votre événement est créé !</h2>
      <p>Commencez par préparer votre liste d’invités. Aucune invitation n’a été envoyée : vous choisirez quand les envoyer. Vous pourrez aussi retrouver les tâches et le budget dans les onglets, selon votre forfait.</p>
      <div className="flex flex-wrap gap-3">
        {canAddGuests && <Button onClick={onGuests}>Ajouter mes invités</Button>}
        <Button variant="outline" onClick={onDismiss}>Explorer mon événement</Button>
      </div>
    </section>
  );
}
