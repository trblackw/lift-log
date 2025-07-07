import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GhostButton,
  DestructiveButton,
} from '@/components/ui/standardButtons';
import { cn } from '@/lib/utils';
import type { Exercise } from '@/lib/types';
import IconList from './icons/icon-list';

// Drag handle icon
function DragHandleIcon() {
  return (
    <svg
      className="w-4 h-4 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8h16M4 16h16"
      />
    </svg>
  );
}

// Individual exercise item that can be dragged
interface ExerciseItemProps {
  exercise: Exercise;
  isDragging?: boolean;
  isEditing?: boolean;
  onEdit?: (exercise: Exercise) => void;
  onRemove?: (exerciseId: string) => void;
  disabled?: boolean;
  showActions?: boolean;
  className?: string;
}

function ExerciseItem({
  exercise,
  isDragging = false,
  isEditing = false,
  onEdit,
  onRemove,
  disabled = false,
  showActions = true,
  className,
}: ExerciseItemProps) {
  return (
    <div
      className={cn(
        'p-3 lg:p-4 border rounded-lg transition-all duration-200',
        {
          'bg-primary/10 border-primary': isEditing,
          'bg-muted/30': !isEditing,
          'opacity-50': isDragging,
          'cursor-grabbing': isDragging,
          'cursor-grab': !isDragging && !disabled,
        },
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Drag Handle */}
        <div className="flex-shrink-0">
          <DragHandleIcon />
        </div>

        {/* Exercise Content */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm lg:text-base truncate">
            {exercise.name}
          </div>
          <div className="text-xs lg:text-sm text-muted-foreground mt-1">
            {exercise.duration
              ? `${exercise.duration} minutes`
              : `${exercise.sets} sets × ${exercise.reps} reps`}
            {exercise.weight && ` @ ${exercise.weight}lbs`}
          </div>
          {exercise.notes && (
            <div className="text-xs text-muted-foreground mt-1 italic">
              "{exercise.notes}"
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-1 shrink-0">
            <GhostButton
              size="sm"
              onClick={() => onEdit?.(exercise)}
              disabled={disabled}
              className="h-8 lg:h-9 px-2 lg:px-3 text-xs lg:text-sm"
            >
              Edit
            </GhostButton>
            <DestructiveButton
              size="sm"
              onClick={() => onRemove?.(exercise.id)}
              className="h-8 lg:h-9 px-2 lg:px-3 text-xs lg:text-sm"
            >
              Remove
            </DestructiveButton>
          </div>
        )}
      </div>
    </div>
  );
}

// Sortable wrapper for exercise item
interface SortableExerciseItemProps extends ExerciseItemProps {
  id: string;
}

function SortableExerciseItem({ id, ...props }: SortableExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ExerciseItem {...props} isDragging={isDragging} />
    </div>
  );
}

// Main ComposableExerciseList component
export interface ComposableExerciseListProps {
  exercises: Exercise[];
  onReorder: (exercises: Exercise[]) => void;
  onEdit?: (exercise: Exercise) => void;
  onRemove?: (exerciseId: string) => void;
  editingExercise?: Exercise | null;
  disabled?: boolean;
  showActions?: boolean;
  emptyMessage?: string;
  title?: string;
  className?: string;
  // Future: For cross-list dragging
  droppableId?: string;
  acceptsExternalDrags?: boolean;
  onExternalDrop?: (exercise: Exercise, targetIndex: number) => void;
}

export function ComposableExerciseList({
  exercises,
  onReorder,
  onEdit,
  onRemove,
  editingExercise,
  disabled = false,
  showActions = true,
  emptyMessage = 'No exercises added yet.',
  title,
  className,
  droppableId = 'exercise-list',
}: ComposableExerciseListProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to start drag (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = exercises.findIndex(ex => ex.id === active.id);
      const newIndex = exercises.findIndex(ex => ex.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedExercises = arrayMove(exercises, oldIndex, newIndex);
        onReorder(reorderedExercises);
      }
    }

    setActiveId(null);
  };

  const activeExercise = activeId
    ? exercises.find(ex => ex.id === activeId)
    : null;

  if (exercises.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        {title && <h4 className="font-medium text-sm lg:text-base">{title}</h4>}
        <div className="text-center py-8 text-muted-foreground">
          <IconList className="size-8 mb-2 mx-auto" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {title && <h4 className="font-medium text-sm lg:text-base">{title}</h4>}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises.map(ex => ex.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 lg:space-y-4">
            {exercises.map(exercise => (
              <SortableExerciseItem
                key={exercise.id}
                id={exercise.id}
                exercise={exercise}
                isEditing={editingExercise?.id === exercise.id}
                onEdit={onEdit}
                onRemove={onRemove}
                disabled={disabled || editingExercise !== null}
                showActions={showActions}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeExercise ? (
            <ExerciseItem
              exercise={activeExercise}
              isDragging
              showActions={false}
              className="rotate-3 shadow-lg"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Alternative layout for grid display (2 columns)
export interface ComposableExerciseGridProps
  extends ComposableExerciseListProps {
  columns?: number;
}

export function ComposableExerciseGrid({
  columns = 2,
  className,
  ...props
}: ComposableExerciseGridProps) {
  return (
    <div className={cn('', className)}>
      <ComposableExerciseList
        {...props}
        className={`grid grid-cols-1 lg:grid-cols-${columns} gap-3 lg:gap-4`}
      />
    </div>
  );
}
