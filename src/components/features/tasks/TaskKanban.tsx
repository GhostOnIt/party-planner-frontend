import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskCard } from './TaskCard';
import type { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

interface Column {
  id: TaskStatus;
  title: string;
  color: string;
}

const columns: Column[] = [
  { id: 'todo', title: 'À faire', color: 'border-l-muted-foreground' },
  { id: 'in_progress', title: 'En cours', color: 'border-l-info' },
  { id: 'completed', title: 'Terminé', color: 'border-l-success' },
  { id: 'cancelled', title: 'Annulé', color: 'border-l-destructive' },
];

interface TaskKanbanProps {
  tasks: Task[];
  isLoading?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onStatusChange: (taskId: number, status: TaskStatus) => void;
}

function SortableTaskCard({
  task,
  onEdit,
  onDelete,
  onComplete,
  onReopen,
  onStatusChange,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        onComplete={onComplete}
        onReopen={onReopen}
        onStatusChange={onStatusChange}
        isDragging={isDragging}
      />
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  onEdit,
  onDelete,
  onComplete,
  onReopen,
  onStatusChange,
}: {
  column: Column;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
  onReopen: (task: Task) => void;
  onStatusChange?: (task: Task, status: TaskStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col bg-muted/30 rounded-lg border-l-4 transition-colors',
        column.color,
        isOver && 'bg-muted/50 border-l-8'
      )}
    >
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {column.title}
          <span className="text-muted-foreground font-normal">({tasks.length})</span>
        </h3>
      </div>
      <div className="flex-1 p-2 space-y-2 min-h-[200px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onComplete={onComplete}
              onReopen={onReopen}
              onStatusChange={onStatusChange}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function TaskKanban({
  tasks,
  isLoading = false,
  onEdit,
  onDelete,
  onComplete,
  onReopen,
  onStatusChange,
}: TaskKanbanProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Check if dropped over a column
    const targetColumn = columns.find((col) => col.id === over.id);
    if (targetColumn && activeTask.status !== targetColumn.id) {
      onStatusChange(activeTask.id, targetColumn.id);
      return;
    }

    // Check if dropped over another task
    const overTask = tasks.find((t) => t.id === over.id);
    if (overTask && activeTask.status !== overTask.status) {
      onStatusChange(activeTask.id, overTask.status);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  const handleTaskStatusChange = (task: Task, status: TaskStatus) => {
    onStatusChange(task.id, status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.id)}
            onEdit={onEdit}
            onDelete={onDelete}
            onComplete={onComplete}
            onReopen={onReopen}
            onStatusChange={handleTaskStatusChange}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCard
            task={activeTask}
            onEdit={() => {}}
            onDelete={() => {}}
            onComplete={() => {}}
            onReopen={() => {}}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
