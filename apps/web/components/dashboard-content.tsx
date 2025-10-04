'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Users } from 'lucide-react';

export function DashboardContent() {
  const { data: activeUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['activeUsers'],
    queryFn: () => apiClient.getActiveUsers(),
  });

  const { data: topEvents, isLoading: loadingEvents } = useQuery({
    queryKey: ['topEvents'],
    queryFn: () => apiClient.getTopEvents(5),
  });

  const stats = [
    {
      title: 'Daily Active Users',
      value: activeUsers?.dau || 0,
      icon: Users,
      description: 'Unique users today',
    },
    {
      title: 'Weekly Active Users',
      value: activeUsers?.wau || 0,
      icon: TrendingUp,
      description: 'Unique users this week',
    },
    {
      title: 'Monthly Active Users',
      value: activeUsers?.mau || 0,
      icon: Activity,
      description: 'Unique users this month',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your analytics data
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingUsers ? '...' : stat.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top Events</CardTitle>
          <CardDescription>Most tracked events</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingEvents ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : topEvents && topEvents.length > 0 ? (
            <div className="space-y-4">
              {topEvents.map((event, index) => (
                <div key={event.event} className="flex items-center">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {event.event}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {event.count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No events tracked yet. Start sending events to see data here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
