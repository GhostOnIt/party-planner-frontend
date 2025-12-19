import { useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Download, Star, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getStorageUrl } from '@/api/client';
import type { Photo } from '@/types';

interface PhotoLightboxProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDelete?: (photo: Photo) => void;
  onDownload?: (photo: Photo) => void;
  onSetFeatured?: (photo: Photo) => void;
}

export function PhotoLightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
  onDelete,
  onDownload,
  onSetFeatured,
}: PhotoLightboxProps) {
  const currentPhoto = photos[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, hasPrevious, onNavigate]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, hasNext, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handlePrevious, handleNext, onClose]);

  if (!currentPhoto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/80">
            {currentIndex + 1} / {photos.length}
          </span>
          {currentPhoto.caption && (
            <span className="text-sm text-white">{currentPhoto.caption}</span>
          )}
          {currentPhoto.is_featured && (
            <div className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              <span className="text-xs text-yellow-500">Photo principale</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onDownload && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => onDownload(currentPhoto)}
            >
              <Download className="h-5 w-5" />
            </Button>
          )}
          {onSetFeatured && !currentPhoto.is_featured && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => onSetFeatured(currentPhoto)}
            >
              <Star className="h-5 w-5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-destructive/80"
              onClick={() => onDelete(currentPhoto)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Image */}
      <div
        className="flex h-full w-full items-center justify-center p-16"
        onClick={onClose}
      >
        <img
          src={getStorageUrl(currentPhoto.url)}
          alt={currentPhoto.caption || currentPhoto.original_name}
          className="max-h-full max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute left-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70',
          !hasPrevious && 'invisible'
        )}
        onClick={handlePrevious}
        disabled={!hasPrevious}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute right-4 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70',
          !hasNext && 'invisible'
        )}
        onClick={handleNext}
        disabled={!hasNext}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Thumbnails Strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex justify-center gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              className={cn(
                'h-16 w-16 flex-shrink-0 overflow-hidden rounded transition-all',
                index === currentIndex
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                  : 'opacity-50 hover:opacity-100'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(index);
              }}
            >
              <img
                src={getStorageUrl(photo.thumbnail_url || photo.url)}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
