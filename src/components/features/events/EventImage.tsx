import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function EventImage({
  src,
  alt,
  className,
  fallbackClassName,
}: EventImageProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('w-full h-full object-cover', className)}
        onError={(e) => {
          // Replace with fallback on error
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) {
            fallback.style.display = 'flex';
          }
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-center',
        fallbackClassName
      )}
    >
      <ImageIcon className="w-12 h-12 text-[#d1d5db]" />
    </div>
  );
}

