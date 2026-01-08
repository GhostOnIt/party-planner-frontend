import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Image, CheckSquare, XSquare, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  PhotoGrid,
  PhotoUploader,
  PhotoLightbox,
  PhotoFilters,
} from '@/components/features/photos';
import {
  usePhotos,
  useUploadPhotos,
  useDeletePhoto,
  useDeletePhotos,
  useDownloadPhoto,
  useDownloadMultiplePhotos,
  useSetFeaturedPhoto,
} from '@/hooks/usePhotos';
import type { Photo, PhotoFilters as PhotoFiltersType } from '@/types';

interface PhotosPageProps {
  eventId?: string;
}

export function PhotosPage({ eventId: propEventId }: PhotosPageProps) {
  const { id: paramEventId } = useParams<{ id: string }>();
  const eventId = propEventId || paramEventId;
  const { toast } = useToast();

  const [filters, setFilters] = useState<PhotoFiltersType>({ per_page: 20 });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showUploader, setShowUploader] = useState(false);

  // Le mode sélection s'active automatiquement quand des photos sont sélectionnées
  const selectionMode = selectedIds.length > 0;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [showBatchDeleteDialog, setShowBatchDeleteDialog] = useState(false);

  // Track the photo ID when setting as featured to maintain lightbox position
  const featuredPhotoIdRef = useRef<number | null>(null);

  const { data: photosData, isLoading } = usePhotos(eventId!, filters);
  const { mutate: uploadPhotos, isPending: isUploading } = useUploadPhotos(eventId!);
  const { mutate: deletePhoto, isPending: isDeleting } = useDeletePhoto(eventId!);
  const { mutate: deletePhotos, isPending: isDeletingBatch } = useDeletePhotos(eventId!);
  const { mutate: downloadPhoto } = useDownloadPhoto(eventId!);
  const { mutate: downloadMultiplePhotos, isPending: isDownloadingMultiple } =
    useDownloadMultiplePhotos(eventId!);
  const { mutate: setFeaturedPhoto } = useSetFeaturedPhoto(eventId!);

  const photos = useMemo(() => photosData?.data || [], [photosData?.data]);
  const meta = photosData?.meta;

  // Maintain lightbox position when photos list changes (e.g., after setting featured)
  useEffect(() => {
    if (lightboxIndex !== null && photos.length > 0) {
      // If we're tracking a featured photo ID, find its new index
      if (featuredPhotoIdRef.current !== null) {
        const newIndex = photos.findIndex((p) => p.id === featuredPhotoIdRef.current);
        if (newIndex !== -1) {
          setLightboxIndex(newIndex);
          featuredPhotoIdRef.current = null; // Reset after updating
        }
      } else {
        // If lightbox is open but index is out of bounds, adjust it
        if (lightboxIndex >= photos.length) {
          setLightboxIndex(Math.max(0, photos.length - 1));
        }
      }
    }
  }, [photos, lightboxIndex]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleUpload = (files: File[]) => {
    uploadPhotos(
      { files, type: 'event_photo' },
      {
        onSuccess: (data) => {
          setShowUploader(false);
          toast({
            title: 'Photos ajoutees',
            description: `${data.data.length} photo(s) ajoutee(s) avec succes.`,
          });
        },
        onError: () => {
          toast({
            title: 'Erreur',
            description: 'Une erreur est survenue lors du telechargement.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleView = (photo: Photo) => {
    const index = photos.findIndex((p) => p.id === photo.id);
    if (index !== -1) {
      setLightboxIndex(index);
    }
  };

  const handleDelete = (photo: Photo) => {
    setPhotoToDelete(photo);
  };

  const handleDeleteConfirm = () => {
    if (photoToDelete) {
      deletePhoto(photoToDelete.id, {
        onSuccess: () => {
          setPhotoToDelete(null);
          // Close lightbox if deleting current photo
          if (lightboxIndex !== null && photos[lightboxIndex]?.id === photoToDelete.id) {
            setLightboxIndex(null);
          }
          toast({
            title: 'Photo supprimee',
            description: 'La photo a ete supprimee avec succes.',
          });
        },
      });
    }
  };

  const handleBatchDelete = () => {
    deletePhotos(selectedIds, {
      onSuccess: () => {
        setShowBatchDeleteDialog(false);
        setSelectedIds([]);
        toast({
          title: 'Photos supprimees',
          description: `${selectedIds.length} photo(s) supprimee(s) avec succes.`,
        });
      },
    });
  };

  const handleDownload = (photo: Photo) => {
    downloadPhoto(
      { photoId: photo.id, filename: photo.original_name },
      {
        onSuccess: () => {
          toast({
            title: 'Telechargement',
            description: 'Le telechargement a demarre.',
          });
        },
        onError: (error) => {
          toast({
            title: 'Erreur',
            description: error instanceof Error ? error.message : 'Erreur lors du telechargement.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleDownloadSelected = () => {
    if (selectedIds.length === 0) return;

    downloadMultiplePhotos(
      { photoIds: selectedIds },
      {
        onSuccess: () => {
          toast({
            title: 'Telechargement',
            description: `Le telechargement de ${selectedIds.length} photo(s) a demarre.`,
          });
        },
        onError: (error) => {
          toast({
            title: 'Erreur',
            description: error instanceof Error ? error.message : 'Erreur lors du telechargement.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleSetFeatured = (photo: Photo) => {
    // If lightbox is open, save the photo ID to track its position after reload
    if (lightboxIndex !== null) {
      const currentPhotoId = photos[lightboxIndex]?.id;
      // If we're setting the current photo as featured, it will move to index 0
      if (currentPhotoId === photo.id) {
        featuredPhotoIdRef.current = photo.id;
      } else {
        // If we're setting a different photo as featured, keep tracking the current one
        featuredPhotoIdRef.current = currentPhotoId;
      }
    }

    setFeaturedPhoto(photo.id, {
      onSuccess: () => {
        toast({
          title: 'Photo principale',
          description: 'La photo a ete definie comme photo principale.',
        });
        // The useEffect will handle updating the lightbox index
      },
    });
  };

  const selectAll = () => {
    setSelectedIds(photos.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  if (!eventId) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PhotoFilters filters={filters} onFiltersChange={setFilters} />

        <div className="flex items-center gap-2">
          {selectionMode && (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} selectionne(s)
              </span>
              <Button variant="outline" size="sm" onClick={selectAll}>
                <CheckSquare className="mr-2 h-4 w-4" />
                Tout
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSelected}
                disabled={isDownloadingMultiple}
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloadingMultiple ? 'Telechargement...' : 'Telecharger'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBatchDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer ({selectedIds.length})
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAll}>
                <XSquare className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </>
          )}
          <Button onClick={() => setShowUploader(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter des photos
          </Button>
        </div>
      </div>

      {/* Photos Grid */}
      {!isLoading && photos.length === 0 ? (
        <EmptyState
          icon={Image}
          title="Aucune photo"
          description={
            filters.search || filters.type
              ? 'Aucune photo ne correspond a vos criteres de recherche'
              : "Vous n'avez pas encore ajoute de photos. Commencez par en ajouter !"
          }
          action={
            !filters.search && !filters.type
              ? {
                  label: 'Ajouter des photos',
                  onClick: () => setShowUploader(true),
                }
              : undefined
          }
        />
      ) : (
        <>
          <PhotoGrid
            photos={photos}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            onView={handleView}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onSetFeatured={handleSetFeatured}
            selectionMode={selectionMode}
          />

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    className={cn(meta.current_page === 1 && 'pointer-events-none opacity-50')}
                  />
                </PaginationItem>

                {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                  .filter((page) => {
                    const current = meta.current_page;
                    return (
                      page === 1 ||
                      page === meta.last_page ||
                      (page >= current - 1 && page <= current + 1)
                    );
                  })
                  .map((page, index, array) => (
                    <PaginationItem key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === meta.current_page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    className={cn(
                      meta.current_page === meta.last_page && 'pointer-events-none opacity-50'
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Photo Uploader Modal */}
      <PhotoUploader
        open={showUploader}
        onOpenChange={setShowUploader}
        onUpload={handleUpload}
        isUploading={isUploading}
      />

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onDelete={handleDelete}
          onDownload={handleDownload}
          onSetFeatured={handleSetFeatured}
        />
      )}

      {/* Delete Single Photo Dialog */}
      <AlertDialog open={!!photoToDelete} onOpenChange={() => setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la photo</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer cette photo ? Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Multiple Photos Dialog */}
      <AlertDialog open={showBatchDeleteDialog} onOpenChange={setShowBatchDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer les photos selectionnees</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer {selectedIds.length} photo(s) ? Cette action est
              irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchDelete}
              disabled={isDeletingBatch}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingBatch ? 'Suppression...' : `Supprimer (${selectedIds.length})`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
