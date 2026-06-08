import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { BudgetItem, BudgetPaymentMethod, CreateBudgetPaymentFormData } from '@/types';

interface BudgetPaymentDialogProps {
  open: boolean;
  item: BudgetItem | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateBudgetPaymentFormData) => void;
}

const paymentMethods: Array<{ value: BudgetPaymentMethod; label: string }> = [
  { value: 'cash', label: 'Espèces' },
  { value: 'mobile_money', label: 'Mobile money' },
  { value: 'bank_transfer', label: 'Virement' },
  { value: 'card', label: 'Carte' },
  { value: 'other', label: 'Autre' },
];

export function BudgetPaymentDialog({
  open,
  item,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: BudgetPaymentDialogProps) {
  const defaultAmount = useMemo(() => {
    if (!item) return '';
    const remaining = Number(item.remaining_amount ?? 0);
    const actual = Number(item.actual_cost ?? item.estimated_cost ?? 0);
    return String(remaining > 0 ? remaining : actual);
  }, [item]);

  const [amount, setAmount] = useState(defaultAmount);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<BudgetPaymentMethod | undefined>();
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setAmount(defaultAmount);
      setPaymentDate(new Date().toISOString().slice(0, 10));
      setMethod(undefined);
      setReference('');
      setNotes('');
      setFile(null);
    }
  }, [defaultAmount, open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      amount: Number(amount),
      payment_date: paymentDate,
      method,
      reference: reference || undefined,
      notes: notes || undefined,
      file,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
            <DialogDescription>{item?.name}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Montant payé</Label>
              <Input
                id="payment-amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-date">Date de paiement</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Méthode</Label>
              <Select value={method} onValueChange={(value) => setMethod(value as BudgetPaymentMethod)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((paymentMethod) => (
                    <SelectItem key={paymentMethod.value} value={paymentMethod.value}>
                      {paymentMethod.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-reference">Référence</Label>
              <Input
                id="payment-reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Transaction, reçu..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-file">Justificatif</Label>
            <div className="flex items-center gap-2">
              <Input
                id="payment-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-notes">Note</Label>
            <Textarea
              id="payment-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting || Number(amount) <= 0}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
