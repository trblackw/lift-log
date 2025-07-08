import React from 'react';
import { Settings } from '../components/Settings';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your app preferences and configuration
        </p>
      </div>

      <Settings />
    </div>
  );
}
