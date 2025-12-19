import { useCallback, useState } from 'react';
import { Upload, X, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelected,
  accept = 'image/*',
  multiple = false,
  maxSize = 5,
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[]) => {
      const validFiles: File[] = [];
      const maxSizeBytes = maxSize * 1024 * 1024;

      for (const file of files) {
        if (file.size > maxSizeBytes) {
          setError(`Le fichier "${file.name}" depasse ${maxSize}MB`);
          continue;
        }
        validFiles.push(file);
      }

      return validFiles;
    },
    [maxSize]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      setError(null);

      const fileArray = Array.from(files);
      const validFiles = validateFiles(fileArray);

      if (validFiles.length > 0) {
        const newFiles = multiple ? [...selectedFiles, ...validFiles] : validFiles;
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);
      }
    },
    [multiple, selectedFiles, validateFiles, onFilesSelected]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="mb-1 text-sm font-medium">
          Glissez-deposez vos fichiers ici
        </p>
        <p className="text-xs text-muted-foreground">ou</p>
        <label className="mt-2">
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleFiles(e.target.files)}
            disabled={disabled}
            className="sr-only"
          />
          <Button type="button" variant="outline" size="sm" disabled={disabled} asChild>
            <span>Parcourir</span>
          </Button>
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          Taille max: {maxSize}MB
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <div className="flex items-center gap-2">
                <FileIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024 / 1024).toFixed(2)}MB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
