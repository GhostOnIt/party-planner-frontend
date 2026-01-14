import {
  Calendar,
  User,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  RotateCcw,
  Circle,
  Clock,
  XCircle,
} from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { PriorityBadge } from './PriorityBadge';
import type { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusOptions: { value: TaskStatus; label: string; icon: typeof Circle }[] = [
  { value: 'todo', label: 'À faire', icon: Circle },
  { value: 'in_progress', label: 'En cours', icon: Clock },
  { value: 'completed', label: 'Terminé', icon: CheckCircle },
  { value: 'cancelled', label: 'Annulé', icon: XCircle },
];

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
  isDragging?: boolean;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
  onReopen,
  onStatusChange,
  isDragging = false,
}: TaskCardProps) {
  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && task.status !== 'completed';
  const isDueToday = task.due_date && isToday(parseISO(task.due_date));
  const isCompleted = task.status === 'completed';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg',
        isCompleted && 'opacity-60'
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                'font-medium text-sm',
                isCompleted && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                <MoreHorizontal className="h-3 w-3" />
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
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <PriorityBadge priority={task.priority} />

          {task.due_date && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue && 'text-destructive',
                isDueToday && !isOverdue && 'text-warning',
                !isOverdue && !isDueToday && 'text-muted-foreground'
              )}
            >
              <Calendar className="h-3 w-3" />
              {format(parseISO(task.due_date), 'dd MMM', { locale: fr })}
            </div>
          )}

          {task.assigned_user && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {task.assigned_user.name}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
