import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  Check,
  Loader2,
  X,
  MapPin,
  CalendarDays,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PhotoGrid, PhotoLightbox, PhotoSelectionBar } from '@/components/features/photos';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  usePublicPhotos,
  usePublicUploadPhotos,
  usePublicDownloadPhotos,
} from '@/hooks/usePublicPhotos';
import { getApiErrorMessage } from '@/api/client';
import type { Photo } from '@/types';
import logo from '@/assets/logo.png';

export function PublicPhotoUploadPage() {
  const { eventId, token } = useParams<{ eventId: string; token: string }>();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewHeight, setPreviewHeight] = useState('0px');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [filePreviews, setFilePreviews] = useState<{ file: File; preview: string }[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 40;

  const {
    data: photosData,
    isLoading,
    error,
    refetch,
  } = usePublicPhotos(eventId || '', token || '', { page: currentPage, per_page: perPage });

  const { mutate: uploadPhotos } = usePublicUploadPhotos(eventId || '', token || '');
  const { mutate: downloadPhotos, isPending: isDownloading } = usePublicDownloadPhotos(
    eventId || '',
    token || ''
  );

  const photos = photosData?.data || [];
  const event = photosData?.event;
  const guest = photosData?.guest;
  const meta = photosData?.meta;

  // Animation fluide pour l'ouverture de la zone de preview
  useEffect(() => {
    if (filePreviews.length > 0) {
      setPreviewHeight(`${previewRef.current?.scrollHeight}px`);
    } else {
      setPreviewHeight('0px');
    }
  }, [filePreviews]);

  // Détection du scroll pour réduire le header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newPreviews = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
    setSelectedFiles((prev) => [...prev, ...fileArray]);
  }, []);

  const removeFile = (index: number) => {
    setFilePreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    uploadPhotos(
      { files: selectedFiles },
      {
        onSuccess: () => {
          // Animation de succès
          filePreviews.forEach((fp) => URL.revokeObjectURL(fp.preview));
          setSelectedFiles([]);
          setFilePreviews([]);
          setIsUploading(false);
          refetch();
          toast({
            title: 'Photos envoyées',
            description: "Merci d'avoir partagé ces moments !",
            className: 'bg-white border-primary/20 text-slate-800',
          });
        },
        onError: (error) => {
          setIsUploading(false);
          toast({
            title: 'Erreur',
            description: getApiErrorMessage(error),
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleSelect = (ids: number[]) => {
    const numIds = ids.map((id) => (typeof id === 'string' ? parseInt(id, 10) : id));
    setSelectedIds(numIds);
  };

  const handleSelectAll = () => {
    // Sélectionner uniquement les photos de la page actuelle
    setSelectedIds(photos.map((p) => (typeof p.id === 'string' ? parseInt(p.id, 10) : p.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleCloseSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      // Si on désactive le mode, on vide aussi la sélection
      setSelectedIds([]);
    }
  };

  const handleDownload = () => {
    if (selectedIds.length === 0) return;
    const photoIds = selectedIds.map((id) => (typeof id === 'string' ? parseInt(id, 10) : id));

    downloadPhotos(
      { photoIds },
      {
        onSuccess: () => {
          toast({
            title: 'Téléchargement',
            description: 'Le téléchargement démarre...',
          });
        },
        onError: (error) => {
          toast({
            title: 'Erreur',
            description: getApiErrorMessage(error),
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleView = (photo: Photo) => {
    const photoId = typeof photo.id === 'string' ? parseInt(photo.id, 10) : photo.id;
    const index = photos.findIndex((p) => {
      const pId = typeof p.id === 'string' ? parseInt(p.id, 10) : p.id;
      return pId === photoId;
    });
    if (index !== -1) {
      setLightboxIndex(index);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
      </div>
    );
  }

  if (error || !photosData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="inline-flex p-4 bg-red-50 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-medium text-slate-900">Lien invalide</h1>
          <p className="text-slate-500">Ce lien de partage n'est plus accessible.</p>
        </div>
      </div>
    );
  }

  // Le mode sélection est maintenant géré par un état séparé

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-primary/10">
      {/* Header Minimaliste */}
      <header
        className={cn(
          'bg-white border-b border-slate-100 px-4 sticky top-0 z-10 bg-white/80 backdrop-blur-md transition-all duration-500 ease-in-out',
          isScrolled ? 'pt-3 pb-3' : 'pt-6 pb-6'
        )}
      >
        <div className="container mx-auto max-w-5xl">
          {/* Logo et titre de la plateforme */}
          <div
            className={cn(
              'flex items-center justify-center gap-2 transition-all duration-500 ease-in-out',
              isScrolled ? 'mb-0' : 'mb-4'
            )}
          >
            <img
              src={logo}
              alt="Party Planner"
              className={cn(
                'object-contain transition-all duration-500 ease-in-out',
                isScrolled ? 'h-5 w-5' : 'h-6 w-6'
              )}
            />
            <span
              className={cn(
                'font-semibold text-slate-600 transition-all duration-500 ease-in-out',
                isScrolled ? 'text-xs' : 'text-sm'
              )}
            >
              Party Planner
            </span>
          </div>

          {/* Contenu de l'événement - se cache au scroll */}
          <div
            className={cn(
              'text-center transition-all duration-500 ease-in-out overflow-hidden',
              isScrolled
                ? 'max-h-0 opacity-0 mt-0 space-y-0'
                : 'max-h-96 opacity-100 mt-0 space-y-2'
            )}
          >
            <h1
              className={cn(
                'font-light text-slate-900 tracking-tight transition-all duration-500 ease-in-out',
                isScrolled ? 'text-lg' : 'text-2xl md:text-3xl'
              )}
            >
              {event?.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              {event?.date && (
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(event.date).toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              )}
              {event?.location && (
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}
            </div>

            {guest && (
              <p className="text-slate-400 text-xs animate-in fade-in slide-in-from-bottom-2 duration-700">
                Bienvenue, {guest.name}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-12 space-y-8">
        {/* Description de la page */}
        <section className="max-w-3xl mx-auto text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="text-base text-slate-600 leading-relaxed">
            Partagez vos meilleurs moments de cet événement avec tous les participants. Vous pouvez
            ajouter vos photos et télécharger celles partagées par les autres invités.
          </p>
        </section>

        {/* Zone d'Upload Épurée */}
        <section className="max-w-3xl mx-auto">
          <div
            className={cn(
              'group relative rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center transition-all duration-500 ease-out',
              isDragging ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30',
              isUploading && 'opacity-50 pointer-events-none grayscale'
            )}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files);
            }}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0 z-50"
              onChange={(e) => {
                if (e.target.files) handleFileSelect(e.target.files);
              }}
              disabled={isUploading}
            />

            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'rounded-lg p-2 transition-all duration-500',
                  isDragging
                    ? 'bg-primary text-white'
                    : 'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                )}
              >
                {isDragging ? <ArrowDown className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                  {isDragging ? 'Déposez vos photos' : 'Ajouter des photos'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Glissez-déposez ou cliquez pour parcourir
                </p>
              </div>
            </div>
          </div>

          {/* Zone de Preview avec ouverture fluide "Accordéon" */}
          <div
            className="overflow-hidden transition-[max-height,opacity] duration-700 ease-in-out"
            style={{ maxHeight: previewHeight, opacity: filePreviews.length ? 1 : 0 }}
          >
            <div ref={previewRef} className="pt-8">
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-slate-600 pl-1">
                    {filePreviews.length} photos sélectionnées
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full px-3"
                    onClick={() => {
                      filePreviews.forEach((fp) => URL.revokeObjectURL(fp.preview));
                      setFilePreviews([]);
                      setSelectedFiles([]);
                    }}
                  >
                    Annuler
                  </Button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {filePreviews.map((filePreview, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100"
                    >
                      <img
                        src={filePreview.preview}
                        alt="Preview"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-red-500"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-center">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    size="lg"
                    className="px-8 py-6 text-base font-normal transition-all duration-300 hover:-translate-y-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Envoyer ces photos
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Galerie - Pleine largeur */}
      {photos.length > 0 && (
        <section className="w-full px-4 py-12 space-y-6">
          <div className="w-full">
            <div className="flex items-end justify-between border-b border-slate-100 pb-4 px-4">
              <h2 className="text-xl font-light text-slate-800">
                Galerie{' '}
                <span className="text-slate-300 ml-2 text-lg">{meta?.total ?? photos.length}</span>
              </h2>

              {!selectionMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleSelectionMode}
                  className="text-slate-400 hover:text-primary hover:bg-primary/5"
                >
                  Sélectionner
                </Button>
              )}
            </div>

            {selectionMode && (
              <div className="sticky top-24 z-20 animate-in fade-in slide-in-from-top-4 duration-500 px-4">
                <div className="bg-white/90 backdrop-blur rounded-2xl border border-white/50 p-2">
                  <PhotoSelectionBar
                    selectedCount={selectedIds.length}
                    totalCount={meta?.total ?? photos.length}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    onClose={handleCloseSelection}
                    onDownload={handleDownload}
                    isDownloading={isDownloading}
                  />
                </div>
              </div>
            )}

            <div className="w-full px-4 animate-in fade-in duration-1000 slide-in-from-bottom-8">
              <PhotoGrid
                photos={photos}
                selectedIds={selectedIds}
                onSelectChange={handleSelect}
                onView={handleView}
                onDelete={() => {}}
                onDownload={() => {}}
                onSetFeatured={() => {}}
                selectionMode={selectionMode}
              />
            </div>

            {/* Pagination */}
            {meta && (
              <div className="mt-8 px-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => {
                          if (meta.current_page > 1) {
                            setCurrentPage(meta.current_page - 1);
                            setSelectedIds([]);
                          }
                        }}
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
                          {index > 0 && array[index - 1] !== page - 1 && <PaginationEllipsis />}
                          <PaginationLink
                            onClick={() => {
                              setCurrentPage(page);
                              setSelectedIds([]);
                            }}
                            isActive={page === meta.current_page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => {
                          if (meta.current_page < meta.last_page) {
                            setCurrentPage(meta.current_page + 1);
                            setSelectedIds([]);
                          }
                        }}
                        className={cn(
                          meta.current_page === meta.last_page && 'pointer-events-none opacity-50'
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer Discret */}
      <footer className="py-12 text-center">
        <div className="inline-flex items-center justify-center p-4">
          <ImageIcon className="h-4 w-4 text-slate-300 mr-2" />
          <span className="text-xs text-slate-300 tracking-widest uppercase">Party Planner</span>
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onDownload={() => {}}
        />
      )}
    </div>
  );
}
