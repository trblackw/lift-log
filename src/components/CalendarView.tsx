import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrimaryButton, OutlineButton } from '@/components/ui/standardButtons';
import { format, isSameDay } from 'date-fns';
import type { Workout, WorkoutSession, ScheduledWorkout } from '@/lib/types';
import IconCalendar from './icons/icon-calendar';

interface CalendarViewProps {
  workouts: Workout[];
  workoutSessions: WorkoutSession[];
  scheduledWorkouts?: ScheduledWorkout[];
  onSelectDate: (date: Date) => void;
  onScheduleWorkout?: () => void;
}

export function CalendarView({
  workouts,
  workoutSessions,
  scheduledWorkouts = [],
  onSelectDate,
  onScheduleWorkout,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Get workouts for the selected date
  const getWorkoutsForDate = (date: Date) => {
    const sessionsForDate = workoutSessions.filter(
      session => session.completedAt && isSameDay(session.completedAt, date)
    );

    const scheduledForDate = scheduledWorkouts.filter(scheduled =>
      isSameDay(scheduled.scheduledDate, date)
    );

    return { sessions: sessionsForDate, scheduled: scheduledForDate };
  };

  // Check if a date has any workouts
  const hasWorkoutsOnDate = (date: Date) => {
    const { sessions, scheduled } = getWorkoutsForDate(date);
    return sessions.length > 0 || scheduled.length > 0;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onSelectDate(date);
    }
  };

  const selectedDateWorkouts = getWorkoutsForDate(selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Workout Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Track your workout schedule and progress
          </p>
        </div>
        {onScheduleWorkout && (
          <PrimaryButton onClick={onScheduleWorkout} size="sm">
            Schedule Workout
          </PrimaryButton>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{format(selectedDate, 'MMMM yyyy')}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border w-full"
                modifiers={{
                  hasWorkouts: date => hasWorkoutsOnDate(date),
                }}
                modifiersStyles={{
                  hasWorkouts: {
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    borderRadius: '50%',
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {format(selectedDate, 'EEEE, MMMM d')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Completed Workouts */}
              {selectedDateWorkouts.sessions.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm text-green-600 dark:text-green-400 mb-2">
                    ✅ Completed ({selectedDateWorkouts.sessions.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedDateWorkouts.sessions.map(session => {
                      const workout = workouts.find(
                        w => w.id === session.workoutId
                      );
                      return (
                        <div
                          key={session.id}
                          className="p-2 bg-green-50 dark:bg-green-950 rounded border"
                        >
                          <p className="font-medium text-sm">
                            {workout?.name || 'Unknown Workout'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.completedAt &&
                              format(session.completedAt, 'h:mm a')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Scheduled Workouts */}
              {selectedDateWorkouts.scheduled.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm text-blue-600 dark:text-blue-400 mb-2">
                    <IconCalendar className="size-5" /> Scheduled (
                    {selectedDateWorkouts.scheduled.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedDateWorkouts.scheduled.map(scheduled => {
                      const workout = workouts.find(
                        w => w.id === scheduled.workoutId
                      );
                      return (
                        <div
                          key={scheduled.id}
                          className={`p-2 rounded border ${
                            scheduled.completed
                              ? 'bg-green-50 dark:bg-green-950'
                              : 'bg-blue-50 dark:bg-blue-950'
                          }`}
                        >
                          <p className="font-medium text-sm">
                            {workout?.name || 'Unknown Workout'}
                          </p>
                          {scheduled.notes && (
                            <p className="text-xs text-muted-foreground">
                              {scheduled.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No workouts message */}
              {selectedDateWorkouts.sessions.length === 0 &&
                selectedDateWorkouts.scheduled.length === 0 && (
                  <div className="text-center py-6">
                    <div className="text-2xl mb-2 flex justify-center">
                      <IconCalendar className="size-5" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      No workouts on this day
                    </p>
                    {onScheduleWorkout && (
                      <OutlineButton
                        onClick={onScheduleWorkout}
                        size="sm"
                        className="mt-3"
                      >
                        Schedule Workout
                      </OutlineButton>
                    )}
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium">
                    {
                      workoutSessions.filter(
                        session =>
                          session.completedAt &&
                          session.completedAt.getMonth() ===
                            selectedDate.getMonth() &&
                          session.completedAt.getFullYear() ===
                            selectedDate.getFullYear()
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Scheduled:</span>
                  <span className="font-medium">
                    {
                      scheduledWorkouts.filter(
                        scheduled =>
                          scheduled.scheduledDate.getMonth() ===
                            selectedDate.getMonth() &&
                          scheduled.scheduledDate.getFullYear() ===
                            selectedDate.getFullYear()
                      ).length
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
