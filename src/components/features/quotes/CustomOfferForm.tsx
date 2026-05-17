import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import type { CustomOffer, CreateCustomOfferPayload } from '@/hooks/useQuoteRequests';

interface CustomOfferFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateCustomOfferPayload) => void;
  onSendImmediately?: (payload: CreateCustomOfferPayload) => void;
  initialData?: CustomOffer | null;
  isSubmitting?: boolean;
}

export function CustomOfferForm({
  open,
  onOpenChange,
  onSubmit,
  onSendImmediately,
  initialData,
  isSubmitting,
}: CustomOfferFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [priceAmount, setPriceAmount] = useState(initialData?.price_amount?.toString() ?? '');
  const [priceCurrency, setPriceCurrency] = useState(initialData?.price_currency ?? 'XAF');
  const [features, setFeatures] = useState<string[]>(initialData?.features ?? []);
  const [newFeature, setNewFeature] = useState('');
  const [terms, setTerms] = useState(initialData?.terms ?? '');
  const [validityDays, setValidityDays] = useState(initialData?.validity_days?.toString() ?? '30');

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const buildPayload = (): CreateCustomOfferPayload => ({
    title,
    description: description || undefined,
    price_amount: Number.parseInt(priceAmount, 10) || 0,
    price_currency: priceCurrency,
    features: features.length > 0 ? features : undefined,
    terms: terms || undefined,
    validity_days: Number.parseInt(validityDays, 10) || 30,
  });

  const isValid = title.trim().length > 0 && Number.parseInt(priceAmount, 10) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Modifier l\'offre' : 'Créer une offre personnalisée'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="offer-title">Titre *</Label>
            <Input
              id="offer-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Offre Business Premium"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="offer-desc">Description</Label>
            <Textarea
              id="offer-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Détails de l'offre..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="offer-price">Montant *</Label>
              <Input
                id="offer-price"
                type="number"
                min="0"
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="offer-currency">Devise</Label>
              <Select value={priceCurrency} onValueChange={setPriceCurrency}>
                <SelectTrigger id="offer-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XAF">XAF (FCFA)</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Fonctionnalités incluses</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Ajouter une fonctionnalité"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <Button type="button" size="sm" variant="outline" onClick={addFeature} disabled={!newFeature.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {features.map((feature, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {feature}
                    <button type="button" onClick={() => removeFeature(i)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="offer-terms">Conditions</Label>
            <Textarea
              id="offer-terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={2}
              placeholder="Conditions particulières..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="offer-validity">Durée de validité</Label>
            <Select value={validityDays} onValueChange={setValidityDays}>
              <SelectTrigger id="offer-validity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="14">14 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="60">60 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            variant="outline"
            onClick={() => onSubmit(buildPayload())}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Sauvegarder brouillon'}
          </Button>
          {onSendImmediately && (
            <Button
              onClick={() => onSendImmediately(buildPayload())}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Envoi...' : 'Envoyer au client'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
