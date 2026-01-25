import { Link } from 'react-router-dom';
import { CheckSquare, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
 import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';

const priorityConfig = {
  high: {
    label: 'Haute',
    color: 'bg-priority-high text-white',
  },
  medium: {
    label: 'Moyenne',
    color: 'bg-priority-medium text-white',
  },
  low: {
    label: 'Basse',
    color: 'bg-priority-low text-white',
  },
};

interface UrgentTasksProps {
  tasks: Task[];
  isLoading?: boolean;
}

export function UrgentTasks({
  tasks,
  isLoading = false,
}: UrgentTasksProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Taches urgentes</CardTitle>
          <CardDescription>Taches a traiter en priorite</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getDueDateInfo = (dueDate: string | null) => {
    if (!dueDate) return null;

    const date = parseISO(dueDate);
    const isOverdue = isPast(date) && !isToday(date);
    const isDueToday = isToday(date);

    return {
      formatted: format(date, 'dd MMM', { locale: fr }),
      isOverdue,
      isDueToday,
    };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Taches urgentes</CardTitle>
          <CardDescription>Taches a traiter en priorite</CardDescription>
        </div>
        <Link to="/events">
          <Button variant="ghost" size="sm" className="gap-1">
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Aucune tache urgente"
            description="Vous n'avez pas de tache urgente a traiter"
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => {
              const dueDateInfo = getDueDateInfo(task.due_date);
              const priorityInfo = priorityConfig[task.priority] || priorityConfig.medium;
              // Handle different API field names
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const taskTitle = task.title || (task as any).name || 'Tâche sans nom';
              const taskId = task.id || index;

              return (
                <div
                  key={taskId}
                  className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                   
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'font-medium',
                          task.status === 'completed' && 'line-through text-muted-foreground'
                        )}
                      >
                        {taskTitle}
                      </span>
                      <Badge className={cn('shrink-0', priorityInfo.color)}>
                        {priorityInfo.label}
                      </Badge>
                    </div>
                    {dueDateInfo && (
                      <div
                        className={cn(
                          'mt-1 flex items-center gap-1 text-sm',
                          dueDateInfo.isOverdue
                            ? 'text-destructive'
                            : dueDateInfo.isDueToday
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        )}
                      >
                        {dueDateInfo.isOverdue ? (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        ) : (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                        {dueDateInfo.isOverdue
                          ? `En retard - ${dueDateInfo.formatted}`
                          : dueDateInfo.isDueToday
                          ? "Aujourd'hui"
                          : dueDateInfo.formatted}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
