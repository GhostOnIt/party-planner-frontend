import { Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = '+237 6XX XXX XXX',
  disabled = false,
  className,
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers, + and spaces
    const cleaned = e.target.value.replace(/[^\d+\s]/g, '');
    onChange(cleaned);
  };

  return (
    <div className={cn('relative', className)}>
      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="tel"
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="pl-9"
      />
    </div>
  );
}
