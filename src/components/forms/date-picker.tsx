import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  disableFuture?: boolean; // Nouvelle prop pour désactiver les dates futures
  disablePast?: boolean; // Nouvelle prop pour désactiver les dates passées
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Selectionner une date',
  disabled = false,
  className,
  disableFuture = false,
  disablePast = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'PPP', { locale: fr }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
          locale={fr}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (disableFuture && date > today) {
              return true;
            }
            
            if (disablePast && date < today) {
              return true;
            }
            
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
