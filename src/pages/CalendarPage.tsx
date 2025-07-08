import { useNavigate } from 'react-router-dom';
import { useWorkoutsStore, useSessionsStore, useUIStore } from '../stores';
import { CalendarView } from '../components/CalendarView';
import { format } from 'date-fns';

export function CalendarPage() {
  const navigate = useNavigate();

  // Subscribe to store state and actions
  const workouts = useWorkoutsStore(state => state.workouts);
  const workoutSessions = useSessionsStore(state => state.workoutSessions);
  const setSelectedDate = useUIStore(state => state.setSelectedDate);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    navigate(`/calendar/${format(date, 'yyyy-MM-dd')}`);
  };

  return (
    <CalendarView
      workouts={workouts}
      workoutSessions={workoutSessions}
      onSelectDate={handleDateSelect}
    />
  );
}
