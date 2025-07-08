import { useParams, useNavigate } from 'react-router-dom';
import { useWorkoutsStore, useSessionsStore, useUIStore } from '../stores';
import { DayView } from '../components/DayView';
import { buildRoute, ROUTES } from '../lib/routes';
import { parseISO, isValid } from 'date-fns';

export function DayViewPage() {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();

  // Subscribe to store state and actions
  const workouts = useWorkoutsStore(state => state.workouts);
  const workoutSessions = useSessionsStore(state => state.workoutSessions);
  const selectedDate = useUIStore(state => state.selectedDate);
  const setSelectedDate = useUIStore(state => state.setSelectedDate);

  // Parse the date from the URL
  const parsedDate = date ? parseISO(date) : selectedDate;
  const viewDate = isValid(parsedDate) ? parsedDate : selectedDate;

  const handleBackToCalendar = () => {
    navigate(ROUTES.CALENDAR);
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    navigate(buildRoute.calendarDay(newDate));
  };

  return (
    <DayView
      selectedDate={viewDate}
      workouts={workouts}
      workoutSessions={workoutSessions}
      onBackToCalendar={handleBackToCalendar}
      onDateChange={handleDateChange}
    />
  );
}
