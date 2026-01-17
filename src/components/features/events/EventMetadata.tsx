import { Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventMetadataProps {
  date: string;
  time?: string;
  location?: string;
  className?: string;
}

export function EventMetadata({
  date,
  time,
  location,
  className,
}: EventMetadataProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm text-[#6b7280]">
        <Calendar className="w-4 h-4 shrink-0" />
        <span>
          {date}
          {time && ` à ${time}`}
        </span>
      </div>
      {location && (
        <div className="flex items-center gap-2 text-sm text-[#6b7280]">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
      )}
    </div>
  );
}

