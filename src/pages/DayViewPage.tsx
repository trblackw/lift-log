import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../components/AppLayout';
import { DayView } from '../components/DayView';
import { parseISO, isValid } from 'date-fns';

export function DayViewPage() {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();

  if (!context) {
    throw new Error('DayViewPage must be used within AppLayout');
  }

  const { workouts, workoutSessions, selectedDate, setSelectedDate } = context;

  // Parse the date from the URL
  const parsedDate = date ? parseISO(date) : selectedDate;
  const viewDate = isValid(parsedDate) ? parsedDate : selectedDate;

  const handleBackToCalendar = () => {
    navigate('/calendar');
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    navigate(`/calendar/${newDate.toISOString().split('T')[0]}`);
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
