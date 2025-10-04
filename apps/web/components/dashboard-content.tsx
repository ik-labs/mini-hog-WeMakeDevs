'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect } from 'react';

export function DashboardContent() {
  const { data: activeUsers, isLoading: loadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['activeUsers'],
    queryFn: () => apiClient.getActiveUsers(),
  });

  const { data: topEvents, isLoading: loadingEvents, refetch: refetchEvents } = useQuery({
    queryKey: ['topEvents'],
    queryFn: () => apiClient.getTopEvents(5),
  });

  const { data: trends, isLoading: loadingTrends, refetch: refetchTrends } = useQuery({
    queryKey: ['trends'],
    queryFn: () => apiClient.getTrends({ interval: 'hour' }),
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchUsers();
      refetchEvents();
      refetchTrends();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchUsers, refetchEvents, refetchTrends]);

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
              {loadingUsers ? (
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stat.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events Trend Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Events Over Time</CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTrends ? (
            <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
          ) : trends && trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
              No trend data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top Events</CardTitle>
          <CardDescription>Most tracked events</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingEvents ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="ml-auto h-4 w-12 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : topEvents && topEvents.length > 0 ? (
            <div className="space-y-4">
              {topEvents.map((event) => (
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
