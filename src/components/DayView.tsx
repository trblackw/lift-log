import { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PrimaryButton,
  OutlineButton,
  SecondaryButton,
} from '@/components/ui/standardButtons';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Tag } from '@/components/ui/Tag';
import { formatDuration } from '@/lib/utils';
import type { Workout, WorkoutSession, ScheduledWorkout } from '@/lib/types';
import IconCheckCircle from './icons/icon-check-circle';
import IconCalendar from './icons/icon-calendar';
import IconArmFlex from './icons/icon-arm-flex';
import IconCalendarEmpty from './icons/icon-calendar-empty';

interface DayViewProps {
  selectedDate: Date;
  workouts: Workout[];
  workoutSessions: WorkoutSession[];
  scheduledWorkouts?: ScheduledWorkout[];
  onDateChange: (date: Date) => void;
  onStartWorkout?: (workoutId: string) => void;
  onScheduleWorkout?: () => void;
  onBackToCalendar?: () => void;
}

export function DayView({
  selectedDate,
  workouts,
  workoutSessions,
  scheduledWorkouts = [],
  onDateChange,
  onStartWorkout,
  onScheduleWorkout,
  onBackToCalendar,
}: DayViewProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Get workouts for the selected date
  const getWorkoutsForDate = (date: Date) => {
    const sessionsForDate = workoutSessions.filter(
      session => session.completedAt && isSameDay(session.completedAt, date)
    );

    // Get workouts scheduled for this date (using workout-level scheduledDate)
    const scheduledForDate = workouts.filter(
      workout => workout.scheduledDate && isSameDay(workout.scheduledDate, date)
    );

    // Also check separate ScheduledWorkout instances if provided
    const scheduledInstancesForDate = scheduledWorkouts.filter(scheduled =>
      isSameDay(scheduled.scheduledDate, date)
    );

    return {
      sessions: sessionsForDate,
      scheduled: scheduledForDate,
      scheduledInstances: scheduledInstancesForDate,
    };
  };

  const dayWorkouts = getWorkoutsForDate(selectedDate);

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      setIsCalendarOpen(false);
    }
  };

  const getWorkoutById = (workoutId: string) => {
    return workouts.find(w => w.id === workoutId);
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="space-y-3">
        {/* Back button - full width on mobile */}
        {onBackToCalendar && (
          <div className="flex">
            <OutlineButton onClick={onBackToCalendar} size="sm">
              ← Calendar
            </OutlineButton>
          </div>
        )}

        {/* Date navigation */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-1">
            <OutlineButton
              onClick={() => navigateDay('prev')}
              size="sm"
              className="p-2 flex-shrink-0"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </OutlineButton>

            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <OutlineButton className="flex-1 justify-center text-xs sm:text-sm min-w-0">
                  <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">
                    {/* Show shorter format on mobile */}
                    <span className="hidden sm:inline">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </span>
                    <span className="sm:hidden">
                      {format(selectedDate, 'MMM d, yyyy')}
                    </span>
                  </span>
                </OutlineButton>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <OutlineButton
              onClick={() => navigateDay('next')}
              size="sm"
              className="p-2 flex-shrink-0"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </OutlineButton>
          </div>

          {onScheduleWorkout && (
            <PrimaryButton
              onClick={onScheduleWorkout}
              size="sm"
              className="flex-shrink-0"
            >
              <span className="hidden sm:inline">Schedule Workout</span>
              <span className="sm:hidden">Schedule</span>
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Day Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Workouts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCheckCircle className="size-6 text-green-600 dark:text-green-400" />
              Completed Workouts
              <span className="text-sm font-normal text-muted-foreground">
                ({dayWorkouts.sessions.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayWorkouts.sessions.length > 0 ? (
              <div className="space-y-4">
                {dayWorkouts.sessions.map(session => {
                  const workout = getWorkoutById(session.workoutId);
                  if (!workout) return null;

                  return (
                    <div
                      key={session.id}
                      className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{workout.name}</h3>
                        {session.completedAt && (
                          <span className="text-xs text-muted-foreground">
                            {format(session.completedAt, 'h:mm a')}
                          </span>
                        )}
                      </div>

                      {workout.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {workout.description}
                        </p>
                      )}

                      {/* Exercise Summary */}
                      <div className="text-sm text-muted-foreground mb-2">
                        {session.exercises.filter(ex => ex.completed).length} of{' '}
                        {session.exercises.length} exercises completed
                      </div>

                      {/* Duration Info */}
                      {session.actualDuration && (
                        <div className="text-sm mb-2">
                          <span className="font-medium text-green-600 dark:text-green-400">
                            Duration: {formatDuration(session.actualDuration)}
                          </span>
                          {workout.estimatedDuration && (
                            <span className="text-muted-foreground ml-2">
                              (est. {workout.estimatedDuration}m)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {workout.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {workout.tags.map(tag => (
                            <Tag key={tag.id} tag={tag} variant="default">
                              {tag.name}
                            </Tag>
                          ))}
                        </div>
                      )}

                      {session.notes && (
                        <div className="text-sm italic text-muted-foreground mt-2">
                          "{session.notes}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <div className="text-4xl mb-2">
                  <IconArmFlex className="size-12" />
                </div>
                <p>No workouts completed today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Workouts (from workout-level scheduledDate) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCalendar className="size-6 text-blue-600 dark:text-blue-500" />
              Scheduled Workouts
              <span className="text-sm font-normal text-muted-foreground">
                (
                {dayWorkouts.scheduled.length +
                  dayWorkouts.scheduledInstances.length}
                )
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dayWorkouts.scheduled.length > 0 ||
            dayWorkouts.scheduledInstances.length > 0 ? (
              <div className="space-y-4">
                {/* Workout-level scheduled dates */}
                {dayWorkouts.scheduled.map(workout => (
                  <div
                    key={workout.id}
                    className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{workout.name}</h3>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Scheduled
                      </span>
                    </div>

                    {workout.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {workout.description}
                      </p>
                    )}

                    {/* Exercise Info */}
                    <div className="text-sm text-muted-foreground mb-2">
                      {workout.exercises.length} exercises
                      {workout.estimatedDuration &&
                        ` • ${workout.estimatedDuration} min`}
                    </div>

                    {/* Tags */}
                    {workout.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {workout.tags.map(tag => (
                          <Tag key={tag.id} tag={tag} variant="default">
                            {tag.name}
                          </Tag>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    {onStartWorkout && (
                      <PrimaryButton
                        onClick={() => onStartWorkout(workout.id)}
                        size="sm"
                        className="w-full"
                      >
                        Start Workout
                      </PrimaryButton>
                    )}
                  </div>
                ))}

                {/* ScheduledWorkout instances */}
                {dayWorkouts.scheduledInstances.map(scheduled => {
                  const workout = getWorkoutById(scheduled.workoutId);
                  if (!workout) return null;

                  return (
                    <div
                      key={scheduled.id}
                      className={`p-4 rounded-lg border ${
                        scheduled.completed
                          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                          : 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{workout.name}</h3>
                        {scheduled.completed && scheduled.completedAt && (
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Completed {format(scheduled.completedAt, 'h:mm a')}
                          </span>
                        )}
                      </div>

                      {workout.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {workout.description}
                        </p>
                      )}

                      {/* Exercise Info */}
                      <div className="text-sm text-muted-foreground mb-2">
                        {workout.exercises.length} exercises
                        {workout.estimatedDuration &&
                          ` • ${workout.estimatedDuration} min`}
                      </div>

                      {/* Tags */}
                      {workout.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {workout.tags.map(tag => (
                            <Tag key={tag.id} tag={tag} variant="default">
                              {tag.name}
                            </Tag>
                          ))}
                        </div>
                      )}

                      {scheduled.notes && (
                        <div className="text-sm italic text-muted-foreground mb-3">
                          "{scheduled.notes}"
                        </div>
                      )}

                      {/* Action Button */}
                      {!scheduled.completed && onStartWorkout && (
                        <PrimaryButton
                          onClick={() => onStartWorkout(workout.id)}
                          size="sm"
                          className="w-full"
                        >
                          Start Workout
                        </PrimaryButton>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center rounded-md border border-muted-foreground/10 p-4 bg-foreground/5">
                <div className="text-4xl mb-2">
                  <IconCalendarEmpty className="size-12" />
                </div>
                <p>No workouts scheduled today</p>
                {onScheduleWorkout && (
                  <SecondaryButton
                    onClick={onScheduleWorkout}
                    size="sm"
                    className="mt-3"
                  >
                    Schedule a Workout
                  </SecondaryButton>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {onScheduleWorkout && (
              <SecondaryButton onClick={onScheduleWorkout}>
                Schedule New Workout
              </SecondaryButton>
            )}

            {/* Show available workouts to start */}
            {onStartWorkout && workouts.length > 0 && (
              <>
                <span className="text-sm text-muted-foreground self-center">
                  Quick start:
                </span>
                {workouts.slice(0, 3).map(workout => (
                  <OutlineButton
                    key={workout.id}
                    onClick={() => onStartWorkout(workout.id)}
                    size="sm"
                  >
                    {workout.name}
                  </OutlineButton>
                ))}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
