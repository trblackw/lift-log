import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/standardButtons';
import { AppSidebarLayout } from './SidebarNavigation';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '../lib/theme';
import { useWorkoutsStore, useSessionsStore, useUIStore } from '../stores';
import { useInitializeApp } from '../hooks/useInitializeApp';
import type { ViewMode } from '../lib/types';
import IconArmFlex from './icons/icon-arm-flex';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize app on mount
  useInitializeApp();

  // Subscribe to store state
  const isAppLoading = useUIStore(state => state.isAppLoading);
  const globalError = useUIStore(state => state.globalError);
  const workouts = useWorkoutsStore(state => state.workouts);
  const activeWorkoutSession = useSessionsStore(
    state => state.activeWorkoutSession
  );
  const cancelWorkout = useSessionsStore(state => state.cancelWorkout);

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
  if (isAppLoading) {
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
  if (globalError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-lg font-semibold mb-2">Error</h2>
              <p className="text-muted-foreground text-sm mb-4">
                {globalError}
              </p>
              <PrimaryButton onClick={() => window.location.reload()}>
                Reload App
              </PrimaryButton>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AppSidebarLayout
      currentView={getCurrentViewFromLocation()}
      onViewChange={handleViewChange}
      activeWorkoutSession={activeWorkoutSession}
      activeWorkout={activeWorkout}
      onResumeWorkout={() => navigate('/active')}
      onEndWorkout={cancelWorkout}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Outlet />
      </div>
    </AppSidebarLayout>
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
