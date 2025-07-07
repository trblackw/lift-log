import {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
} from '@/components/ui/standardButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Workout } from '@/lib/types';

interface WorkoutDetailsProps {
  workout: Workout;
  onEdit: (workout: Workout) => void;
  onStart: (workoutId: string) => void;
  onBack: () => void;
}

export function WorkoutDetails({
  workout,
  onEdit,
  onStart,
  onBack,
}: WorkoutDetailsProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                {workout.name}
              </h1>
              {workout.description && (
                <p className="text-muted-foreground text-sm lg:text-base">
                  {workout.description}
                </p>
              )}
            </div>
            <OutlineButton size="sm" onClick={onBack} className="shrink-0">
              ← Back
            </OutlineButton>
          </div>

          <div className="flex flex-wrap gap-4 text-sm lg:text-base text-muted-foreground mb-6">
            <span>
              {workout.exercises.length} exercise
              {workout.exercises.length !== 1 ? 's' : ''}
            </span>
            {workout.estimatedDuration && (
              <span>{workout.estimatedDuration} minutes</span>
            )}
            <span>Created {formatDate(workout.createdAt)}</span>
            {workout.updatedAt.getTime() !== workout.createdAt.getTime() && (
              <span>Updated {formatDate(workout.updatedAt)}</span>
            )}
          </div>

          <div className="flex gap-3">
            <PrimaryButton
              onClick={() => onStart(workout.id)}
              className="flex-1 lg:flex-none lg:px-8"
            >
              Start
            </PrimaryButton>
            <SecondaryButton
              onClick={() => onEdit(workout)}
              className="flex-1 lg:flex-none lg:px-8"
            >
              Edit
            </SecondaryButton>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {workout.tags.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {workout.tags.map(tag => (
                <span
                  key={tag.id}
                  className="px-3 py-1.5 rounded-full text-sm text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl">
            Exercises ({workout.exercises.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {index + 1}
                      </span>
                      <h3 className="font-medium text-base lg:text-lg">
                        {exercise.name}
                      </h3>
                    </div>

                    <div className="ml-9 space-y-2">
                      <div className="flex flex-wrap gap-4 text-sm lg:text-base">
                        {exercise.duration ? (
                          <span>
                            <strong>Duration:</strong> {exercise.duration}{' '}
                            minutes
                          </span>
                        ) : (
                          <>
                            {exercise.sets && (
                              <span>
                                <strong>Sets:</strong> {exercise.sets}
                              </span>
                            )}
                            {exercise.reps && (
                              <span>
                                <strong>Reps:</strong> {exercise.reps}
                              </span>
                            )}
                          </>
                        )}
                        {exercise.weight && (
                          <span>
                            <strong>Weight:</strong> {exercise.weight}lbs
                          </span>
                        )}
                        {exercise.restTime && (
                          <span>
                            <strong>Rest:</strong> {exercise.restTime}s
                          </span>
                        )}
                      </div>

                      {exercise.notes && (
                        <div className="text-sm lg:text-base text-muted-foreground italic">
                          <strong>Notes:</strong> {exercise.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
