import {
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  RotateCcw,
  Calendar,
  User,
  Circle,
  Clock,
  XCircle,
} from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PriorityBadge } from './PriorityBadge';
import { TaskStatusBadge } from './TaskStatusBadge';
import type { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusOptions: { value: TaskStatus; label: string; icon: typeof Circle }[] = [
  { value: 'todo', label: 'À faire', icon: Circle },
  { value: 'in_progress', label: 'En cours', icon: Clock },
  { value: 'completed', label: 'Terminé', icon: CheckCircle },
  { value: 'cancelled', label: 'Annulé', icon: XCircle },
];

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
}

export function TaskList({
  tasks,
  isLoading = false,
  onEdit,
  onDelete,
  onComplete,
  onReopen,
  onStatusChange,
}: TaskListProps) {
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
            <TableHead className="w-12"></TableHead>
            <TableHead>Tache</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Priorite</TableHead>
            <TableHead>Echeance</TableHead>
            <TableHead>Assigne</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && task.status !== 'completed';
            const isDueToday = task.due_date && isToday(parseISO(task.due_date));
            const isCompleted = task.status === 'completed';

            return (
              <TableRow key={task.id} className={cn(isCompleted && 'opacity-60')}>
                <TableCell>
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => isCompleted ? onReopen(task) : onComplete(task)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className={cn('font-medium', isCompleted && 'line-through text-muted-foreground')}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <TaskStatusBadge status={task.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={task.priority} />
                </TableCell>
                <TableCell>
                  {task.due_date ? (
                    <div
                      className={cn(
                        'flex items-center gap-1 text-sm',
                        isOverdue && 'text-destructive',
                        isDueToday && !isOverdue && 'text-warning'
                      )}
                    >
                      <Calendar className="h-3 w-3" />
                      {format(parseISO(task.due_date), 'dd MMM yyyy', { locale: fr })}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {task.assignee ? (
                    <div className="flex items-center gap-1 text-sm">
                      <User className="h-3 w-3" />
                      {task.assignee.name}
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
                      <DropdownMenuItem onClick={() => onEdit(task)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      {onStatusChange ? (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Changer le statut
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {statusOptions.map((option) => {
                              const Icon = option.icon;
                              return (
                                <DropdownMenuItem
                                  key={option.value}
                                  onClick={() => onStatusChange(task, option.value)}
                                  disabled={task.status === option.value}
                                  className={cn(task.status === option.value && 'bg-accent')}
                                >
                                  <Icon className="mr-2 h-4 w-4" />
                                  {option.label}
                                  {task.status === option.value && (
                                    <CheckCircle className="ml-auto h-4 w-4 text-primary" />
                                  )}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      ) : (
                        <>
                          {isCompleted ? (
                            <DropdownMenuItem onClick={() => onReopen(task)}>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Rouvrir
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => onComplete(task)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Terminer
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(task)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
