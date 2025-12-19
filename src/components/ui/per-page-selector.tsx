import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PerPageSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
}

const defaultOptions = [10, 20, 50, 100];

export function PerPageSelector({
  value,
  onChange,
  options = defaultOptions,
  className,
}: PerPageSelectorProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Afficher</span>
        <Select
          value={String(value)}
          onValueChange={(v) => onChange(Number(v))}
        >
          <SelectTrigger className="w-[80px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground whitespace-nowrap">par page</span>
      </div>
    </div>
  );
}
