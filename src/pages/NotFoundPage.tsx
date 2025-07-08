import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton, OutlineButton } from '@/components/ui/standardButtons';
import Icon404 from '../components/icons/icon-404';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4 flex items-center justify-center">
            <Icon404 className="size-15 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or doesn't exist.
          </p>
          <div className="space-y-3">
            <Link to="/workouts" className="block">
              <PrimaryButton className="w-full">Go to Workouts</PrimaryButton>
            </Link>
            <Link to="/calendar" className="block">
              <OutlineButton className="w-full">View Calendar</OutlineButton>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
