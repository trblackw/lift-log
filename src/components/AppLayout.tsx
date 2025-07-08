import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/standardButtons';
import { AppSidebarLayout } from './SidebarNavigation';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ThemeProvider } from '../lib/theme';
import { storage } from '../lib/storage';
import { initializeDebugUtils } from '../lib/debug';
import type {
  Workout,
  WorkoutSession,
  ActiveWorkoutSession,
  ViewMode,
} from '../lib/types';
import IconArmFlex from './icons/icon-arm-flex';

// Create a context for sharing data between routes
export const AppContext = React.createContext<{
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
  workoutSessions: WorkoutSession[];
  setWorkoutSessions: React.Dispatch<React.SetStateAction<WorkoutSession[]>>;
  activeWorkoutSession: ActiveWorkoutSession | null;
  setActiveWorkoutSession: React.Dispatch<
    React.SetStateAction<ActiveWorkoutSession | null>
  >;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  isLoading: boolean;
  error: string | null;
  // Action handlers
  handleSaveWorkout: (
    workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>,
    editingWorkout?: Workout
  ) => Promise<void>;
  handleStartWorkout: (workoutId: string) => Promise<void>;
  handleCompleteWorkout: (session: WorkoutSession) => Promise<void>;
  handleDeleteWorkout: (workoutId: string) => Promise<void>;
  handleCancelWorkout: () => Promise<void>;
} | null>(null);

function AppContent() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [activeWorkoutSession, setActiveWorkoutSession] =
    useState<ActiveWorkoutSession | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

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

        // Initialize debug utilities (only in development)
        initializeDebugUtils();
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
    workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>,
    editingWorkout?: Workout
  ) => {
    try {
      if (editingWorkout) {
        // Updating existing workout
        const updatedWorkout: Workout = {
          ...workoutData,
          id: editingWorkout.id,
          createdAt: editingWorkout.createdAt,
          updatedAt: new Date(),
        };

        // Save to IndexedDB and update local state
        await storage.saveWorkout(updatedWorkout);
        setWorkouts(prev =>
          prev.map(w => (w.id === updatedWorkout.id ? updatedWorkout : w))
        );

        // Navigate back to workout details
        navigate(`/workouts/${updatedWorkout.id}`);

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

        // Navigate to workout list
        navigate('/workouts');

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
      navigate('/active');

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

      // Format duration for toast
      const durationText = session.actualDuration
        ? ` in ${Math.floor(session.actualDuration / 60)}m ${session.actualDuration % 60}s`
        : '';

      // Save session to IndexedDB and update local state
      await storage.saveSession(session);
      setWorkoutSessions(prev => [session, ...prev]);

      // Update workout's lastCompleted date
      if (workout && session.completedAt) {
        const updatedWorkout = {
          ...workout,
          lastCompleted: session.completedAt,
          updatedAt: new Date(),
        };
        await storage.saveWorkout(updatedWorkout);
        setWorkouts(prev =>
          prev.map(w => (w.id === workout.id ? updatedWorkout : w))
        );
      }

      // Clear active workout session
      await storage.clearActiveWorkoutSession();
      setActiveWorkoutSession(null);
      navigate('/workouts');

      // Show success toast with completion stats
      toast.success('Workout completed! 🎉', {
        description: `"${workoutName}" finished${durationText}! Completed ${completedExercises}/${totalExercises} exercises.`,
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
        navigate('/workouts');
      }

      // Navigate to workout list if we're viewing the deleted workout
      if (location.pathname.includes(workoutId)) {
        navigate('/workouts');
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
      navigate('/workouts');

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

  // Map current route to view mode for sidebar navigation
  const getCurrentViewFromLocation = (): ViewMode => {
    const pathname = location.pathname;
    if (pathname === '/workouts') return 'list';
    if (pathname === '/workouts/create') return 'create';
    if (pathname.startsWith('/workouts/') && pathname.endsWith('/edit'))
      return 'create';
    if (pathname.startsWith('/workouts/')) return 'details';
    if (pathname === '/active') return 'active';
    if (pathname === '/calendar') return 'calendar';
    if (pathname.startsWith('/calendar/')) return 'day';
    if (pathname === '/history') return 'history';
    return 'list';
  };

  const handleViewChange = (view: ViewMode) => {
    switch (view) {
      case 'list':
        navigate('/workouts');
        break;
      case 'create':
        navigate('/workouts/create');
        break;
      case 'active':
        navigate('/active');
        break;
      case 'calendar':
        navigate('/calendar');
        break;
      case 'history':
        navigate('/history');
        break;
      default:
        navigate('/workouts');
    }
  };

  const activeWorkout = activeWorkoutSession
    ? workouts.find(w => w.id === activeWorkoutSession.workoutId)
    : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">
            <IconArmFlex className="size-10" />
          </div>
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

  const contextValue = {
    workouts,
    setWorkouts,
    workoutSessions,
    setWorkoutSessions,
    activeWorkoutSession,
    setActiveWorkoutSession,
    selectedDate,
    setSelectedDate,
    isLoading,
    error,
    handleSaveWorkout,
    handleStartWorkout,
    handleCompleteWorkout,
    handleDeleteWorkout,
    handleCancelWorkout,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <AppSidebarLayout
        currentView={getCurrentViewFromLocation()}
        onViewChange={handleViewChange}
        activeWorkoutSession={activeWorkoutSession}
        activeWorkout={activeWorkout}
        onResumeWorkout={() => navigate('/active')}
        onEndWorkout={handleCancelWorkout}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <Outlet />
        </div>
      </AppSidebarLayout>
    </AppContext.Provider>
  );
}

export function AppLayout() {
  return (
    <ThemeProvider defaultTheme="system">
      <AppContent />
      <Toaster />
    </ThemeProvider>
  );
}
