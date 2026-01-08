import { X, CheckSquare, Download, Loader2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDownload: () => void;
  onClose?: () => void;
  isDownloading: boolean;
  className?: string;
}

export function PhotoSelectionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDownload,
  onClose,
  isDownloading,
  className,
}: PhotoSelectionBarProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full',
        className
      )}
    >
      {/* Compteur avec style pillule */}
      <div className="flex items-center gap-3 self-start sm:self-auto">
        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary text-white text-xs font-semibold animate-in zoom-in-50 duration-300">
          {selectedCount}
        </span>
        <span className="text-sm font-medium text-slate-700">
          sélectionnée{selectedCount > 1 ? 's' : ''}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-slate-500 hover:text-primary hover:bg-primary/5 text-xs sm:text-sm font-normal h-9"
        >
          {allSelected ? (
            <>
              <Square className="mr-2 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tout désélectionner</span>
              <span className="sm:hidden">Tout vider</span>
            </>
          ) : (
            <>
              <CheckSquare className="mr-2 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tout sélectionner</span>
              <span className="sm:hidden">Tout</span>
            </>
          )}
        </Button>

        <div className="h-4 w-px bg-primary/20 mx-1 hidden sm:block" />

        <Button
          variant="default"
          size="sm"
          onClick={onDownload}
          disabled={selectedCount === 0 || isDownloading}
          className="bg-primary text-white hover:bg-primary/90 transition-all active:scale-95 h-9 px-4 rounded-full sm:rounded-md"
        >
          {isDownloading ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              <span className="hidden sm:inline">Téléchargement...</span>
              <span className="sm:hidden">Chargement...</span>
            </>
          ) : (
            <>
              <Download className="mr-2 h-3.5 w-3.5" />
              Télécharger
            </>
          )}
        </Button>

        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8 ml-1 shrink-0"
            title="Fermer la sélection"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
