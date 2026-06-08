import { useState } from 'react';
import { Check, Download, MoreHorizontal, ShieldCheck, ShieldX, Star, Trash2, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClickableDiv } from '@/components/ui/clickable-div';
import { resolveUrl, cn } from '@/lib/utils';
import type { Photo } from '@/types';

interface PhotoCardProps {
  photo: Photo;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onView?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
  onDownload?: (photo: Photo) => void;
  onSetFeatured?: (photo: Photo) => void;
  onApprove?: (photo: Photo) => void;
  onReject?: (photo: Photo) => void;
  selectionMode?: boolean;
}

export function PhotoCard({
  photo,
  isSelected = false,
  onSelect,
  onView,
  onDelete,
  onDownload,
  onSetFeatured,
  onApprove,
  onReject,
  selectionMode = false,
}: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const moderationLabel = {
    pending: 'En attente',
    approved: 'Validee',
    rejected: 'Rejetee',
  }[photo.moderation_status || 'approved'];

  const handleClick = (e: React.MouseEvent) => {
    // Don't handle click if clicking on interactive elements (buttons, menus, etc.)
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[role="menuitem"]') ||
      target.closest('[role="menu"]') ||
      target.closest('[data-radix-popper-content-wrapper]') ||
      target.closest('[data-radix-dropdown-menu-content]')
    ) {
      return;
    }

    if (selectionMode && onSelect) {
      onSelect(photo.id);
    } else if (onView) {
      onView(photo);
    }
  };
  return (
    <ClickableDiv
      className={cn(
        'group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        selectionMode && 'cursor-pointer'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Image */}

      {imageError ? (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">Image non disponible</span>
        </div>
      ) : (
        <img
          src={resolveUrl(photo.thumbnail_url || photo.url)}
          alt={photo.caption || photo.original_name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      )}

      {/* Featured Badge */}
      {photo.is_featured && (
        <div className="absolute left-2 top-2 z-10 rounded-full bg-yellow-500 p-1">
          <Star className="h-3 w-3 fill-white text-white" />
        </div>
      )}

      {photo.moderation_status && photo.moderation_status !== 'approved' && (
        <Badge
          variant={photo.moderation_status === 'rejected' ? 'destructive' : 'secondary'}
          className="absolute right-2 top-2 z-10"
        >
          {moderationLabel}
        </Badge>
      )}

      {/* Selection Checkbox */}
      {(selectionMode || isHovered) && onSelect && (
        <ClickableDiv
          className="absolute left-2 top-2 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(photo.id);
          }}
        >
          <Checkbox
            checked={isSelected}
            className={cn(
              'h-5 w-5 border-2 border-white bg-black/20 data-[state=checked]:bg-primary',
              photo.is_featured && 'left-8'
            )}
          />
        </ClickableDiv>
      )}

      {/* Hover Overlay */}
      {(isHovered || isSelected || isDropdownOpen) && !selectionMode && (
        <div className="absolute inset-0 bg-black/40 transition-opacity">
          {/* Quick Actions */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(photo);
              }}
            >
              <ZoomIn className="h-4 w-4" />
              Voir
            </Button>

            <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} role="presentation">
              <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload?.(photo);
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Telecharger
                  </DropdownMenuItem>
                  {photo.moderation_status === 'pending' && onApprove && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onApprove(photo);
                      }}
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Valider
                    </DropdownMenuItem>
                  )}
                  {photo.moderation_status !== 'rejected' && onReject && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onReject(photo);
                      }}
                    >
                      <ShieldX className="mr-2 h-4 w-4" />
                      Rejeter
                    </DropdownMenuItem>
                  )}
                  {!photo.is_featured && photo.moderation_status === 'approved' && onSetFeatured && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetFeatured(photo);
                      }}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Definir comme photo principale
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(photo);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}

      {/* Caption/Info (shown when selected in selection mode) */}
      {isSelected && selectionMode && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
          <div className="rounded-full bg-primary p-2">
            <Check className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      )}
    </ClickableDiv>
  );
}
