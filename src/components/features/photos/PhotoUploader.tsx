import { useCallback, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => void;
  isUploading?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

interface FilePreview {
  file: File;
  preview: string;
}

const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const DEFAULT_MAX_SIZE_MB = 10;
const DEFAULT_MAX_FILES = 20;

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function PhotoUploader({
  open,
  onOpenChange,
  onUpload,
  isUploading = false,
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: PhotoUploaderProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `"${file.name}" n'est pas un type de fichier accepte`;
      }
      if (file.size > maxSizeBytes) {
        return `"${file.name}" depasse la taille maximale de ${maxSizeMB}MB`;
      }
      return null;
    },
    [acceptedTypes, maxSizeBytes, maxSizeMB]
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const newErrors: string[] = [];
      const validFiles: FilePreview[] = [];

      const remainingSlots = maxFiles - files.length;
      if (fileArray.length > remainingSlots) {
        newErrors.push(`Vous ne pouvez ajouter que ${remainingSlots} fichier(s) de plus`);
      }

      fileArray.slice(0, remainingSlots).forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(error);
        } else {
          // Check for duplicates
          const isDuplicate = files.some(
            (f) => f.file.name === file.name && f.file.size === file.size
          );
          if (!isDuplicate) {
            validFiles.push({
              file,
              preview: URL.createObjectURL(file),
            });
          }
        }
      });

      setErrors(newErrors);
      setFiles((prev) => [...prev, ...validFiles]);
    },
    [files, maxFiles, validateFile]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
    setErrors([]);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      addFiles(selectedFiles);
    }
    // Reset input
    e.target.value = '';
  };

  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files.map((f) => f.file));
    }
  };

  const handleClose = () => {
    // Cleanup previews
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setErrors([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter des photos</DialogTitle>
          <DialogDescription>
            Glissez-deposez vos photos ou cliquez pour selectionner des fichiers.
            Maximum {maxFiles} photos, {maxSizeMB}MB par fichier.
          </DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          className={cn(
            'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            files.length >= maxFiles && 'pointer-events-none opacity-50'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleFileInput}
            disabled={files.length >= maxFiles || isUploading}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
              {isDragging ? 'Deposez les fichiers ici' : 'Glissez-deposez des photos'}
            </p>
            <p className="text-xs text-muted-foreground">
              ou cliquez pour parcourir
            </p>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="rounded-md bg-destructive/10 p-3">
            <ul className="list-inside list-disc text-sm text-destructive">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview Grid */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {files.length} fichier(s) selectionne(s)
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  files.forEach((f) => URL.revokeObjectURL(f.preview));
                  setFiles([]);
                  setErrors([]);
                }}
                disabled={isUploading}
              >
                Tout supprimer
              </Button>
            </div>

            <div className="grid max-h-60 grid-cols-4 gap-2 overflow-y-auto rounded-md border p-2">
              {files.map((file, index) => (
                <div key={index} className="group relative aspect-square">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="h-full w-full rounded object-cover"
                  />
                  <button
                    type="button"
                    className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-1 py-0.5 text-[10px] text-white">
                    {formatFileSize(file.file.size)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Telechargement en cours...</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Annuler
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Telechargement...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Telecharger {files.length > 0 && `(${files.length})`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
