import { createBrowserRouter, redirect } from 'react-router-dom';
import { ROUTES, PATHS } from './lib/routes';
import { AppLayout } from './components/AppLayout';
import { ActiveWorkoutPage } from './pages/ActiveWorkoutPage';
import { CalendarPage } from './pages/CalendarPage';
import { ComposerPage } from './pages/ComposerPage';
import { CreateWorkoutPage } from './pages/CreateWorkoutPage';
import { DayViewPage } from './pages/DayViewPage';
import { EditWorkoutPage } from './pages/EditWorkoutPage';
import { HistoryPage } from './pages/HistoryPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkoutDetailsPage } from './pages/WorkoutDetailsPage';
import { WorkoutListPage } from './pages/WorkoutListPage';

export const router = createBrowserRouter([
  {
    path: ROUTES.ROOT,
    element: <AppLayout />,
    children: [
      {
        index: true,
        loader: () => redirect(ROUTES.WORKOUTS),
      },
      {
        path: PATHS.WORKOUTS,
        element: <WorkoutListPage />,
      },
      {
        path: `${PATHS.WORKOUTS}/${PATHS.CREATE}`,
        element: <CreateWorkoutPage />,
      },
      {
        path: `${PATHS.WORKOUTS}/${PATHS.WORKOUT_ID}`,
        element: <WorkoutDetailsPage />,
      },
      {
        path: `${PATHS.WORKOUTS}/${PATHS.WORKOUT_ID}/${PATHS.EDIT}`,
        element: <EditWorkoutPage />,
      },
      {
        path: PATHS.COMPOSER,
        element: <ComposerPage />,
      },
      {
        path: PATHS.ACTIVE,
        element: <ActiveWorkoutPage />,
      },
      {
        path: PATHS.CALENDAR,
        element: <CalendarPage />,
      },
      {
        path: `${PATHS.CALENDAR}/${PATHS.DATE}`,
        element: <DayViewPage />,
      },
      {
        path: PATHS.HISTORY,
        element: <HistoryPage />,
      },
      {
        path: PATHS.SETTINGS,
        element: <SettingsPage />,
      },
      {
        path: ROUTES.NOT_FOUND,
        element: <NotFoundPage />,
      },
    ],
  },
]);
