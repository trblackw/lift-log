import React from 'react';
import { useSessionsStore } from '../stores';
import { HistoryView } from '../components/HistoryView';

export function HistoryPage() {
  // Subscribe to store state
  const workoutSessions = useSessionsStore(state => state.workoutSessions);

  return <HistoryView workoutSessions={workoutSessions} />;
}
