import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectItem } from '@/components/ui/select';
import { PrimaryButton } from '@/components/ui/standardButtons';
import { AppSidebarLayout } from './components/SidebarNavigation';
import { WorkoutForm } from './components/WorkoutForm';
import { WorkoutList } from './components/WorkoutList';
import { WorkoutDetails } from './components/WorkoutDetails';
import { CalendarView } from './components/CalendarView';
import { DayView } from './components/DayView';
import { ActiveWorkout } from './components/ActiveWorkout';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ThemeProvider } from './lib/theme';
import { storage } from './lib/storage';
import type {
  ViewMode,
  Workout,
  WorkoutSession,
  ActiveWorkoutSession,
} from './lib/types';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkoutSession, setActiveWorkoutSession] =
    useState<ActiveWorkoutSession | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize storage and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Initialize IndexedDB
        await storage.init();

        // Load existing data
        const [loadedWorkouts, loadedSessions, activeSession] =
          await Promise.all([
            storage.loadWorkouts(),
            storage.loadSessions(),
            storage.loadActiveWorkoutSession(),
          ]);

        setWorkouts(loadedWorkouts);
        setWorkoutSessions(loadedSessions);
        setActiveWorkoutSession(activeSession);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleSaveWorkout = async (
    workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      if (selectedWorkout) {
        // Updating existing workout
        const updatedWorkout: Workout = {
          ...workoutData,
          id: selectedWorkout.id,
          createdAt: selectedWorkout.createdAt,
          updatedAt: new Date(),
        };

        // Save to IndexedDB and update local state
        await storage.saveWorkout(updatedWorkout);
        setWorkouts(prev =>
          prev.map(w => (w.id === updatedWorkout.id ? updatedWorkout : w))
        );
        setSelectedWorkout(null);
        setCurrentView('list');

        // Show success toast for editing
        toast.success('Workout updated successfully!', {
          description: `"${updatedWorkout.name}" has been saved with your changes.`,
        });
      } else {
        // Creating new workout
        const newWorkout: Workout = {
          ...workoutData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Save to IndexedDB and update local state
        await storage.saveWorkout(newWorkout);
        setWorkouts(prev => [newWorkout, ...prev]);
        setCurrentView('list');

        // Show success toast for creation
        toast.success('Workout created successfully!', {
          description: `"${newWorkout.name}" is ready to use.`,
        });
      }
    } catch (err) {
      console.error('Failed to save workout:', err);
      setError('Failed to save workout. Please try again.');

      // Show error toast
      toast.error('Failed to save workout', {
        description: 'Please check your data and try again.',
      });
    }
  };

  const handleViewWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentView('details');
  };

  const handleEditWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setCurrentView('create');
  };

  const handleCancelEdit = () => {
    if (selectedWorkout) {
      setCurrentView('details');
    } else {
      setCurrentView('list');
    }
  };

  const handleStartWorkout = async (workoutId: string) => {
    try {
      const workout = workouts.find(w => w.id === workoutId);
      const newActiveSession: ActiveWorkoutSession = {
        id: crypto.randomUUID(),
        workoutId,
        startedAt: new Date(),
        totalPausedTime: 0,
        completedExercises: [],
        duration: 0,
      };

      await storage.saveActiveWorkoutSession(newActiveSession);
      setActiveWorkoutSession(newActiveSession);
      setCurrentView('active');

      // Show success toast
      toast.success(`Started workout: ${workout?.name || 'Unknown'}`, {
        description: 'Your workout is now active. Good luck!',
      });
    } catch (err) {
      console.error('Failed to start workout:', err);
      setError('Failed to start workout. Please try again.');
      toast.error('Failed to start workout', {
        description: 'Please try again.',
      });
    }
  };

  const handleCompleteWorkout = async (session: WorkoutSession) => {
    try {
      // Get workout name for toast
      const workout = workouts.find(w => w.id === session.workoutId);
      const workoutName = workout?.name || 'Unknown';

      // Calculate completion stats
      const completedExercises = session.exercises.filter(
        ex => ex.completed
      ).length;
      const totalExercises = session.exercises.length;

      // Save session to IndexedDB and update local state
      await storage.saveSession(session);
      setWorkoutSessions(prev => [session, ...prev]);
      // Clear active workout session
      await storage.clearActiveWorkoutSession();
      setActiveWorkoutSession(null);
      setCurrentView('list');

      // Show success toast with completion stats
      toast.success('Workout completed! 🎉', {
        description: `"${workoutName}" finished! Completed ${completedExercises}/${totalExercises} exercises.`,
      });
    } catch (err) {
      console.error('Failed to save workout session:', err);
      setError('Failed to save workout session. Please try again.');

      // Show error toast
      toast.error('Failed to save workout session', {
        description: 'Your progress may not have been saved. Please try again.',
      });
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      // Get workout name before deletion for toast
      const workout = workouts.find(w => w.id === workoutId);
      const workoutName = workout?.name || 'Unknown';

      // Delete from IndexedDB and update local state
      await storage.deleteWorkout(workoutId);
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));

      // If the deleted workout was active, cancel it
      if (activeWorkoutSession?.workoutId === workoutId) {
        await storage.clearActiveWorkoutSession();
        setActiveWorkoutSession(null);
        setCurrentView('list');
      }

      // If the deleted workout was being viewed, go back to list
      if (selectedWorkout?.id === workoutId) {
        setSelectedWorkout(null);
        setCurrentView('list');
      }

      // Show success toast
      toast.success('Workout deleted successfully!', {
        description: `"${workoutName}" has been removed from your workouts.`,
      });
    } catch (err) {
      console.error('Failed to delete workout:', err);
      setError('Failed to delete workout. Please try again.');

      // Show error toast
      toast.error('Failed to delete workout', {
        description: 'Please try again.',
      });
    }
  };

  const handleCancelWorkout = async () => {
    try {
      // Get workout name for toast
      const workout = activeWorkoutSession
        ? workouts.find(w => w.id === activeWorkoutSession.workoutId)
        : null;
      const workoutName = workout?.name || 'workout';

      await storage.clearActiveWorkoutSession();
      setActiveWorkoutSession(null);
      setCurrentView('list');

      // Show info toast for cancellation
      toast.info('Workout ended', {
        description: `Your ${workoutName} session has been ended.`,
      });
    } catch (err) {
      console.error('Failed to cancel workout:', err);
      setError('Failed to cancel workout. Please try again.');

      // Show error toast
      toast.error('Failed to end workout', {
        description: 'Please try again.',
      });
    }
  };

  const handleBackToList = () => {
    setSelectedWorkout(null);
    setCurrentView('list');
  };

  const handleViewChange = (view: ViewMode) => {
    if (view === 'create') {
      setSelectedWorkout(null); // Clear any selected workout for fresh create form
    }
    setCurrentView(view);
  };

  const activeWorkout = activeWorkoutSession
    ? workouts.find(w => w.id === activeWorkoutSession.workoutId)
    : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💪</div>
          <p className="text-muted-foreground">Loading Lift Log...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-lg font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground text-sm mb-4">{error}</p>
              <PrimaryButton onClick={() => window.location.reload()}>
                Reload App
              </PrimaryButton>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return (
          <WorkoutList
            workouts={workouts}
            onStartWorkout={handleStartWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            onViewWorkout={handleViewWorkout}
          />
        );
      case 'create':
        return (
          <WorkoutForm
            onSave={handleSaveWorkout}
            editWorkout={selectedWorkout}
            onCancel={handleCancelEdit}
          />
        );
      case 'details':
        return selectedWorkout ? (
          <WorkoutDetails
            workout={selectedWorkout}
            onEdit={handleEditWorkout}
            onStart={handleStartWorkout}
            onBack={handleBackToList}
          />
        ) : null;
      case 'calendar':
        return (
          <CalendarView
            workouts={workouts}
            workoutSessions={workoutSessions}
            onSelectDate={date => {
              setSelectedDate(date);
              setCurrentView('day');
            }}
            onScheduleWorkout={() => {
              setCurrentView('create');
            }}
          />
        );
      case 'day':
        return (
          <DayView
            selectedDate={selectedDate}
            workouts={workouts}
            workoutSessions={workoutSessions}
            onDateChange={date => {
              setSelectedDate(date);
            }}
            onStartWorkout={handleStartWorkout}
            onScheduleWorkout={() => {
              setCurrentView('create');
            }}
            onBackToCalendar={() => {
              setCurrentView('calendar');
            }}
          />
        );
      case 'active':
        if (activeWorkout && activeWorkoutSession) {
          return (
            <ActiveWorkout
              workout={activeWorkout}
              activeSession={activeWorkoutSession}
              onSessionUpdate={setActiveWorkoutSession}
              onComplete={handleCompleteWorkout}
              onCancel={handleCancelWorkout}
            />
          );
        } else {
          return (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Start a Workout
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Choose a workout to get started:
                  </p>

                  {workouts.length > 0 ? (
                    <Select
                      placeholder="Search and select a workout..."
                      onValueChange={workoutId => handleStartWorkout(workoutId)}
                    >
                      {workouts.map(workout => (
                        <SelectItem key={workout.id} value={workout.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{workout.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {workout.exercises.length} exercise
                              {workout.exercises.length !== 1 ? 's' : ''}
                              {workout.estimatedDuration &&
                                ` • ${workout.estimatedDuration} min`}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No workouts available. Create a workout first!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        }
      default:
        return null;
    }
  };

  const handleResumeWorkout = () => {
    setCurrentView('active');
  };

  const handleEndActiveWorkout = async () => {
    await handleCancelWorkout();
  };

  return (
    <AppSidebarLayout
      currentView={currentView}
      onViewChange={handleViewChange}
      activeWorkoutSession={activeWorkoutSession}
      activeWorkout={activeWorkout}
      onResumeWorkout={handleResumeWorkout}
      onEndWorkout={handleEndActiveWorkout}
    >
      <div className="max-w-4xl mx-auto space-y-6">{renderView()}</div>
    </AppSidebarLayout>
  );
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <AppContent />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
