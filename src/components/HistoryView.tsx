import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectItem } from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  format,
  subDays,
  subMonths,
  subYears,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
} from 'date-fns';
import type { WorkoutSession } from '@/lib/types';
import IconChart from './icons/icon-chart';

interface HistoryViewProps {
  workoutSessions: WorkoutSession[];
}

type TimeFrame = '1week' | '1month' | '6months' | '1year';

const timeFrameOptions = [
  { value: '1week' as const, label: '1 Week' },
  { value: '1month' as const, label: '1 Month' },
  { value: '6months' as const, label: '6 Months' },
  { value: '1year' as const, label: '1 Year' },
];

const chartConfig = {
  duration: {
    label: 'Workout Duration',
    color: 'var(--chart-1)',
  },
  count: {
    label: 'Workout Count',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function HistoryView({ workoutSessions }: HistoryViewProps) {
  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<TimeFrame>('1week');

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let intervals: Date[];
    let formatKey: string;

    // Determine date range and intervals based on selected time frame
    switch (selectedTimeFrame) {
      case '1week':
        startDate = subDays(now, 7);
        intervals = eachDayOfInterval({ start: startDate, end: now });
        formatKey = 'EEE'; // Mon, Tue, etc.
        break;
      case '1month':
        startDate = subDays(now, 30);
        intervals = eachDayOfInterval({ start: startDate, end: now });
        formatKey = 'MMM d'; // Jan 1, Jan 2, etc.
        break;
      case '6months':
        startDate = subMonths(now, 6);
        intervals = eachWeekOfInterval({
          start: startOfWeek(startDate),
          end: now,
        });
        formatKey = 'MMM d'; // Jan 1, Jan 8, etc.
        break;
      case '1year':
        startDate = subYears(now, 1);
        intervals = eachMonthOfInterval({
          start: startOfMonth(startDate),
          end: now,
        });
        formatKey = 'MMM yyyy'; // Jan 2024, Feb 2024, etc.
        break;
    }

    // Filter sessions within the time range
    const relevantSessions = workoutSessions.filter(session => {
      if (!session.completedAt) return false;
      return isWithinInterval(session.completedAt, {
        start: startDate,
        end: now,
      });
    });

    // Group sessions by time intervals
    const dataPoints = intervals.map(intervalDate => {
      let sessionInInterval: WorkoutSession[];

      if (selectedTimeFrame === '1week' || selectedTimeFrame === '1month') {
        // Daily aggregation
        sessionInInterval = relevantSessions.filter(session => {
          if (!session.completedAt) return false;
          const sessionDate = new Date(session.completedAt);
          return (
            sessionDate.getFullYear() === intervalDate.getFullYear() &&
            sessionDate.getMonth() === intervalDate.getMonth() &&
            sessionDate.getDate() === intervalDate.getDate()
          );
        });
      } else if (selectedTimeFrame === '6months') {
        // Weekly aggregation
        const weekStart = startOfWeek(intervalDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        sessionInInterval = relevantSessions.filter(session => {
          if (!session.completedAt) return false;
          return isWithinInterval(session.completedAt, {
            start: weekStart,
            end: weekEnd,
          });
        });
      } else {
        // Monthly aggregation
        const monthStart = startOfMonth(intervalDate);
        const monthEnd = endOfMonth(intervalDate);

        sessionInInterval = relevantSessions.filter(session => {
          if (!session.completedAt) return false;
          return isWithinInterval(session.completedAt, {
            start: monthStart,
            end: monthEnd,
          });
        });
      }

      const totalDurationSeconds = sessionInInterval.reduce((sum, session) => {
        return sum + (session.actualDuration || 0);
      }, 0);

      const avgDurationSeconds =
        sessionInInterval.length > 0
          ? Math.round(totalDurationSeconds / sessionInInterval.length)
          : 0;

      return {
        date: format(intervalDate, formatKey),
        fullDate: intervalDate,
        duration: Math.round(avgDurationSeconds / 60), // Convert to minutes for chart display
        totalDuration: totalDurationSeconds,
        count: sessionInInterval.length,
        sessions: sessionInInterval,
      };
    });

    return dataPoints;
  }, [workoutSessions, selectedTimeFrame]);

  const stats = useMemo(() => {
    const totalSessions = chartData.reduce(
      (sum, point) => sum + point.count,
      0
    );
    const totalDurationSeconds = chartData.reduce(
      (sum, point) => sum + point.totalDuration,
      0
    );
    // Convert seconds to minutes for display
    const totalDuration = Math.round(totalDurationSeconds / 60);
    const avgDuration =
      totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
    const maxDurationSeconds = Math.max(
      ...chartData.map(point => point.duration),
      0
    );
    const maxDuration = Math.round(maxDurationSeconds / 60);

    return {
      totalSessions,
      totalDuration,
      avgDuration,
      maxDuration,
    };
  }, [chartData]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const hasData = stats.totalSessions > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Workout History</h1>
          <p className="text-muted-foreground">
            Track your workout trends over time
          </p>
        </div>

        <div className="w-40">
          <Label htmlFor="timeframe" className="sr-only">
            Time Frame
          </Label>
          <Select
            value={selectedTimeFrame}
            onValueChange={(value: TimeFrame) => setSelectedTimeFrame(value)}
            searchable={false}
          >
            {timeFrameOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {stats.totalSessions}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Workouts
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {formatDuration(stats.totalDuration)}
              </div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {formatDuration(stats.avgDuration)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {formatDuration(stats.maxDuration)}
              </div>
              <div className="text-sm text-muted-foreground">
                Longest Workout
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Duration Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Average Workout Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatDuration}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={value => [
                          formatDuration(value as number),
                          'Duration',
                        ]}
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="duration"
                    stroke="var(--color-duration)"
                    strokeWidth={2}
                    dot={{
                      fill: 'var(--color-duration)',
                      strokeWidth: 2,
                      r: 4,
                    }}
                    activeDot={{
                      r: 6,
                      stroke: 'var(--color-duration)',
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Workout Count Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Workout Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={value => [value, 'Workouts']}
                      />
                    }
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="text-6xl mb-4 flex items-center justify-center gap-2">
                <IconChart className="size-9" />
                <h2 className="text-xl font-semibold">No Workout Data</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Complete some workouts to see your progress here!
              </p>
              <p className="text-sm text-muted-foreground">
                Charts will appear once you have completed workouts in the
                selected time frame.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
