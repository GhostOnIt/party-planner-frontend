import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, List, LayoutGrid, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  TaskFilters,
  TaskList,
  TaskKanban,
  TaskForm,
} from '@/components/features/tasks';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useCompleteTask,
  useReopenTask,
} from '@/hooks/useTasks';
import { useCollaborators } from '@/hooks/useCollaborators';
import { PermissionGuard } from '@/components/ui/permission-guard';
import { useTasksPermissions } from '@/hooks/usePermissions';
import type { Task, TaskFilters as TaskFiltersType, CreateTaskFormData, TaskStatus } from '@/types';

interface TasksPageProps {
  eventId?: string;
}

export function TasksPage({ eventId: propEventId }: TasksPageProps) {
  const { id: paramEventId } = useParams<{ id: string }>();
  const eventId = propEventId || paramEventId;
  const { toast } = useToast();

  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const { data: tasksData, isLoading } = useTasks(eventId!, filters);
  const { mutate: createTask, isPending: isCreating } = useCreateTask(eventId!);
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(eventId!);
  const { mutate: deleteTask, isPending: isDeleting } = useDeleteTask(eventId!);
  const { mutate: completeTask } = useCompleteTask(eventId!);
  const { mutate: reopenTask } = useReopenTask(eventId!);
  const tasksPermissions = useTasksPermissions(eventId!);
  const { data: collaboratorsData } = useCollaborators(eventId!);

  const tasks = tasksData?.data || [];
  const collaborators =
    collaboratorsData?.data?.map((c) => ({ id: c.user_id, name: c.user.name })) || [];

  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSubmit = (data: CreateTaskFormData) => {
    if (editingTask) {
      updateTask(
        { taskId: editingTask.id, data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingTask(undefined);
            toast({
              title: 'Tache modifiee',
              description: 'La tache a ete modifiee avec succes.',
            });
          },
        }
      );
    } else {
      createTask(data, {
        onSuccess: () => {
          setShowForm(false);
          toast({
            title: 'Tache creee',
            description: 'La tache a ete creee avec succes.',
          });
        },
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id, {
        onSuccess: () => {
          setTaskToDelete(null);
          toast({
            title: 'Tache supprimee',
            description: 'La tache a ete supprimee avec succes.',
          });
        },
      });
    }
  };

  const handleComplete = (task: Task) => {
    completeTask(task.id, {
      onSuccess: () => {
        toast({
          title: 'Tache terminee',
          description: `"${task.title}" a ete marquee comme terminee.`,
        });
      },
    });
  };

  const handleReopen = (task: Task) => {
    reopenTask(task.id, {
      onSuccess: () => {
        toast({
          title: 'Tache rouverte',
          description: `"${task.title}" a ete rouverte.`,
        });
      },
    });
  };

  const handleStatusChange = (taskId: number, status: TaskStatus) => {
    updateTask(
      { taskId, data: { status } },
      {
        onSuccess: () => {
          toast({
            title: 'Statut mis a jour',
            description: 'Le statut de la tache a ete mis a jour.',
          });
        },
      }
    );
  };

  if (!eventId) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TaskFilters filters={filters} onFiltersChange={setFilters} />

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'kanban')}>
            <TabsList>
              <TabsTrigger value="kanban" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <List className="h-4 w-4" />
                Liste
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <PermissionGuard eventId={eventId!} permissions={['tasks.create']}>
            <Button onClick={handleAddTask}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle tache
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Tasks View */}
      <PermissionGuard
        eventId={eventId!}
        permissions={['tasks.view']}
        fallback={
          <EmptyState
            icon={CheckSquare}
            title="Accès restreint"
            description="Vous n'avez pas les permissions nécessaires pour consulter les tâches de cet événement."
          />
        }
      >
        {!isLoading && tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Aucune tache"
            description={
              filters.status || filters.priority
                ? 'Aucune tache ne correspond a vos criteres'
                : "Vous n'avez pas encore cree de taches. Commencez par en ajouter une !"
            }
            action={
              !filters.status && !filters.priority && tasksPermissions.canCreate
                ? {
                    label: 'Creer une tache',
                    onClick: handleAddTask,
                  }
                : undefined
            }
          />
        ) : viewMode === 'kanban' ? (
          <TaskKanban
            tasks={tasks}
            isLoading={isLoading}
            onEdit={handleEditTask}
            onDelete={setTaskToDelete}
            onComplete={handleComplete}
            onReopen={handleReopen}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onEdit={handleEditTask}
            onDelete={setTaskToDelete}
            onComplete={handleComplete}
            onReopen={handleReopen}
            onStatusChange={(task, status) => handleStatusChange(task.id, status)}
          />
        )}
      </PermissionGuard>

      {/* Task Form Modal */}
      <TaskForm
        open={showForm}
        onOpenChange={setShowForm}
        task={editingTask}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
        collaborators={collaborators}
        canAssign={tasksPermissions.canAssign}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la tache</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir supprimer "{taskToDelete?.title}" ? Cette action est
              irreversible.
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
    </div>
  );
}
