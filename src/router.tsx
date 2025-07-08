import { createBrowserRouter, redirect } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ActiveWorkoutPage } from './pages/ActiveWorkoutPage';
import { CalendarPage } from './pages/CalendarPage';
import { CreateWorkoutPage } from './pages/CreateWorkoutPage';
import { DayViewPage } from './pages/DayViewPage';
import { EditWorkoutPage } from './pages/EditWorkoutPage';
import { HistoryPage } from './pages/HistoryPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { WorkoutDetailsPage } from './pages/WorkoutDetailsPage';
import { WorkoutListPage } from './pages/WorkoutListPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        loader: () => redirect('/workouts'),
      },
      {
        path: 'workouts',
        element: <WorkoutListPage />,
      },
      {
        path: 'workouts/create',
        element: <CreateWorkoutPage />,
      },
      {
        path: 'workouts/:workoutId',
        element: <WorkoutDetailsPage />,
      },
      {
        path: 'workouts/:workoutId/edit',
        element: <EditWorkoutPage />,
      },
      {
        path: 'active',
        element: <ActiveWorkoutPage />,
      },
      {
        path: 'calendar',
        element: <CalendarPage />,
      },
      {
        path: 'calendar/:date',
        element: <DayViewPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
