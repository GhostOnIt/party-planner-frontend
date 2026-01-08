import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  UserCheck,
  UserX,
  Phone,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RsvpBadge } from './RsvpBadge';
import type { Guest } from '@/types';

interface GuestListProps {
  guests: Guest[];
  isLoading?: boolean;
  selectedIds: number[];
  onSelectChange: (ids: number[]) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
  onSendInvitation: (guest: Guest) => void;
  onCheckIn: (guest: Guest) => void;
  onUndoCheckIn: (guest: Guest) => void;
}

export function GuestList({
  guests,
  isLoading = false,
  selectedIds,
  onSelectChange,
  onEdit,
  onDelete,
  onSendInvitation,
  onCheckIn,
  onUndoCheckIn,
}: GuestListProps) {
  const allSelected = guests.length > 0 && selectedIds.length === guests.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < guests.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectChange([]);
    } else {
      onSelectChange(guests.map((g) => g.id));
    }
  };

  const handleSelectOne = (guestId: number) => {
    if (selectedIds.includes(guestId)) {
      onSelectChange(selectedIds.filter((id) => id !== guestId));
    } else {
      onSelectChange([...selectedIds, guestId]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                ref={(ref) => {
                  if (ref) {
                    (ref as HTMLButtonElement).dataset.state = someSelected
                      ? 'indeterminate'
                      : allSelected
                        ? 'checked'
                        : 'unchecked';
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Invite</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Statut RSVP</TableHead>
            <TableHead>+1</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => (
            <TableRow key={guest.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(guest.id)}
                  onCheckedChange={() => handleSelectOne(guest.id)}
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{guest.name}</p>
                  {guest.dietary_restrictions && (
                    <p className="text-xs text-muted-foreground">
                      {guest.dietary_restrictions}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {guest.email && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {guest.email}
                    </div>
                  )}
                  {guest.phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {guest.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <RsvpBadge status={guest.rsvp_status} />
              </TableCell>
              <TableCell>
                {guest.plus_one ? (
                  <div>
                    <Badge variant="outline">+1</Badge>
                    {guest.plus_one_name && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {guest.plus_one_name}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {guest.checked_in_at ? (
                  <div className="flex items-center gap-1 text-success">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-xs">
                      {format(parseISO(guest.checked_in_at), 'HH:mm', { locale: fr })}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(guest)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    {guest.email && !guest.invitation_sent_at && (
                      <DropdownMenuItem onClick={() => onSendInvitation(guest)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Envoyer invitation
                      </DropdownMenuItem>
                    )}
                    {guest.checked_in_at ? (
                      <DropdownMenuItem onClick={() => onUndoCheckIn(guest)}>
                        <UserX className="mr-2 h-4 w-4" />
                        Annuler check-in
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onCheckIn(guest)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Check-in
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(guest)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
