import { Skeleton } from '@/components/ui/skeleton';
import { PhotoCard } from './PhotoCard';
import type { Photo } from '@/types';

interface PhotoGridProps {
  photos: Photo[];
  isLoading?: boolean;
  selectedIds: number[];
  onSelectChange: (ids: number[]) => void;
  onView: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
  onDownload: (photo: Photo) => void;
  onSetFeatured?: (photo: Photo) => void;
  selectionMode?: boolean;
}

export function PhotoGrid({
  photos,
  isLoading = false,
  selectedIds,
  onSelectChange,
  onView,
  onDelete,
  onDownload,
  onSetFeatured,
  selectionMode = false,
}: PhotoGridProps) {
  const handleSelect = (id: number) => {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (selectedIds.includes(numId)) {
      onSelectChange(selectedIds.filter((i) => i !== numId));
    } else {
      onSelectChange([...selectedIds, numId]);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {photos.map((photo) => {
        const photoId = typeof photo.id === 'string' ? parseInt(photo.id, 10) : photo.id;
        return (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isSelected={selectedIds.includes(photoId)}
            onSelect={handleSelect}
            onView={onView}
            onDelete={onDelete}
            onDownload={onDownload}
            onSetFeatured={onSetFeatured}
            selectionMode={selectionMode}
          />
        );
      })}
    </div>
  );
}
