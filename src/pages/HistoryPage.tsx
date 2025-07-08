import React, { useContext } from 'react';
import { AppContext } from '../components/AppLayout';
import { HistoryView } from '../components/HistoryView';

export function HistoryPage() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('HistoryPage must be used within AppLayout');
  }

  const { workoutSessions } = context;

  return <HistoryView workoutSessions={workoutSessions} />;
}
