import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../components/AppLayout';
import { CalendarView } from '../components/CalendarView';
import { format } from 'date-fns';

export function CalendarPage() {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('CalendarPage must be used within AppLayout');
  }

  const { workouts, workoutSessions, selectedDate, setSelectedDate } = context;

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
